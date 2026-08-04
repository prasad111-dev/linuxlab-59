const User = require('../models/User');
const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const Category = require('../models/Category');
const Suggestion = require('../models/Suggestion');
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
