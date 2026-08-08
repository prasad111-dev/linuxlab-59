const Attempt = require('../models/Attempt');
const InterviewSession = require('../models/InterviewSession');
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

/** Pure merge of practical-attempt rows and interview-session rows, sorted by
 *  points (desc), passed tasks (desc), then user id for stable ranks. Kept
 *  free of the DB so it can be unit-tested. */
function mergePoints(attemptRows, interviewRows) {
  const merged = new Map();
  for (const a of attemptRows) {
    merged.set(String(a._id), { _id: a._id, points: a.points, tasks: a.tasks, passedTasks: a.passedTasks });
  }
  for (const i of interviewRows) {
    const key = String(i._id);
    const entry = merged.get(key) || { _id: i._id, points: 0, tasks: 0, passedTasks: 0 };
    entry.points += i.interviewPoints;
    merged.set(key, entry);
  }
  return [...merged.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.passedTasks - a.passedTasks ||
      (String(a._id) < String(b._id) ? -1 : 1)
  );
}

async function aggregatePoints(start) {
  const attemptMatch = { pointsAwarded: { $gt: 0 } };
  const interviewMatch = { pointsAwarded: { $gt: 0 } };
  if (start) {
    attemptMatch.startedAt = { $gte: start };
    interviewMatch.createdAt = { $gte: start };
  }

  const [attemptRows, interviewRows] = await Promise.all([
    Attempt.aggregate([
      { $match: attemptMatch },
      {
        $group: {
          _id: '$user',
          points: { $sum: '$pointsAwarded' },
          tasks: { $sum: 1 },
          passedTasks: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
    ]),
    InterviewSession.aggregate([
      { $match: interviewMatch },
      { $group: { _id: '$user', interviewPoints: { $sum: '$pointsAwarded' } } },
    ]),
  ]);

  return mergePoints(attemptRows, interviewRows);
}

async function getLeaderboard(period = 'all') {
  const rows = (await aggregatePoints(periodStart(period))).slice(0, 50);

  const ids = rows.map((r) => r._id);
  const users = await User.find({ _id: { $in: ids } })
    .select('name email picture role points streak')
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return rows.map((r, i) => ({
    rank: i + 1,
    user: userMap.get(String(r._id)) || null,
    points: r.points,
    tasks: r.tasks,
    passedTasks: r.passedTasks,
  }));
}

async function getUserRank(userId, period = 'all') {
  const rows = await aggregatePoints(periodStart(period));
  const rank = rows.findIndex((r) => String(r._id) === String(userId));
  return rank === -1 ? null : rank + 1;
}

module.exports = { getLeaderboard, getUserRank, periodStart, mergePoints };
