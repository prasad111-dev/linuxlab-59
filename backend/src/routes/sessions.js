const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { serializeAttempt } = require('../utils/serialize');
const { startSession, terminateRunning } = require('../services/sessionService');
const Attempt = require('../models/Attempt');
const { signKcToken } = require('./killercoda');

module.exports = async function sessionRoutes(app) {
  app.post(
    '/start',
    { preHandler: [requireAuth], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req) => {
      const { taskId } = req.body || {};
      if (!taskId) throw new HttpError(400, 'taskId is required');
      const { attempt, resumed } = await startSession(req.userId, taskId);

      const kcToken = await signKcToken({
        typ: 'killercoda',
        sub: req.userId,
        attemptId: attempt._id.toString(),
        taskId: attempt.task.toString(),
      });

      return { attempt: serializeAttempt(attempt), resumed, kcToken };
    }
  );

  app.get('/:attemptId', { preHandler: [requireAuth] }, async (req) => {
    const attempt = await Attempt.findOne({ _id: req.params.attemptId, user: req.userId });
    if (!attempt) throw new HttpError(404, 'Session not found');
    return { status: attempt.status, attempt: serializeAttempt(attempt) };
  });

  app.post('/:attemptId/ping', { preHandler: [requireAuth] }, async (req) => {
    return { ok: true };
  });
};
