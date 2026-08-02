const Attempt = require('../models/Attempt');
const User = require('../models/User');

function periodStart(period, now = new Date()) {
  if (period === 'week') {
    const d = new Date(now);
    const day = d.getDay() || 7; // Monday start
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null;
}

async function getLeaderboard(period = 'all') {
  const match = {};
  const start = periodStart(period);
  if (start) match.startedAt = { $gte: start };

  const rows = await Attempt.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$user',
        points: { $sum: '$pointsAwarded' },
        tasks: { $sum: 1 },
        passedTasks: { $sum: { $cond: ['$passed', 1, 0] } },
      },
    },
    { $sort: { points: -1 } },
    { $limit: 50 },
  ]);

  const ids = rows.map((r) => r._id);
  const users = await User.find({ _id: { $in: ids } })
    .select('name email picture role points streak')
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return rows.map((r, i) => ({
    rank: i + 1,
    user: userMap.get(r._id.toString()) || null,
    points: r.points,
    tasks: r.tasks,
    passedTasks: r.passedTasks,
  }));
}

async function getUserRank(userId) {
  const rows = await Attempt.aggregate([
    { $group: { _id: '$user', points: { $sum: '$pointsAwarded' } } },
    { $sort: { points: -1 } },
  ]);
  const rank = rows.findIndex((r) => r._id && r._id.toString() === userId.toString());
  return rank === -1 ? null : rank + 1;
}

module.exports = { getLeaderboard, getUserRank, periodStart };
