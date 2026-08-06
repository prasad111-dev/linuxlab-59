const Attempt = require('../models/Attempt');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { serializeAttempt } = require('../utils/serialize');
const { evaluateAttempt, buildRuleCommand, runLiveChecks } = require('../services/evaluationService');
const { generateHint, generateExplain, chatWithAi } = require('../services/geminiService');
const { checkAndUnlock } = require('../services/achievementService');
const { startSession, terminateRunning } = require('../services/sessionService');
const orchestrator = require('../services/orchestratorClient');

async function findOwnAttempt(req, { running = false } = {}) {
  const filter = { _id: req.params.id || req.params.attemptId, user: req.userId };
  if (running) filter.status = 'running';
  const attempt = await Attempt.findOne(filter);
  if (!attempt) throw new HttpError(404, running ? 'No active session for this attempt' : 'Attempt not found');
  return attempt;
}

module.exports = async function attemptRoutes(app) {
  app.get('/', { preHandler: [requireAuth] }, async (req) => {
    const attempts = await Attempt.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('task', 'title difficulty points estimatedMinutes')
      .populate('category', 'name slug icon color');
    return attempts.map(serializeAttempt);
  });

  app.get('/:id', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await Attempt.findById(req.params.id)
      .populate('task', 'title scenario objectives difficulty points estimatedMinutes')
      .populate('category', 'name slug icon color');
    if (!attempt) throw new HttpError(404, 'Attempt not found');
    if (attempt.user.toString() !== req.userId && req.userRole !== 'admin') {
      throw new HttpError(403, 'Forbidden');
    }
    const showSolution = attempt.passed || req.userRole === 'admin';
    return { ...serializeAttempt(attempt), showSolution };
  });

  app.post('/:id/hint', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await findOwnAttempt(req, { running: true });
    const task = await Task.findById(attempt.task).populate('category');
    if (!task) throw new HttpError(404, 'Task not found');

    let hint;
    if (attempt.hintsUsed < (task.hints || []).length) {
      hint = task.hints[attempt.hintsUsed];
    } else {
      const live = attempt.containerId
        ? await runLiveChecks(task, attempt.containerId).catch(() => null)
        : null;
      try {
        hint = await generateHint(task, attempt, live);
      } catch {
        hint = 'No more hints available. Review your man pages and check each requirement one by one.';
      }
    }
    attempt.hintsUsed += 1;
    await attempt.save();
    return { hint, level: attempt.hintsUsed };
  });

  app.post('/:id/explain', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await findOwnAttempt(req, { running: true });
    const task = await Task.findById(attempt.task).populate('category');
    if (!task) throw new HttpError(404, 'Task not found');
    const live = attempt.containerId
      ? await runLiveChecks(task, attempt.containerId).catch(() => null)
      : null;
    const explanation = await generateExplain(task, live);
    attempt.explainUsed += 1;
    await attempt.save();
    return { explanation };
  });

  app.post('/:id/chat', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await findOwnAttempt(req, { running: true });
    const task = await Task.findById(attempt.task).populate('category');
    if (!task) throw new HttpError(404, 'Task not found');
    const message = String(req.body?.message || '').trim().slice(0, 1000);
    if (!message) throw new HttpError(400, 'message is required');

    const live = attempt.containerId
      ? await runLiveChecks(task, attempt.containerId).catch(() => null)
      : null;
    const history = attempt.aiChat || [];

    const reply = await chatWithAi(task, attempt, history, message, live);

    attempt.aiChat = history.concat([
      { role: 'user', text: message, at: new Date() },
      { role: 'assistant', text: reply, at: new Date() },
    ]);
    if (attempt.aiChat.length > 40) attempt.aiChat = attempt.aiChat.slice(-40);
    await attempt.save();

    return { reply, history: attempt.aiChat };
  });

  app.get('/:id/live-check', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await findOwnAttempt(req, { running: true });
    const task = await Task.findById(attempt.task).populate('category');
    if (!task) throw new HttpError(404, 'Task not found');
    if (!attempt.containerId) {
      return {
        checks: (task.validationRules || []).map((r, i) => ({
          index: i, label: r.label, type: r.type, passed: false, actual: 'container not ready',
        })),
        passedCount: 0,
        totalRules: (task.validationRules || []).length,
        updatedAt: new Date().toISOString(),
      };
    }

    return runLiveChecks(task, attempt.containerId);
  });

  app.post('/:id/submit', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await findOwnAttempt(req, { running: true });
    const task = await Task.findById(attempt.task).populate('category');
    if (!task) throw new HttpError(404, 'Task not found');

    const result = await evaluateAttempt(attempt, task);

    attempt.status = 'evaluated';
    attempt.score = result.score;
    attempt.maxScore = result.maxScore;
    attempt.passed = result.passed;
    attempt.timeTakenSeconds = result.timeTakenSeconds;
    attempt.feedback = result.feedback;
    attempt.optimization = result.optimization;
    attempt.correctSolution = result.correctSolution;
    attempt.mistakes = result.mistakes;
    attempt.rulesSummary = result.rulesSummary;
    attempt.recommendedNext = result.recommendedNext;
    attempt.submittedAt = new Date();
    attempt.evaluation = result.evaluation;
    await attempt.save();

    // Points: only the improvement over the previous best counts
    const prev = await Attempt.findOne({
      user: attempt.user,
      task: attempt.task,
      _id: { $ne: attempt._id },
    })
      .sort({ score: -1 })
      .select('score');
    const prevBest = prev ? prev.score : 0;
    const delta = Math.max(0, result.score - prevBest);

    attempt.pointsAwarded = delta;
    await attempt.save();

    const user = await User.findById(attempt.user);
    if (user && delta > 0) {
      user.points += delta;
      await user.save();
    }

    // Container is done — destroy it (ephemeral environment)
    if (attempt.containerId) {
      await orchestrator.destroyContainer(attempt.containerId).catch(() => {});
    }

    // Achievements + notification
    let newlyUnlocked = [];
    if (user) {
      const passedAttempts = await Attempt.find({ user: user._id, passed: true })
        .select('category score maxScore timeTakenSeconds')
        .lean();
      const ctx = {
        tasksCompleted: passedAttempts.length,
        perfectScore: passedAttempts.some((a) => a.maxScore > 0 && a.score === a.maxScore),
        fastLearner: result.passed && result.timeTakenSeconds <= (task.estimatedMinutes || 0) * 30,
        categoriesCount: new Set(
          passedAttempts.map((a) => a.category && a.category.toString()).filter(Boolean)
        ).size,
      };
      newlyUnlocked = await checkAndUnlock(user, ctx);
    }

    await Notification.create({
      user: attempt.user,
      type: 'task_completed',
      title: `${result.passed ? 'Practical completed' : 'Practical attempted'}: ${task.title}`,
      body: `You scored ${result.score}/${result.maxScore}.`,
      data: { attemptId: attempt._id.toString(), passed: result.passed },
    });

    return {
      result,
      attempt: serializeAttempt(attempt),
      newlyUnlocked: newlyUnlocked.map((a) => a.code),
      pointsAwarded: delta,
    };
  });

  app.post('/:id/exit', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await findOwnAttempt(req);
    if (attempt.status === 'running') {
      if (attempt.containerId) {
        await orchestrator.destroyContainer(attempt.containerId).catch(() => {});
      }
      attempt.status = 'terminated';
      await attempt.save();
    }
    return { ok: true };
  });

  app.post('/:taskId/practice-again', { preHandler: [requireAuth] }, async (req) => {
    await terminateRunning(req.userId, req.params.taskId);
    const { attempt, resumed } = await startSession(req.userId, req.params.taskId);
    return { attempt: serializeAttempt(attempt), resumed };
  });
};
