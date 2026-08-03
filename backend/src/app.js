const Fastify = require('fastify');
const cors = require('@fastify/cors');
const rateLimit = require('@fastify/rate-limit');

const config = require('./config');
const { HttpError } = require('./utils/httpError');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const taskRoutes = require('./routes/tasks');
const sessionRoutes = require('./routes/sessions');
const attemptRoutes = require('./routes/attempts');
const leaderboardRoutes = require('./routes/leaderboard');
const achievementRoutes = require('./routes/achievements');
const notificationRoutes = require('./routes/notifications');
const suggestionRoutes = require('./routes/suggestions');
const adminRoutes = require('./routes/admin');

async function buildApp() {
  const app = Fastify({
    logger: { level: config.isProd ? 'info' : 'debug' },
    trustProxy: true,
  });

  // Tolerate empty JSON bodies (clients send Content-Type: application/json on every POST)
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      done(null, body && body.trim() ? JSON.parse(body) : undefined);
    } catch (err) {
      done(err, undefined);
    }
  });

  await app.register(cors, {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const norm = (o) => String(o).replace(/\/+$/, '');
      const allowed = [
        config.frontendUrl,
        ...config.frontendOrigins,
        /^https?:\/\/localhost:\d+$/,
        /^https?:\/\/127\.0\.0\.1:\d+$/,
      ];
      const ok = allowed.some((a) => (a instanceof RegExp ? a.test(origin) : norm(a) === norm(origin)));
      cb(null, ok);
    },
    credentials: true,
  });

  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
  });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof HttpError) {
      return reply.status(err.status).send({ error: err.message, details: err.details });
    }
    if (err.validation) {
      return reply.status(400).send({ error: 'invalid request', details: err.message });
    }
    req.log.error(err);
    const status = err.statusCode || 500;
    return reply.status(status).send({ error: status >= 500 ? 'internal server error' : err.message });
  });

  app.get('/api/health', async () => ({
    ok: true,
    service: 'linuxlab-backend',
    time: new Date().toISOString(),
  }));

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });
  app.register(categoryRoutes, { prefix: '/api/categories' });
  app.register(taskRoutes, { prefix: '/api/tasks' });
  app.register(sessionRoutes, { prefix: '/api/sessions' });
  app.register(attemptRoutes, { prefix: '/api/attempts' });
  app.register(leaderboardRoutes, { prefix: '/api/leaderboard' });
  app.register(achievementRoutes, { prefix: '/api/achievements' });
  app.register(notificationRoutes, { prefix: '/api/notifications' });
  app.register(suggestionRoutes, { prefix: '/api/suggestions' });
  app.register(adminRoutes, { prefix: '/api/admin' });

  return app;
}

module.exports = { buildApp };
