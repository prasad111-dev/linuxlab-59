const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'app-test-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/app-test-nodb';

const { buildApp } = require('../src/app');

test('buildApp boots and compresses API responses', async () => {
  const app = await buildApp();
  app.get('/__perf', async () => ({ pad: 'x'.repeat(8192) }));
  await app.ready();

  const health = await app.inject({ url: '/api/health' });
  assert.equal(health.statusCode, 200);
  assert.equal(health.json().ok, true);

  const big = await app.inject({ url: '/__perf', headers: { 'accept-encoding': 'gzip, br' } });
  assert.equal(big.statusCode, 200);
  assert.ok(
    ['gzip', 'br', 'deflate'].includes(big.headers['content-encoding']),
    `expected a compressed response, got ${big.headers['content-encoding']}`
  );
  assert.ok(big.rawPayload.length < 200, 'compressed payload should be much smaller than 8192 bytes');

  await app.close();
});
