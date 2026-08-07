const User = require('../models/User');
const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const Category = require('../models/Category');
const Suggestion = require('../models/Suggestion');
const { requireAdmin } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { getLeaderboard } = require('../services/leaderboardService');
const orchestrator = require('../services/orchestratorClient');
const { sendToAttempt } = require('../ws/terminalProxy');
const { localDateKey, daysAgoKey } = require('../utils/dateKey');

function loginLogRow(u, now) {
  const sessions = u.sessions || [];
  const last = sessions[sessions.length - 1];
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    picture: u.picture,
    role: u.role,
    // "Last login" must match the session history shown in Time analytics:
    // the most recent session start, falling back to the OAuth timestamp.
    lastLoginAt: (last && last.loginAt) || u.lastLoginAt || null,
    // "Logout" is the end of the most recent session only. A still-open session
    // has no logout — never fall back to an older explicit logout, otherwise
    // "logout" would appear before "login".
    lastLogoutAt: (last && last.logoutAt) || null,
    lastSeenAt: u.lastSeenAt || null,
    totalActiveMs: u.totalActiveMs || 0,
    online: u.lastSeenAt ? now - new Date(u.lastSeenAt).getTime() < 25_000 : false,
  };
}

module.exports = async function adminRoutes(app) {
  app.get('/users', { preHandler: [requireAdmin] }, async (req) => {
    const q = (req.query.q || '').trim();
    const filter = q
      ? { $or: [{ email: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }] }
      : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
    return users.map((u) => u.toSafeJSON());
  });

  app.patch('/users/:id', { preHandler: [requireAdmin] }, async (req) => {
    const { role } = req.body || {};
    if (!['student', 'admin'].includes(role)) throw new HttpError(400, 'invalid role');
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    user.role = role;
    await user.save();
    return user.toSafeJSON();
  });

  app.get('/stats', { preHandler: [requireAdmin] }, async (req) => {
    const [users, tasks, attempts, categories, publishedTasks, runningAttempts, pendingSuggestions] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Attempt.countDocuments(),
      Category.countDocuments(),
      Task.countDocuments({ status: 'published' }),
      Attempt.countDocuments({ status: 'running' }),
      Suggestion.countDocuments({ status: 'pending' }),
    ]);

    const [avgAgg, byCategory, last7] = await Promise.all([
      Attempt.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }]),
      Attempt.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Attempt.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const todayKey = localDateKey(new Date());
    const weekKeys = new Set(Array.from({ length: 7 }, (_, i) => daysAgoKey(i)));
    const [timeTodayAgg, timeWeekAgg] = await Promise.all([
      User.aggregate([
        { $unwind: '$activeTimeByDay' },
        { $match: { 'activeTimeByDay.date': todayKey } },
        { $group: { _id: null, ms: { $sum: '$activeTimeByDay.ms' } } },
      ]),
      User.aggregate([
        { $unwind: '$activeTimeByDay' },
        { $match: { 'activeTimeByDay.date': { $in: [...weekKeys] } } },
        { $group: { _id: null, ms: { $sum: '$activeTimeByDay.ms' } } },
      ]),
    ]);

    const categoriesAgg = await Category.find({ _id: { $in: byCategory.map((b) => b._id) } })
      .select('name icon color')
      .lean();

    const catNameMap = new Map(categoriesAgg.map((c) => [c._id.toString(), c]));
    const topPerformers = (await getLeaderboard('all')).slice(0, 5);

    return {
      counts: { users, tasks, publishedTasks, attempts, runningAttempts, categories, pendingSuggestions },
      avgScore: Math.round((avgAgg[0] && avgAgg[0].avg) || 0),
      attemptsByCategory: byCategory.map((b) => ({
        category: catNameMap.get(b._id && b._id.toString()) || { name: 'Unknown', icon: '❓' },
        count: b.count,
      })),
      activityLast7: last7,
      topPerformers,
      timeTodayMs: (timeTodayAgg[0] && timeTodayAgg[0].ms) || 0,
      timeWeekMs: (timeWeekAgg[0] && timeWeekAgg[0].ms) || 0,
    };
  });

  app.get('/containers', { preHandler: [requireAdmin] }, async (req) => {
    try {
      return { containers: await orchestrator.listContainers() };
    } catch (e) {
      throw new HttpError(502, 'Orchestrator is unreachable from the backend');
    }
  });

  app.get('/login-logs', { preHandler: [requireAdmin] }, async (req) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const users = await User.find({
      $or: [{ lastLoginAt: { $ne: null } }, { 'sessions.0': { $exists: true } }],
    })
      .limit(limit)
      .select('name email picture role lastLoginAt lastSeenAt lastLogoutAt totalActiveMs sessions')
      .lean();
    const now = Date.now();
    return users
      .map((u) => loginLogRow(u, now))
      .filter((l) => l.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime())
      .slice(0, limit);
  });

  app.get('/active-sessions', { preHandler: [requireAdmin] }, async () => {
    const running = await Attempt.find({ status: 'running' })
      .populate('user', 'name email picture role')
      .populate('task', 'title difficulty')
      .populate('category', 'name icon')
      .sort({ startedAt: -1 })
      .limit(200);

    let orchestratorReachable = true;
    try {
      await orchestrator.listContainers();
    } catch {
      orchestratorReachable = false;
    }

    const IDLE_MS = 5 * 60 * 1000;

    const toSession = (a, containerAlive, idleSeconds) => ({
      id: a._id.toString(),
      user: a.user
        ? { id: a.user._id.toString(), name: a.user.name, email: a.user.email, picture: a.user.picture }
        : null,
      task: a.task ? { id: a.task._id.toString(), title: a.task.title, difficulty: a.task.difficulty } : null,
      category: a.category ? { name: a.category.name, icon: a.category.icon } : null,
      startedAt: a.startedAt,
      lastActiveAt: a.lastActiveAt || null,
      containerId: a.containerId || '',
      containerAlive,
      idleSeconds,
    });

    const sessions = [];
    for (const a of running) {
      if (!orchestratorReachable) {
        sessions.push(toSession(a, null, null));
        continue;
      }
      let alive = false;
      if (a.containerId) {
        alive = await orchestrator.isContainerAlive(a.containerId).catch(() => false);
      }
      if (!alive) {
        // Container is gone — the student left and the cleanup was missed.
        if (a.containerId) await orchestrator.destroyContainer(a.containerId).catch(() => {});
        a.status = 'terminated';
        await a.save();
        continue;
      }
      // Heartbeat stopped (page closed / user gone) while the container still runs.
      // Fall back to startedAt while the first heartbeat arrives (after a deploy).
      const lastActive = a.lastActiveAt
        ? new Date(a.lastActiveAt).getTime()
        : new Date(a.startedAt).getTime();
      if (Date.now() - lastActive > IDLE_MS) {
        await orchestrator.destroyContainer(a.containerId).catch(() => {});
        a.status = 'terminated';
        await a.save();
        continue;
      }
      const idleSeconds = Math.floor((Date.now() - lastActive) / 1000);
      sessions.push(toSession(a, true, idleSeconds));
    }

    return { sessions, orchestratorReachable };
  });

  app.post('/sessions/:id/terminate', { preHandler: [requireAdmin] }, async (req) => {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) throw new HttpError(404, 'Attempt not found');
    if (attempt.status === 'running') {
      const notice = String((req.body || {}).message || '').trim().slice(0, 300);
      if (notice) {
        sendToAttempt(attempt._id.toString(), notice);
        await new Promise((r) => setTimeout(r, 350));
      }
      if (attempt.containerId) await orchestrator.destroyContainer(attempt.containerId).catch(() => {});
      attempt.status = 'terminated';
      attempt.terminatedAt = new Date();
      await attempt.save();
    }
    return { ok: true };
  });

  app.get('/attempts', { preHandler: [requireAdmin] }, async (req) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const attempts = await Attempt.find()
      .populate('user', 'name email picture role')
      .populate('task', 'title difficulty')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .limit(limit);

    return attempts.map((a) => ({
      id: a._id.toString(),
      user: a.user
        ? { id: a.user._id.toString(), name: a.user.name, email: a.user.email, picture: a.user.picture }
        : null,
      task: a.task ? { id: a.task._id.toString(), title: a.task.title, difficulty: a.task.difficulty } : null,
      category: a.category ? { name: a.category.name, icon: a.category.icon } : null,
      status: a.status,
      score: a.score,
      maxScore: a.maxScore,
      passed: a.passed,
      timeTakenSeconds: a.timeTakenSeconds,
      createdAt: a.createdAt,
    }));
  });

  app.get('/engagement', { preHandler: [requireAdmin] }, async () => {
    const users = await User.find({
      $or: [{ lastLoginAt: { $ne: null } }, { 'sessions.0': { $exists: true } }],
    })
      .sort({ totalActiveMs: -1 })
      .limit(200)
      .select('name email picture lastLoginAt lastSeenAt totalActiveMs activeTimeByDay sessions')
      .lean();
    const now = Date.now();
    const today = localDateKey(new Date());
    const weekKeys = new Set(Array.from({ length: 7 }, (_, i) => daysAgoKey(i)));
    return users.map((u) => {
      const byDay = u.activeTimeByDay || [];
      const todayMs = byDay.filter((d) => d.date === today).reduce((s, d) => s + d.ms, 0);
      const weekMs = byDay.filter((d) => weekKeys.has(d.date)).reduce((s, d) => s + d.ms, 0);
      const lastSeen = u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : 0;
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        picture: u.picture,
        totalMs: u.totalActiveMs || 0,
        todayMs,
        weekMs,
        sessionCount: (u.sessions || []).length,
        online: lastSeen ? now - lastSeen < 25_000 : false,
        lastSeenAt: u.lastSeenAt || null,
      };
    });
  });

  app.get('/engagement/users/:id', { preHandler: [requireAdmin] }, async (req) => {
    const user = await User.findById(req.params.id)
      .select('name email picture totalActiveMs activeTimeByDay sessions lastHeartbeatAt')
      .lean();
    if (!user) throw new HttpError(404, 'User not found');

    const byDayMap = new Map((user.activeTimeByDay || []).map((d) => [d.date, d.ms]));
    const daily = Array.from({ length: 14 }, (_, i) => {
      const key = daysAgoKey(13 - i);
      return { date: key, ms: byDayMap.get(key) || 0 };
    });

    const lastBeat = user.lastHeartbeatAt ? new Date(user.lastHeartbeatAt).getTime() : 0;
    const sessions = (user.sessions || [])
      .map((s) => ({
        loginAt: s.loginAt,
        logoutAt: s.logoutAt,
        ms: s.ms,
        active: !s.logoutAt,
        stale: !s.logoutAt && lastBeat && Date.now() - lastBeat > 5 * 60 * 1000,
      }))
      .reverse();

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        picture: user.picture,
        totalMs: user.totalActiveMs || 0,
      },
      daily,
      sessions,
    };
  });

  app.get('/suggestions', { preHandler: [requireAdmin] }, async (req) => {
    const items = await Suggestion.find()
      .populate('user', 'name email')
      .populate('category', 'name icon color')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return items.map((s) => ({ ...s, id: s._id.toString() }));
  });

  app.patch('/suggestions/:id', { preHandler: [requireAdmin] }, async (req) => {
    const { status, adminNote } = req.body || {};
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      throw new HttpError(400, 'invalid status');
    }
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) throw new HttpError(404, 'Suggestion not found');
    if (status) suggestion.status = status;
    if (adminNote !== undefined) suggestion.adminNote = String(adminNote).slice(0, 500);
    await suggestion.save();
    return suggestion.toSuggestionJSON();
  });
};

module.exports.loginLogRow = loginLogRow;
