const User = require('../models/User');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { localDateKey } = require('../utils/dateKey');

const GAP_MS = 5 * 60 * 1000;
const MAX_SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_SESSIONS = 50;
const MAX_DAYS = 90;
const MAX_DAY_MS = 24 * 60 * 60 * 1000;

/** Distribute a [startMs, endMs) span into the per-day buckets, splitting at
 *  local midnight so a heartbeat that straddles two days is attributed to
 *  both correctly. */
function bankSpan(user, startMs, endMs) {
  let cursor = startMs;
  while (cursor < endMs) {
    const d = new Date(cursor);
    const nextDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    const chunkEnd = Math.min(endMs, nextDay);
    const chunk = chunkEnd - cursor;
    const key = localDateKey(new Date(cursor));
    const idx = user.activeTimeByDay.findIndex((x) => x.date === key);
    if (idx >= 0) user.activeTimeByDay[idx].ms = Math.min(MAX_DAY_MS, user.activeTimeByDay[idx].ms + chunk);
    else user.activeTimeByDay.push({ date: key, ms: Math.min(MAX_DAY_MS, chunk) });
    cursor = chunkEnd;
  }
}

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
      // A gap exactly at the limit is still contiguous — bank it too.
      let delta = 0;
      if (prev && gap > 0 && gap <= GAP_MS) {
        delta = gap;
        bankSpan(user, prev, now);

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

      // Targeted write instead of a full-document save: the presence endpoint
      // is hit every 5s per active user, so this keeps contention minimal.
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            lastSeenAt: new Date(now),
            lastHeartbeatAt: new Date(now),
            sessions: user.sessions,
            activeTimeByDay: user.activeTimeByDay,
          },
          $inc: { totalActiveMs: delta },
        }
      );
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
