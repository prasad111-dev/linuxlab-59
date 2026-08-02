const config = require('../config');
const User = require('../models/User');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');

module.exports = async function authRoutes(app) {
  app.get(
    '/google',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const url = await authService.buildAuthUrl();
      reply.redirect(url);
    }
  );

  app.get(
    '/google/callback',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const { jwt } = await authService.handleCallback(req.raw);
      reply.redirect(`${config.frontendUrl}/#/auth?token=${encodeURIComponent(jwt)}`);
    }
  );

  app.get('/me', { preHandler: [requireAuth] }, async (req) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(404, 'User not found');
    return user.toSafeJSON();
  });

  app.post('/logout', async () => ({ ok: true }));
};
