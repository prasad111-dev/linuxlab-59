const { test } = require('node:test');
const assert = require('node:assert/strict');
const { updateStreak } = require('../src/services/streakService');

function freshUser() {
  return { streak: { current: 0, longest: 0, lastActive: null } };
}

test('first practice starts a streak of 1', () => {
  const u = freshUser();
  updateStreak(u, new Date('2026-08-05T10:00:00'));
  assert.equal(u.streak.current, 1);
  assert.equal(u.streak.longest, 1);
});

test('practising again the same day leaves the streak unchanged', () => {
  const u = { streak: { current: 3, longest: 5, lastActive: new Date('2026-08-05T09:00:00') } };
  updateStreak(u, new Date('2026-08-05T22:00:00'));
  assert.equal(u.streak.current, 3);
  assert.equal(u.streak.longest, 5);
});

test('practising the next day increments the streak and tracks longest', () => {
  const u = { streak: { current: 3, longest: 5, lastActive: new Date('2026-08-05T09:00:00') } };
  updateStreak(u, new Date('2026-08-06T08:00:00'));
  assert.equal(u.streak.current, 4);
  assert.equal(u.streak.longest, 5);
});

test('a missed day resets the streak to 1 but keeps longest', () => {
  const u = { streak: { current: 5, longest: 5, lastActive: new Date('2026-08-01T09:00:00') } };
  updateStreak(u, new Date('2026-08-06T08:00:00'));
  assert.equal(u.streak.current, 1);
  assert.equal(u.streak.longest, 5);
});
