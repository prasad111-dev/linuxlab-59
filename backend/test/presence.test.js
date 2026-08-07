const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'presence-test-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/app-test-nodb';

const User = require('../src/models/User');
const { buildApp } = require('../src/app');
const { issueToken } = require('../src/services/authService');
const { localDateKey } = require('../src/utils/dateKey');

const GAP_MS = 5 * 60 * 1000;
const MAX_SESSION_MS = 12 * 60 * 60 * 1000;

function makeUser(overrides = {}) {
  const user = {
    lastHeartbeatAt: null,
    lastSeenAt: null,
    totalActiveMs: 0,
    activeTimeByDay: [],
    sessions: [],
    saveCalls: 0,
    async save() {
      this.saveCalls += 1;
    },
    ...overrides,
  };
  return user;
}

let app;
let user;
let token;

async function beat(active, overrides = {}) {
  const res = await app.inject({
    url: '/api/auth/presence',
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    payload: { active, ...overrides },
  });
  return res;
}

beforeEach(async () => {
  app = await buildApp();
  await app.ready();
  user = makeUser();
  User.findById = async () => user;
  token = await issueToken({ _id: { toString: () => 'u1' }, email: 's@x.com', role: 'student', name: 'S' });
});

test('idle heartbeat (active:false) is ignored: no presence update, no banking, no session change', async () => {
  user.lastHeartbeatAt = new Date(Date.now() - 10_000);
  user.lastSeenAt = new Date(Date.now() - 10_000);
  user.sessions = [{ loginAt: new Date(Date.now() - 60_000), logoutAt: null, ms: 1000 }];
  user.totalActiveMs = 1000;

  const res = await beat(false);
  assert.equal(res.statusCode, 200);
  assert.equal(user.saveCalls, 0, 'idle beats must not persist anything');
  assert.equal(user.totalActiveMs, 1000);
  assert.equal(user.sessions.length, 1);
  assert.equal(user.sessions[0].logoutAt, null);
  await app.close();
});

test('first active beat opens a session but banks nothing (no previous heartbeat)', async () => {
  user.lastHeartbeatAt = null;

  const res = await beat(true);
  assert.equal(res.statusCode, 200);
  assert.equal(user.saveCalls, 1);
  assert.equal(user.sessions.length, 1);
  assert.ok(user.sessions[0].loginAt, 'session loginAt must be set');
  assert.equal(user.sessions[0].logoutAt, null);
  assert.equal(user.sessions[0].ms, 0);
  assert.equal(user.totalActiveMs, 0);
  assert.ok(user.lastSeenAt, 'lastSeenAt must be set');
  assert.ok(user.lastHeartbeatAt, 'lastHeartbeatAt must be set');
  await app.close();
});

test('active beat within the gap window banks the elapsed time', async () => {
  const prev = new Date(Date.now() - 10_000);
  user.lastHeartbeatAt = prev;
  user.lastSeenAt = prev;
  user.sessions = [{ loginAt: new Date(Date.now() - 60_000), logoutAt: null, ms: 0 }];

  const res = await beat(true);
  assert.equal(res.statusCode, 200);
  assert.ok(Math.abs(user.totalActiveMs - 10_000) < 500, `expected ~10s banked, got ${user.totalActiveMs}`);
  const day = localDateKey(new Date());
  const entry = user.activeTimeByDay.find((d) => d.date === day);
  assert.ok(entry, 'today entry must exist');
  assert.ok(Math.abs(entry.ms - 10_000) < 500, `expected ~10s in today, got ${entry.ms}`);
  assert.ok(Math.abs(user.sessions[0].ms - 10_000) < 500, `expected ~10s in session, got ${user.sessions[0].ms}`);
  assert.equal(user.sessions[0].logoutAt, null, 'session stays open within the gap window');
  await app.close();
});

test('active beat after a long idle gap closes the session and starts a new one without banking idle time', async () => {
  const prev = new Date(Date.now() - 10 * GAP_MS);
  user.lastHeartbeatAt = prev;
  user.lastSeenAt = prev;
  user.sessions = [{ loginAt: new Date(Date.now() - 2 * 3600_000), logoutAt: null, ms: 5000 }];
  user.totalActiveMs = 5000;

  const res = await beat(true);
  assert.equal(res.statusCode, 200);
  assert.equal(user.sessions.length, 2);
  assert.ok(user.sessions[0].logoutAt, 'old session must be closed');
  assert.equal(user.sessions[1].logoutAt, null, 'new session must be open');
  assert.equal(user.totalActiveMs, 5000, 'idle gap must not be banked');
  await app.close();
});

test('an over-long open session is force-closed so "last login" can never look stale forever', async () => {
  user.lastHeartbeatAt = new Date(Date.now() - 60_000);
  user.lastSeenAt = new Date(Date.now() - 60_000);
  user.sessions = [{ loginAt: new Date(Date.now() - (MAX_SESSION_MS + 3600_000)), logoutAt: null, ms: 0 }];

  const res = await beat(true);
  assert.equal(res.statusCode, 200);
  assert.equal(user.sessions.length, 2);
  assert.ok(user.sessions[0].logoutAt, 'stale session must be closed');
  assert.equal(user.sessions[1].logoutAt, null);
  await app.close();
});
