const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildRuleCommand, shellQuote, matchesCommandHistory } = require('../src/services/ruleCommands');

test('shellQuote wraps and escapes single quotes', () => {
  assert.equal(shellQuote("it's"), `'it'\\''s'`);
  assert.equal(shellQuote('a b'), "'a b'");
});

test('every rule type produces a check command that ends with echo OK/FAIL', () => {
  const rules = [
    { type: 'file_exists', params: { path: '/srv/webapp/config.yml' } },
    { type: 'dir_exists', params: { path: '/srv/webapp' } },
    { type: 'user_exists', params: { username: 'rahul' } },
    { type: 'user_absent', params: { username: 'root' } },
    { type: 'group_exists', params: { group: 'devs' } },
    { type: 'group_absent', params: { group: 'root' } },
    { type: 'package_installed', params: { package: 'nginx' } },
    { type: 'service_active', params: { service: 'nginx' } },
    { type: 'service_enabled', params: { service: 'nginx' } },
    { type: 'port_open', params: { port: 80 } },
    { type: 'file_contains', params: { path: '/etc/nginx/sites-available/acme', needle: 'listen' } },
    { type: 'file_permissions', params: { path: '/usr/local/bin/backup.sh', expected: '755' } },
    { type: 'file_owner', params: { path: '/usr/local/bin/backup.sh', expected: 'root:root' } },
    { type: 'file_type', params: { path: '/srv/webapp/config.yml', expected: 'regular file' } },
    { type: 'file_linkcount', params: { path: '/srv/webapp/config.yml', expected: '2' } },
    { type: 'symlink_exists', params: { path: '/srv/webapp/www/assets' } },
    { type: 'symlink_target', params: { path: '/srv/webapp/www/assets', target: '../shared-assets' } },
    { type: 'hardlink_exists', params: { a: '/srv/webapp/config.yml', b: '/srv/webapp/settings.yml' } },
    { type: 'command_contains', params: { command: 'crontab -l', needle: '30 2' } },
  ];
  for (const rule of rules) {
    const cmd = buildRuleCommand(rule);
    assert.ok(cmd && cmd.length > 0, `no command for ${rule.type}`);
    assert.match(cmd, /echo OK \|\| echo FAIL$/, `${rule.type}: ${cmd}`);
  }
});

test('unknown rule types return null', () => {
  assert.equal(buildRuleCommand({ type: 'nope', params: {} }), null);
});

test('parameters are embedded safely (no raw shell injection)', () => {
  const { execFileSync } = require('node:child_process');
  const cmd = buildRuleCommand({ type: 'file_exists', params: { path: 'x; rm -rf /' } });
  assert.ok(cmd.startsWith("test -f 'x; rm -rf /'"), cmd);
  const out = execFileSync('sh', ['-c', cmd], { encoding: 'utf8' });
  assert.match(out, /FAIL/, 'injected payload must not execute; the missing file must report FAIL');
});

test('command_history_contains matches the exact command a student ran', () => {
  const rule = { type: 'command_history_contains', params: { command: 'ping -c 3 127.0.0.1' } };
  assert.equal(matchesCommandHistory(rule, []), false);
  assert.equal(matchesCommandHistory(rule, ['ls -la', 'ping -c 3 127.0.0.1']), true);
});

test('command_history_contains tolerates extra flags, arg reordering and sudo prefixes', () => {
  const rule = { type: 'command_history_contains', params: { command: 'ping -c 3 127.0.0.1' } };
  assert.equal(matchesCommandHistory(rule, ['ping 127.0.0.1 -c 3']), true);
  assert.equal(matchesCommandHistory(rule, ['sudo ping -c 3 -q 127.0.0.1']), true);
});

test('command_history_contains rejects commands missing key tokens', () => {
  const rule = { type: 'command_history_contains', params: { command: 'ping -c 3 127.0.0.1' } };
  assert.equal(matchesCommandHistory(rule, ['ping 127.0.0.1']), false);
  assert.equal(matchesCommandHistory(rule, ['ping -c 3 localhost']), false);
});

test('command_history_contains accepts any listed alias', () => {
  const rule = {
    type: 'command_history_contains',
    params: { command: 'ss -tulpn', aliases: ['netstat -tulpn'] },
  };
  assert.equal(matchesCommandHistory(rule, ['ss -tulpn']), true);
  assert.equal(matchesCommandHistory(rule, ['netstat -tulpn']), true);
  assert.equal(matchesCommandHistory(rule, ['ss -lnt']), false);
});

test('command_history_contains without params never matches', () => {
  assert.equal(matchesCommandHistory({ type: 'command_history_contains', params: {} }, ['anything']), false);
});
