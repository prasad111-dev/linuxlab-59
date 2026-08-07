const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { SEED_TASKS } = require('../src/seed');
const { buildRuleCommand } = require('../src/services/ruleCommands');
const { buildPolicy, checkCommand } = require('../src/services/commandPolicy');

/**
 * End-to-end checks for the "Onboard a TCS employee" task.
 *
 * We cannot create real users here (tests run unprivileged), so the user /
 * group / aging / sudo rules are covered by command building + the full
 * solution being accepted by the task command gate, and the file rules are
 * exercised against a sandbox directory that mirrors the expected final home
 * directory layout (re-rooted from /home/priya.sharma).
 */

const TASK = SEED_TASKS.find((t) => t.title.includes('Onboard a TCS employee'));
assert.ok(TASK, 'TCS onboarding task must exist in SEED_TASKS');

const FILE_RULES = TASK.validationRules.filter((r) => r.type.startsWith('file_'));
const OWNER_RULES = FILE_RULES.filter((r) => r.type === 'file_owner');
const MODE_RULES = FILE_RULES.filter((r) => r.type === 'file_permissions');

let sandbox;

function inSandbox(cmd) {
  return cmd.replace(/\/home\/priya\.sharma(?=[/'"\s]|$)/g, (m) => `${sandbox}${m}`);
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

function runFileChecks(rules = FILE_RULES) {
  const results = rules.map(runCheck);
  return {
    passedCount: results.filter((r) => r.passed).length,
    results,
  };
}

before(() => {
  sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'tcs-task-'));
  fs.mkdirSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh'), { recursive: true, mode: 0o700 });
  fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma'), 0o700);
  fs.writeFileSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh', 'authorized_keys'), 'ssh-rsa AAAA test\n');
  fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh'), 0o700);
  fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh', 'authorized_keys'), 0o600);
});

after(() => {
  if (sandbox) fs.rmSync(sandbox, { recursive: true, force: true });
});

test('every validation rule builds a valid check command', () => {
  assert.equal(TASK.validationRules.length, 24);
  for (const rule of TASK.validationRules) {
    const cmd = buildRuleCommand(rule);
    assert.ok(cmd, `no command for ${rule.type}: ${rule.label}`);
    assert.match(cmd, /echo OK \|\| echo FAIL$/, `${rule.label}: ${cmd}`);
  }
});

test('the full solution is accepted by the task command gate', () => {
  const policy = buildPolicy(TASK);
  const lines = TASK.solution
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  assert.ok(lines.length >= 40, `expected a long multi-phase solution, got ${lines.length} lines`);
  for (const line of lines) {
    const res = checkCommand(line, policy);
    assert.equal(res.allowed, true, `solution line blocked by the gate: "${line}" — ${res.hint}`);
  }
  // shell comments in the annotated solution are no-ops for the gate
  assert.equal(checkCommand(TASK.solution.split('\n').find((l) => l.startsWith('#')), policy).allowed, true);
});

test('file rules pass when the final home layout is set up correctly', () => {
  const { passedCount, results } = runFileChecks();
  const failing = results.filter((r) => !r.passed && r.type !== 'file_owner');
  assert.deepEqual(
    failing.map((r) => r.label),
    [],
    `failing file checks:\n${JSON.stringify(failing, null, 2)}`
  );
  // file_owner rules compare against a real priya.sharma:priya account, which
  // an unprivileged sandbox cannot create — every other file rule must pass.
  assert.equal(passedCount, FILE_RULES.length - OWNER_RULES.length, JSON.stringify(results, null, 2));
});

test('an unstarted task is detected for the file rules', () => {
  const fresh = fs.mkdtempSync(path.join(os.tmpdir(), 'tcs-task-'));
  const prev = sandbox;
  sandbox = fresh;
  try {
    const { passedCount } = runFileChecks();
    assert.equal(passedCount, 0);
  } finally {
    sandbox = prev;
    fs.rmSync(fresh, { recursive: true, force: true });
  }
});

test('grading checks real modes, not just file presence', () => {
  fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma'), 0o755);
  fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh'), 0o755);
  fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh', 'authorized_keys'), 0o644);
  try {
    const modeResults = runFileChecks(MODE_RULES);
    assert.equal(modeResults.passedCount, 0, JSON.stringify(modeResults.results, null, 2));
  } finally {
    fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma'), 0o700);
    fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh'), 0o700);
    fs.chmodSync(path.join(sandbox, 'home', 'priya.sharma', '.ssh', 'authorized_keys'), 0o600);
  }
});

test('file_owner rules compare owner:group against priya.sharma:priya', () => {
  assert.equal(OWNER_RULES.length, 3);
  for (const rule of OWNER_RULES) {
    const cmd = buildRuleCommand(rule);
    assert.match(cmd, /stat -c '%U:%G'/, rule.label);
    assert.match(cmd, /priya\.sharma:priya/, rule.label);
  }
});
