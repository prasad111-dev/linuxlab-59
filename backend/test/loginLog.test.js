const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'loginlog-test-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/app-test-nodb';

const { loginLogRow } = require('../src/routes/admin');

const NOW = Date.now();
const id = { toString: () => 'u1' };

test('open most recent session: logout is null even if an older explicit logout exists (no logout before login)', () => {
  const row = loginLogRow(
    {
      _id: id,
      name: 'P',
      email: 'p@x.com',
      picture: '',
      role: 'student',
      lastLoginAt: new Date(NOW - 3 * 86400_000),
      lastLogoutAt: new Date(NOW - 3 * 86400_000 + 60_000),
      lastSeenAt: new Date(NOW - 18 * 60_000),
      totalActiveMs: 44 * 60_000,
      sessions: [
        { loginAt: new Date(NOW - 3 * 86400_000), logoutAt: new Date(NOW - 3 * 86400_000 + 60_000) },
        { loginAt: new Date(NOW - 18 * 60_000), logoutAt: null },
      ],
    },
    NOW
  );
  assert.equal(row.lastLogoutAt, null, 'a still-open session has no logout — must not show an older one');
  assert.ok(row.lastLoginAt);
  assert.equal(row.online, false);
});

test('closed most recent session: logout equals that session end', () => {
  const logout = new Date(NOW - 5 * 60_000);
  const row = loginLogRow(
    {
      _id: id,
      name: 'P',
      email: 'p@x.com',
      picture: '',
      role: 'student',
      lastLoginAt: new Date(NOW - 2 * 86400_000),
      lastSeenAt: new Date(NOW - 3 * 86400_000),
      totalActiveMs: 1000,
      sessions: [{ loginAt: new Date(NOW - 6 * 60_000), logoutAt: logout }],
    },
    NOW
  );
  assert.equal(row.lastLogoutAt.getTime(), logout.getTime());
  assert.equal(row.online, false);
});

test('recent lastSeenAt marks the user online', () => {
  const row = loginLogRow(
    {
      _id: id,
      name: 'P',
      email: 'p@x.com',
      picture: '',
      role: 'student',
      lastLoginAt: new Date(NOW - 60_000),
      lastSeenAt: new Date(NOW - 5000),
      totalActiveMs: 1000,
      sessions: [{ loginAt: new Date(NOW - 60_000), logoutAt: null }],
    },
    NOW
  );
  assert.equal(row.online, true);
  assert.equal(row.lastLogoutAt, null);
});
