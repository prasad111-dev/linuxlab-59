const InterviewSession = require('../models/InterviewSession');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { generateInterviewReport } = require('../services/geminiService');

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

module.exports = async function interviewRoutes(app) {
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

  app.post('/sessions', { preHandler: [requireAuth] }, async (req) => {
    const body = req.body || {};
    const mode = String(body.mode || '').trim();
    if (!['flashcard', 'quest', 'typing'].includes(mode)) {
      throw new HttpError(400, 'mode must be flashcard, quest or typing');
    }
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

    return session.toSafeJSON();
  });
};
