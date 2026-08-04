const Attempt = require('../models/Attempt');
const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { serializeAttempt } = require('../utils/serialize');
const { generateHint, generateExplain, chatWithAi } = require('../services/geminiService');
const { startSession, terminateRunning } = require('../services/sessionService');

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
      .populate('task', 'title scenario objectives difficulty points estimatedMinutes validationRules')
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
      try {
        hint = await generateHint(task, attempt, null);
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
    const explanation = await generateExplain(task, null);
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

    const history = attempt.aiChat || [];
    const reply = await chatWithAi(task, attempt, history, message, null);

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
    const task = await Task.findById(attempt.task);
    if (!task) throw new HttpError(404, 'Task not found');

    const checks = (task.validationRules || []).map((rule, index) => ({
      index,
      label: rule.label,
      type: rule.type,
      passed: false,
      actual: 'awaiting Killercoda submission',
    }));
    return {
      checks,
      passedCount: 0,
      totalRules: checks.length,
      updatedAt: new Date().toISOString(),
    };
  });

  app.post('/:id/submit', { preHandler: [requireAuth] }, async (req) => {
    throw new HttpError(400, 'Grading is done via Killercoda. Use the Start practical button to begin a lab.');
  });

  app.post('/:id/exit', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await findOwnAttempt(req);
    if (attempt.status === 'running') {
      attempt.status = 'terminated';
      await attempt.save();
    }
    return { ok: true };
  });

  app.post('/:taskId/practice-again', { preHandler: [requireAuth] }, async (req) => {
    await terminateRunning(req.userId, req.params.taskId);
    const { attempt, resumed } = await startSession(req.userId, req.params.taskId);

    const { signKcToken } = require('./killercoda');
    const kcToken = await signKcToken({
      typ: 'killercoda',
      sub: req.userId,
      attemptId: attempt._id.toString(),
      taskId: attempt.task.toString(),
    });

    return { attempt: serializeAttempt(attempt), resumed, kcToken };
  });
};
