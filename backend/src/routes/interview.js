const InterviewSession = require('../models/InterviewSession');
const InterviewProgress = require('../models/InterviewProgress');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { isInterviewMode } = require('../constants/interviewModes');
const { updateStreak } = require('../services/streakService');
const {
  generateInterviewReport,
  generateInterviewQuestions,
  gradeInterviewAnswer,
  evaluateCommandAnswer,
} = require('../services/geminiService');

function computeWeakTopics(answers) {
  const byTopic = {};
  for (const a of answers || []) {
    const topic = (a.topic || 'Linux').trim() || 'Linux';
    byTopic[topic] = byTopic[topic] || { total: 0, correct: 0 };
    byTopic[topic].total += 1;
    if (a.correct) byTopic[topic].correct += 1;
  }
  return Object.entries(byTopic)
    .filter(([, s]) => s.total >= 1 && s.correct / s.total < 0.6)
    .map(([topic]) => topic);
}

function clampAnswers(answers) {
  if (!Array.isArray(answers)) return [];
  return answers.slice(0, 400).map((a) => ({
    prompt: String(a.prompt || '').slice(0, 300),
    answer: String(a.answer || '').slice(0, 300),
    userAnswer: String(a.userAnswer || '').slice(0, 300),
    correct: Boolean(a.correct),
    topic: String(a.topic || '').slice(0, 80),
  }));
}

function clampProgressData(data, mode) {
  if (!data || typeof data !== 'object') return {};
  const out = { ...data };
  if (Array.isArray(out.answers)) out.answers = clampAnswers(out.answers);
  if (Array.isArray(out.log)) {
    out.log = out.log.slice(0, 400).map((l) => ({
      cmd: String(l.cmd || '').slice(0, 200),
      typed: String(l.typed || '').slice(0, 200),
      correct: Boolean(l.correct),
      errors: Math.max(0, Math.floor(Number(l.errors) || 0)),
    }));
  }
  if (typeof out.tierIndex !== 'undefined') out.tierIndex = Math.max(0, Math.floor(Number(out.tierIndex) || 0));
  if (typeof out.cardIndex !== 'undefined') out.cardIndex = Math.max(0, Math.floor(Number(out.cardIndex) || 0));
  if (typeof out.elapsedMs !== 'undefined') out.elapsedMs = Math.max(0, Math.floor(Number(out.elapsedMs) || 0));
  return out;
}

module.exports = async function interviewRoutes(app) {
  const validMode = (mode) => {
    if (!isInterviewMode(mode)) throw new HttpError(400, `unknown mode "${mode}"`);
    return String(mode).trim();
  };

  app.get('/progress/:mode', { preHandler: [requireAuth] }, async (req) => {
    const mode = validMode(req.params.mode);
    const progress = await InterviewProgress.findOne({ user: req.userId, mode });
    return progress ? progress.toSafeJSON() : { id: null, mode, data: {}, updatedAt: null };
  });

  app.put('/progress/:mode', { preHandler: [requireAuth] }, async (req) => {
    const mode = validMode(req.params.mode);
    const data = clampProgressData(req.body?.data || req.body || {}, mode);
    const progress = await InterviewProgress.findOneAndUpdate(
      { user: req.userId, mode },
      { $set: { data, updatedAt: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return progress.toSafeJSON();
  });

  app.delete('/progress/:mode', { preHandler: [requireAuth] }, async (req) => {
    const mode = validMode(req.params.mode);
    await InterviewProgress.deleteOne({ user: req.userId, mode });
    return { ok: true };
  });

  app.get('/sessions', { preHandler: [requireAuth] }, async (req) => {
    const sessions = await InterviewSession.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return sessions.map((s) => s.toSafeJSON());
  });

  app.get('/sessions/:id', { preHandler: [requireAuth] }, async (req) => {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) throw new HttpError(404, 'Interview session not found');
    if (session.user.toString() !== req.userId && req.userRole !== 'admin') {
      throw new HttpError(403, 'Forbidden');
    }
    return session.toSafeJSON();
  });

  // Gemini-powered question generator: fresh questions for any drill mode.
  // Body: { mode, topic?, count? } — mode determines the JSON shape returned
  // (command / mcq / free) so the frontend can render them directly.
  app.post('/questions/generate', { preHandler: [requireAuth] }, async (req) => {
    const body = req.body || {};
    const mode = validMode(String(body.mode || '').trim());
    const questions = await generateInterviewQuestions(mode, {
      topic: String(body.topic || '').slice(0, 80),
      count: Math.floor(Number(body.count) || 5),
    });
    return { mode, questions };
  });

  // Gemini free-answer grading for interview-simulation style drills.
  // Body: { question: {prompt, topic?, model?}, answer }.
  app.post('/grade', { preHandler: [requireAuth] }, async (req) => {
    const body = req.body || {};
    const question = body.question && typeof body.question === 'object' ? body.question : {};
    if (!question.prompt) throw new HttpError(400, 'question.prompt is required');
    if (!body.answer) throw new HttpError(400, 'answer is required');
    const result = await gradeInterviewAnswer(
      {
        prompt: String(question.prompt).slice(0, 300),
        topic: String(question.topic || 'Linux').slice(0, 80),
        model: String(question.model || '').slice(0, 300),
      },
      String(body.answer).slice(0, 1200)
    );
    return result;
  });

  // AI verdict on a typed command — accepts any valid approach, not just the
  // canonical command. Body: { question: {prompt, answer?, topic?}, answer }.
  // Falls back to exact-match on the client when Gemini is unavailable.
  app.post('/evaluate-command', { preHandler: [requireAuth] }, async (req) => {
    const body = req.body || {};
    const question = body.question && typeof body.question === 'object' ? body.question : {};
    if (!question.prompt) throw new HttpError(400, 'question.prompt is required');
    if (!body.answer) throw new HttpError(400, 'answer is required');
    return evaluateCommandAnswer(
      {
        prompt: String(question.prompt).slice(0, 300),
        answer: String(question.answer || '').slice(0, 300),
        topic: String(question.topic || 'Linux').slice(0, 80),
      },
      String(body.answer).slice(0, 1200)
    );
  });

  app.post('/sessions', { preHandler: [requireAuth] }, async (req) => {
    const body = req.body || {};
    const mode = validMode(String(body.mode || '').trim());
    const answers = clampAnswers(body.answers);
    const maxScore = Number(body.maxScore) || answers.length || 0;
    const score = Math.min(Number(body.score) || 0, maxScore);
    const accuracy = answers.length
      ? Math.round((answers.filter((a) => a.correct).length / answers.length) * 100)
      : maxScore
        ? Math.round((score / maxScore) * 100)
        : 0;
    const weakTopics = computeWeakTopics(answers);

    const session = await InterviewSession.create({
      user: req.userId,
      mode,
      score,
      maxScore,
      accuracy,
      timeTakenSeconds: Math.max(0, Math.floor(Number(body.timeTakenSeconds) || 0)),
      wpm: Math.max(0, Math.round(Number(body.wpm) || 0)),
      answers,
      weakTopics,
      finished: body.finished !== false,
      finishedAt: body.finished === false ? null : new Date(),
    });

    if (body.finished !== false) {
      await InterviewProgress.deleteOne({ user: req.userId, mode });
    }

    let aiReport = '';
    try {
      aiReport = await generateInterviewReport(session);
    } catch {
      aiReport =
        'The AI coach is unavailable right now. Your score is saved — review your mistakes below and retry ' +
        'to get a personalized analysis.';
    }
    session.aiReport = aiReport;
    await session.save();

    // Practice counts toward the daily streak, not just logging in
    const user = await User.findById(req.userId);
    if (user) {
      updateStreak(user, new Date());
      await user.save();
    }

    return session.toSafeJSON();
  });
};
