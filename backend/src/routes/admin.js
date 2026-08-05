const User = require('../models/User');
const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const Category = require('../models/Category');
const Suggestion = require('../models/Suggestion');
const LoginLog = require('../models/LoginLog');
const { requireAdmin } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { getLeaderboard } = require('../services/leaderboardService');
const orchestrator = require('../services/orchestratorClient');

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
    const logs = await LoginLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return logs.map((l) => ({
      id: l._id.toString(),
      user: l.user ? l.user.toString() : null,
      name: l.name,
      email: l.email,
      at: l.createdAt,
    }));
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

    const sessions = await Promise.all(
      running.map(async (a) => {
        let containerAlive = null;
        if (orchestratorReachable && a.containerId) {
          containerAlive = await orchestrator.isContainerAlive(a.containerId).catch(() => false);
        }
        return {
          id: a._id.toString(),
          user: a.user
            ? { id: a.user._id.toString(), name: a.user.name, email: a.user.email, picture: a.user.picture }
            : null,
          task: a.task ? { id: a.task._id.toString(), title: a.task.title, difficulty: a.task.difficulty } : null,
          category: a.category ? { name: a.category.name, icon: a.category.icon } : null,
          startedAt: a.startedAt,
          containerId: a.containerId || '',
          containerAlive,
        };
      })
    );

    return { sessions, orchestratorReachable };
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
