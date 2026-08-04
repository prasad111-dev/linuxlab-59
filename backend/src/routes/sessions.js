const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { serializeAttempt } = require('../utils/serialize');
const { startSession } = require('../services/sessionService');
const orchestrator = require('../services/orchestratorClient');
const Attempt = require('../models/Attempt');

module.exports = async function sessionRoutes(app) {
  app.post(
    '/start',
    { preHandler: [requireAuth], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req) => {
      const { taskId } = req.body || {};
      if (!taskId) throw new HttpError(400, 'taskId is required');
      const { attempt, resumed } = await startSession(req.userId, taskId);
      return { attempt: serializeAttempt(attempt), resumed };
    }
  );

  app.get('/:attemptId', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await Attempt.findOne({ _id: req.params.attemptId, user: req.userId });
    if (!attempt) throw new HttpError(404, 'Session not found');

    let alive = false;
    if (attempt.containerId && attempt.status === 'running') {
      alive = await orchestrator.isContainerAlive(attempt.containerId);
      if (!alive) {
        attempt.status = 'terminated';
        await attempt.save();
      }
    }
    return { status: attempt.status, alive, attempt: serializeAttempt(attempt) };
  });

  app.post('/:attemptId/ping', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await Attempt.findOne({ _id: req.params.attemptId, user: req.userId });
    if (!attempt) throw new HttpError(404, 'Session not found');
    if (attempt.containerId && attempt.status === 'running') {
      await orchestrator.touchContainer(attempt.containerId).catch(() => {});
    }
    return { ok: true };
  });
};
