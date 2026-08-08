const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mergePoints, periodStart } = require('../src/services/leaderboardService');

const attempt = (id, points, passedTasks, tasks) => ({ _id: id, points, tasks: tasks ?? 1, passedTasks });
const interview = (id, pts) => ({ _id: id, interviewPoints: pts });

test('mergePoints combines practical and interview points per user', () => {
  const rows = mergePoints(
    [attempt('a', 200, 1, 1), attempt('b', 50, 0, 1)],
    [interview('a', 7), interview('b', 3)]
  );
  const byId = Object.fromEntries(rows.map((r) => [String(r._id), r]));
  assert.equal(byId.a.points, 207);
  assert.equal(byId.a.passedTasks, 1);
  assert.equal(byId.b.points, 53);
});

test('mergePoints includes users who only earned interview points', () => {
  const rows = mergePoints([], [interview('c', 12)]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].points, 12);
  assert.equal(rows[0].tasks, 0);
  assert.equal(rows[0].passedTasks, 0);
});

test('mergePoints sorts by points desc, then passed tasks, then id', () => {
  const rows = mergePoints(
    [
      attempt('x', 100, 0, 1),
      attempt('y', 100, 2, 3),
      attempt('z', 50, 1, 1),
    ],
    []
  );
  assert.deepEqual(
    rows.map((r) => String(r._id)),
    ['y', 'x', 'z']
  );
});

test('periodStart computes monday-aligned weeks and month starts', () => {
  const friday = new Date(2026, 7, 7, 15); // a local Friday (Aug 7 2026)
  const week = periodStart('week', friday);
  assert.equal(week.getDay(), 1); // Monday
  assert.equal(week.getHours(), 0);
  const month = periodStart('month', friday);
  assert.equal(month.getDate(), 1);
  assert.equal(month.getHours(), 0);
  assert.equal(periodStart('all', friday), null);
});
