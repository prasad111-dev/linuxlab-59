const { SignJWT, jwtVerify } = require('jose');
const Attempt = require('../models/Attempt');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { HttpError } = require('../utils/httpError');
const { serializeAttempt } = require('../utils/serialize');
const { callGemini } = require('../services/geminiService');
const { checkAndUnlock } = require('../services/achievementService');
const config = require('../config');

const KC_BASE = 'https://killercoda.com';

async function proxyKillercoda(scenarioPath) {
  const url = `${KC_BASE}${scenarioPath}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LinuxLab/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) return null;

  let html = await res.text();

  html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${KC_BASE}/">`);

  return html;
}

function kcSecret() {
  return new TextEncoder().encode(config.jwtSecret);
}

async function signKcToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(kcSecret());
}

async function verifyKcToken(token) {
  try {
    const { payload } = await jwtVerify(token, kcSecret());
    if (payload.typ !== 'killercoda') throw new Error('wrong type');
    return payload;
  } catch {
    throw new HttpError(401, 'Invalid or expired Killercoda session token');
  }
}

async function killercodaRoutes(app) {
  app.get('/proxy', async (req, reply) => {
    const { path, token } = req.query || {};
    if (!path) throw new HttpError(400, 'path is required');

    let kcPath = path;
    if (token) {
      kcPath += (kcPath.includes('?') ? '&' : '?') + `LINUXLAB_TOKEN=${encodeURIComponent(token)}`;
    }

    const html = await proxyKillercoda(kcPath);
    if (!html) throw new HttpError(502, 'Could not fetch from Killercoda');

    reply.header('Content-Type', 'text/html; charset=utf-8');
    reply.header('X-Frame-Options', 'ALLOWALL');
    reply.header('Cache-Control', 'no-store');
    reply.send(html);
  });

  app.post('/register', async (req) => {
    const { token } = req.body || {};
    if (!token) throw new HttpError(400, 'token is required');

    const payload = await verifyKcToken(token);
    const attempt = await Attempt.findOne({
      _id: payload.attemptId,
      user: payload.sub,
      status: 'running',
    });
    if (!attempt) throw new HttpError(404, 'No running attempt found for this token');

    return { ok: true, attemptId: attempt._id.toString() };
  });

  app.post('/submit', async (req) => {
    const { token, results } = req.body || {};
    if (!token) throw new HttpError(400, 'token is required');

    const payload = await verifyKcToken(token);
    const attempt = await Attempt.findOne({
      _id: payload.attemptId,
      user: payload.sub,
      status: 'running',
    });
    if (!attempt) throw new HttpError(404, 'No running attempt found for this token');

    const task = await Task.findById(attempt.task).populate('category');
    if (!task) throw new HttpError(404, 'Task not found');

    if (!Array.isArray(results) || results.length === 0) {
      throw new HttpError(400, 'results array is required');
    }

    const totalRules = results.length;
    const passedCount = results.filter((r) => r.passed).length;
    const score = totalRules ? Math.round((passedCount / totalRules) * task.points) : 0;
    const maxScore = task.points;
    const passed = maxScore > 0 && score / maxScore >= config.passMark / 100;
    const timeTakenSeconds = Math.max(
      1,
      Math.round((Date.now() - attempt.startedAt.getTime()) / 1000)
    );

    const mistakes = results.filter((r) => !r.passed).map((r) => ({
      label: r.label,
      passed: false,
      expected: r.label,
      actual: 'check failed',
    }));

    const rulesSummary = results.map((r) => `${r.passed ? '✅' : '❌'} ${r.label}`).join('\n');

    let feedback =
      mistakes.length === 0
        ? 'Excellent work! Every validation check passed. Your configuration is correct and production-ready.'
        : `You passed ${passedCount} of ${totalRules} checks. Review the failed checks below and retry.`;

    let optimization = '';
    if (config.gemini.apiKey) {
      try {
        optimization = await callGemini(
          'You are a senior Linux administrator giving feedback to a student in a Linux lab. ' +
            'Be concise (max 120 words). Do NOT provide the full solution — give a pointer and best practices.',
          `Task: ${task.title}\nScenario: ${task.scenario}\n` +
            `Checks:\n${rulesSummary}\n\n` +
            `Give brief feedback on what likely went wrong and the best practice for this task.`,
          { temperature: 0.4, maxTokens: 600 }
        );
      } catch {
        /* graceful */
      }
    }
    if (!optimization) {
      optimization =
        mistakes.length === 0
          ? 'Keep going! Consider writing your commands into repeatable scripts.'
          : 'Tip: review the failed checks, read the relevant man pages, and verify each objective one at a time.';
    }

    const recommendedNext = await Task.findOne({
      _id: { $ne: task._id },
      category: task.category,
      status: 'published',
    })
      .sort({ points: 1 })
      .select('_id title')
      .lean();

    attempt.status = 'evaluated';
    attempt.score = score;
    attempt.maxScore = maxScore;
    attempt.passed = passed;
    attempt.pointsAwarded = score;
    attempt.timeTakenSeconds = timeTakenSeconds;
    attempt.feedback = `${feedback}\n${rulesSummary}`;
    attempt.optimization = optimization;
    attempt.correctSolution = task.solution || '';
    attempt.mistakes = mistakes;
    attempt.rulesSummary = rulesSummary;
    attempt.recommendedNext = recommendedNext
      ? { taskId: recommendedNext._id.toString(), title: recommendedNext.title }
      : null;
    attempt.submittedAt = new Date();
    attempt.evaluation = { results, passedCount, totalRules };
    await attempt.save();

    const prev = await Attempt.findOne({
      user: attempt.user,
      task: attempt.task,
      _id: { $ne: attempt._id },
    })
      .sort({ score: -1 })
      .select('score');
    const prevBest = prev ? prev.score : 0;
    const delta = Math.max(0, score - prevBest);

    const user = await User.findById(attempt.user);
    if (user && delta > 0) {
      user.points += delta;
      await user.save();
    }

    let newlyUnlocked = [];
    if (user) {
      const passedAttempts = await Attempt.find({ user: user._id, passed: true })
        .select('category score maxScore timeTakenSeconds')
        .lean();
      const ctx = {
        tasksCompleted: passedAttempts.length,
        perfectScore: passedAttempts.some((a) => a.maxScore > 0 && a.score === a.maxScore),
        fastLearner: passed && timeTakenSeconds <= (task.estimatedMinutes || 0) * 30,
        categoriesCount: new Set(
          passedAttempts.map((a) => a.category && a.category.toString()).filter(Boolean)
        ).size,
      };
      newlyUnlocked = await checkAndUnlock(user, ctx);
    }

    await Notification.create({
      user: attempt.user,
      type: 'task_completed',
      title: `${passed ? 'Practical completed' : 'Practical attempted'}: ${task.title}`,
      body: `You scored ${score}/${maxScore}.`,
      data: { attemptId: attempt._id.toString(), passed },
    });

    return {
      result: {
        score,
        maxScore,
        passed,
        timeTakenSeconds,
        mistakes,
        rulesSummary,
        feedback: `${feedback}\n${rulesSummary}`,
        optimization,
        correctSolution: task.solution || '',
        recommendedNext: recommendedNext
          ? { taskId: recommendedNext._id.toString(), title: recommendedNext.title }
          : null,
        evaluation: { results, passedCount, totalRules },
      },
      attempt: serializeAttempt(attempt),
      newlyUnlocked: newlyUnlocked.map((a) => a.code),
      pointsAwarded: delta,
    };
  });
}

module.exports = { killercodaRoutes, signKcToken };
