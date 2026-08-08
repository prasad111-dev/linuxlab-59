const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { SEED_TASKS } = require('../src/seed');
const { buildRuleCommand, matchesCommandHistory } = require('../src/services/ruleCommands');
const { buildPolicy, checkCommand } = require('../src/services/commandPolicy');

/**
 * End-to-end checks for the "Audit the network stack before go-live" task.
 *
 * The command_contains / port_open rules depend on the live container (eth0,
 * sshd, ufw, iptables), so they are covered by command building plus the full
 * solution being accepted by the task command gate. The netplan file rules are
 * exercised against a sandbox directory that mirrors the expected final
 * /etc/netplan layout (re-rooted from /etc/netplan/01-netcfg.yaml).
 */

const TASK = SEED_TASKS.find((t) => t.title.includes('Audit the network stack'));
assert.ok(TASK, 'network audit task must exist in SEED_TASKS');

const FILE_RULES = TASK.validationRules.filter((r) => r.type.startsWith('file_'));
const NETPLAN_PATH = '/etc/netplan/01-netcfg.yaml';

let sandbox;

function inSandbox(cmd) {
  return cmd.replaceAll(NETPLAN_PATH, path.join(sandbox, 'etc', 'netplan', '01-netcfg.yaml'));
}

function sh(cmd) {
  return execFileSync('sh', ['-c', inSandbox(cmd)], { encoding: 'utf8' });
}

function runCheck(rule) {
  const cmd = buildRuleCommand(rule);
  assert.ok(cmd, `no check command built for rule: ${rule.type} — ${rule.label}`);
  const out = sh(cmd);
  const passed = String(out).trim().split('\n').pop() === 'OK';
  return { label: rule.label, type: rule.type, passed, out };
}

function writeNetplan(content) {
  const dir = path.join(sandbox, 'etc', 'netplan');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '01-netcfg.yaml'), content);
}

before(() => {
  sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'net-task-'));
});

after(() => {
  if (sandbox) fs.rmSync(sandbox, { recursive: true, force: true });
});

test('every validation rule is supported (shell or history based)', () => {
  assert.equal(TASK.validationRules.length, 16);
  const historyRules = TASK.validationRules.filter((r) => r.type === 'command_history_contains');
  const shellRules = TASK.validationRules.filter((r) => r.type !== 'command_history_contains');
  assert.equal(historyRules.length, 8, 'the phase 1-2 observation commands must be history based so they do not auto-tick from live container state');
  for (const rule of shellRules) {
    const cmd = buildRuleCommand(rule);
    assert.ok(cmd, `no command for ${rule.type}: ${rule.label}`);
    assert.match(cmd, /echo OK \|\| echo FAIL$/, `${rule.label}: ${cmd}`);
  }
  for (const rule of historyRules) {
    assert.equal(buildRuleCommand(rule), null, `${rule.label} must not build a live shell check`);
  }
});

test('history-based checks tick only after the student actually runs the commands', () => {
  const historyRules = TASK.validationRules.filter((r) => r.type === 'command_history_contains');
  for (const rule of historyRules) {
    assert.equal(matchesCommandHistory(rule, []), false, `${rule.label} must fail with no command history`);
  }
  const history = TASK.solution
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  for (const rule of historyRules) {
    assert.equal(matchesCommandHistory(rule, history), true, `${rule.label} must pass after the full solution runs`);
  }
});

test('the full solution is accepted by the task command gate', () => {
  const policy = buildPolicy(TASK);
  const lines = TASK.solution
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  assert.ok(lines.length >= 20, `expected a long multi-phase solution, got ${lines.length} lines`);
  for (const line of lines) {
    const res = checkCommand(line, policy);
    assert.equal(res.allowed, true, `solution line blocked by the gate: "${line}" — ${res.hint}`);
  }
});

test('netplan file rules pass when the static config is written correctly', () => {
  writeNetplan(
    'network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: false\n      addresses:\n        - 192.168.10.10/24\n'
  );
  const results = FILE_RULES.map(runCheck);
  const failing = results.filter((r) => !r.passed);
  assert.deepEqual(
    failing.map((r) => r.label),
    [],
    `failing file checks:\n${JSON.stringify(failing, null, 2)}`
  );
});

test('an unstarted task is detected for the netplan file rules', () => {
  const fresh = fs.mkdtempSync(path.join(os.tmpdir(), 'net-task-'));
  const prev = sandbox;
  sandbox = fresh;
  try {
    const results = FILE_RULES.map(runCheck);
    assert.equal(results.filter((r) => r.passed).length, 0);
  } finally {
    sandbox = prev;
    fs.rmSync(fresh, { recursive: true, force: true });
  }
});

test('grading checks real netplan content, not just file presence', () => {
  writeNetplan('network:\n  version: 2\n  ethernets:\n    eth0:\n      dhcp4: true\n');
  const results = FILE_RULES.map(runCheck);
  const passLabels = results.filter((r) => r.passed).map((r) => r.label);
  // file_exists passes, but the content rules (eth0 + addresses:) must not all pass
  assert.ok(!passLabels.includes('The netplan config must declare static addresses (addresses:)'), JSON.stringify(results, null, 2));
  assert.ok(passLabels.includes('Create the static IP config /etc/netplan/01-netcfg.yaml'));
});
