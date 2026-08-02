const User = require('../models/User');
const Attempt = require('../models/Attempt');
const Task = require('../models/Task');
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/auth');
const { HttpError } = require('../utils/httpError');
const { getCatalog } = require('../services/achievementService');
const { getUserRank } = require('../services/leaderboardService');

module.exports = async function userRoutes(app) {
  app.get('/me', { preHandler: [requireAuth] }, async (req) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(404, 'User not found');
    return user.toSafeJSON();
  });

  app.patch('/me', { preHandler: [requireAuth] }, async (req) => {
    const { name } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(404, 'User not found');
    if (name && typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed) user.name = trimmed.slice(0, 80);
    }
    await user.save();
    return user.toSafeJSON();
  });

  app.get('/me/stats', { preHandler: [requireAuth] }, async (req) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(404, 'User not found');

    const [attempts, tasks, categories] = await Promise.all([
      Attempt.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
      Task.find({ status: 'published' }).select('title category difficulty points estimatedMinutes').lean(),
      Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean(),
    ]);

    const evaluated = attempts.filter((a) => a.status === 'evaluated');
    const completedAttempts = evaluated.filter((a) => a.passed);
    const completedTaskIds = new Set(completedAttempts.map((a) => a.task.toString()));
    const totalTasks = tasks.length;
    const pendingTasks = totalTasks - completedTaskIds.size;
    const avgScore = evaluated.length
      ? Math.round(evaluated.reduce((s, a) => s + a.score, 0) / evaluated.length)
      : 0;

    const catMap = new Map(categories.map((c) => [c._id.toString(), c]));
    const categoryProgress = categories.map((c) => {
      const catTasks = tasks.filter((t) => t.category && t.category.toString() === c._id.toString());
      const done = catTasks.filter((t) => completedTaskIds.has(t._id.toString())).length;
      return {
        category: { id: c._id, name: c.name, icon: c.icon, color: c.color },
        total: catTasks.length,
        completed: done,
        percent: catTasks.length ? Math.round((done / catTasks.length) * 100) : 0,
      };
    });

    const recentActivity = evaluated.slice(0, 6).map((a) => ({
      id: a._id,
      task: a.task,
      score: a.score,
      maxScore: a.maxScore,
      passed: a.passed,
      createdAt: a.createdAt,
    }));

    const taskTitleMap = new Map(tasks.map((t) => [t._id.toString(), t]));
    recentActivity.forEach((r) => {
      const t = taskTitleMap.get(r.task.toString());
      r.taskTitle = t ? t.title : 'Unknown task';
    });

    const attemptedTaskIds = new Set(evaluated.map((a) => a.task.toString()));
    const recommended = tasks
      .filter((t) => !attemptedTaskIds.has(t._id.toString()))
      .slice(0, 6)
      .map((t) => ({
        id: t._id,
        title: t.title,
        difficulty: t.difficulty,
        points: t.points,
        estimatedMinutes: t.estimatedMinutes,
        category: catMap.get(String(t.category)) || null,
      }));

    const rank = await getUserRank(user._id);
    const achievements = await getCatalog(user);
    const runningAttempt = attempts.find((a) => a.status === 'running') || null;

    return {
      user: user.toSafeJSON(),
      totalTasks,
      completed: completedTaskIds.size,
      pendingTasks,
      avgScore,
      points: user.points,
      streak: user.streak,
      rank,
      categoryProgress,
      recentActivity,
      recommended,
      achievements,
      runningAttempt: runningAttempt
        ? { id: runningAttempt._id, task: runningAttempt.task, containerId: runningAttempt.containerId }
        : null,
    };
  });
};
