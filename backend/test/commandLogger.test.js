const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCommandLogger } = require('../src/ws/commandLogger');

test('ingest captures commands from binary and string frames', () => {
  const logger = createCommandLogger();
  logger.ingest(Buffer.from('ip addr show\r'));
  logger.ingest('ifconfig\r\n');
  assert.deepEqual(logger.commands, ['ip addr show', 'ifconfig']);
});

test('flush returns the captured commands and clears the buffer', () => {
  const logger = createCommandLogger();
  logger.ingest(Buffer.from('ping -c 3 127.0.0.1\r'));
  const cmds = logger.flush();
  assert.deepEqual(cmds, ['ping -c 3 127.0.0.1']);
  assert.deepEqual(logger.commands, []);
  assert.deepEqual(logger.flush(), []);
});

test('the array returned by flush survives further flushing (no shared reference)', () => {
  const logger = createCommandLogger();
  logger.ingest(Buffer.from('ss -tulpn\r'));
  const cmds = logger.flush();
  logger.ingest(Buffer.from('getent hosts app.linuxlab.local\r'));
  logger.flush();
  assert.deepEqual(cmds, ['ss -tulpn'], 'a captured batch must not be emptied by a later flush');
});

test('partial lines without a newline are only completed once Enter arrives', () => {
  const logger = createCommandLogger();
  logger.ingest(Buffer.from('traceroute'));
  assert.deepEqual(logger.commands, []);
  logger.ingest(Buffer.from(' -n 127.0.0.1\r'));
  assert.deepEqual(logger.commands, ['traceroute -n 127.0.0.1']);
});
