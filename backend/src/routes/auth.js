const User = require('../models/User');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { localDateKey } = require('../utils/dateKey');

const GAP_MS = 5 * 60 * 1000;
const MAX_SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_SESSIONS = 50;
const MAX_DAYS = 90;

module.exports = async function authRoutes(app) {
  app.get(
    '/google',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const url = await authService.buildAuthUrl(req.query.frontend);
      reply.redirect(url);
    }
  );

  app.get(
    '/google/callback',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const { jwt, frontend } = await authService.handleCallback(req.raw);
      reply.redirect(`${frontend}/#/auth?token=${encodeURIComponent(jwt)}`);
    }
  );

  app.get('/me', { preHandler: [requireAuth] }, async (req) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(404, 'User not found');
    return user.toSafeJSON();
  });

  app.post(
    '/presence',
    { preHandler: [requireAuth], config: { rateLimit: { max: 120, timeWindow: '1 minute' } } },
    async (req) => {
      const now = Date.now();
      const active = !!(req.body && req.body.active);
      const user = await User.findById(req.userId);
      if (!user) return { ok: true };

      // Idle heartbeats (open tab, no interaction) must not keep the user
      // "online" or keep a session open — otherwise presence/time stats would
      // disagree with the time actually counted. Only active beats matter.
      if (!active) return { ok: true };

      const prev = user.lastHeartbeatAt ? user.lastHeartbeatAt.getTime() : 0;
      const gap = prev ? now - prev : 0;

      // Bank time only when the gap between heartbeats is sane (0–5 min).
      if (prev && gap > 0 && gap < GAP_MS) {
        user.totalActiveMs = (user.totalActiveMs || 0) + gap;

        const day = localDateKey(new Date(now));
        const dayIdx = user.activeTimeByDay.findIndex((d) => d.date === day);
        if (dayIdx >= 0) user.activeTimeByDay[dayIdx].ms += gap;
        else user.activeTimeByDay.push({ date: day, ms: gap });

        const open = user.sessions.find((s) => !s.logoutAt);
        if (open) open.ms += gap;
      }

      // Session lifecycle: a session is a continuous active period. If the gap
      // since the last heartbeat is too long, the previous session is over and
      // a new one starts. This also covers browser closes without logout.
      // A session is also capped at MAX_SESSION_MS so a long-lived open tab can
      // never keep "last login" looking stale while the user is online.
      const openSession = user.sessions.find((s) => !s.logoutAt);
      if (openSession && ((prev && gap > GAP_MS) || now - openSession.loginAt.getTime() > MAX_SESSION_MS)) {
        openSession.logoutAt = user.lastHeartbeatAt || new Date(prev);
      }
      if (!user.sessions.some((s) => !s.logoutAt)) {
        user.sessions.push({ loginAt: new Date(now), logoutAt: null, ms: 0 });
      }

      if (user.sessions.length > MAX_SESSIONS) user.sessions = user.sessions.slice(-MAX_SESSIONS);
      if (user.activeTimeByDay.length > MAX_DAYS) user.activeTimeByDay = user.activeTimeByDay.slice(-MAX_DAYS);

      user.lastSeenAt = new Date(now);
      user.lastHeartbeatAt = new Date(now);
      await user.save();
      return { ok: true };
    }
  );

  app.post(
    '/logout',
    { preHandler: [requireAuth], config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (req) => {
      const user = await User.findById(req.userId);
      if (user) {
        const open = user.sessions.find((s) => !s.logoutAt);
        if (open) open.logoutAt = new Date();
        user.lastLogoutAt = new Date();
        await user.save();
      }
      return { ok: true };
    }
  );
};
