const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { SEED_TASKS } = require('../src/seed');
const { buildRuleCommand } = require('../src/services/ruleCommands');

/**
 * End-to-end check of the "Backup, compress, and recover the server
 * configuration" task's grading.
 *
 * We cannot spin up the real lab container here, so we reproduce the two
 * things evaluationService does: build the shell check with buildRuleCommand,
 * then run it and pass when the last output line is exactly "OK". The
 * container is simulated by a sandbox directory whose layout mirrors a fully
 * completed solution. Task commands reference absolute paths (/backup, /etc,
 * /root) — those prefixes are re-rooted into the sandbox so the exact commands
 * run unmodified apart from the filesystem root.
 */

const TASK = SEED_TASKS.find((t) => t.title.includes('Backup, compress, and recover'));
assert.ok(TASK, 'backup task must exist in SEED_TASKS');

let sandbox;

function inSandbox(cmd) {
  // Re-root the absolute path prefixes used by this task into the sandbox.
  // Only path prefixes are rewritten; needles like 'etc/passwd' or
  // 'root:x:0:0' have no leading slash and are left untouched.
  return cmd.replace(/\/(backup|etc|root)(?=[/'"\s]|$)/g, (m) => `${sandbox}${m}`);
}

function sh(cmd) {
  return execFileSync('sh', ['-c', inSandbox(cmd)], { encoding: 'utf8' });
}

function runCheck(rule) {
  const cmd = buildRuleCommand(rule);
  assert.ok(cmd, `no check command built for rule: ${rule.type} — ${rule.label}`);
  const out = sh(cmd);
  const passed = String(out).trim().split('\n').pop() === 'OK';
  return { label: rule.label, passed, out };
}

function seedEtc() {
  fs.mkdirSync(path.join(sandbox, 'etc'), { recursive: true });
  fs.writeFileSync(path.join(sandbox, 'etc', 'passwd'), 'root:x:0:0:root:/root:/bin/bash\n');
  fs.writeFileSync(path.join(sandbox, 'etc', 'hostname'), 'linuxlab\n');
}

function runAllChecks() {
  const results = TASK.validationRules.map(runCheck);
  return {
    passedCount: results.filter((r) => r.passed).length,
    totalRules: results.length,
    results,
  };
}

before(() => {
  sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'backup-task-'));
  seedEtc();
});

after(() => {
  if (sandbox) fs.rmSync(sandbox, { recursive: true, force: true });
});

test('every validation rule and every section check builds a command', () => {
  const all = [...TASK.validationRules, ...TASK.sections.flatMap((s) => s.checks)];
  for (const rule of all) {
    const cmd = buildRuleCommand(rule);
    assert.ok(cmd, `no command for ${rule.type}: ${rule.label}`);
    assert.match(cmd, /echo OK \|\| echo FAIL$/, `${rule.label}: ${cmd}`);
  }
});

test('an unstarted task is detected: 0 of 15 checks pass', () => {
  const { passedCount, totalRules } = runAllChecks();
  assert.equal(totalRules, 15);
  assert.equal(passedCount, 0, JSON.stringify(runAllChecks().results.filter((r) => r.passed), null, 2));
});

test('completing the full solution passes all 15 checks', () => {
  for (const line of TASK.solution.split('\n')) {
    sh(line); // each step must succeed (throws on failure)
  }

  const { passedCount, totalRules, results } = runAllChecks();
  assert.equal(totalRules, 15);
  assert.deepEqual(
    results.filter((r) => !r.passed).map((r) => r.label),
    [],
    `failing checks:\n${JSON.stringify(results.filter((r) => !r.passed), null, 2)}`
  );
  assert.equal(passedCount, 15);
});

test('grading validates real compression, not just the file name', () => {
  // New sandbox where the ".gz" archive is a plain tar (no -z flag).
  const fake = fs.mkdtempSync(path.join(os.tmpdir(), 'backup-task-'));
  const prev = sandbox;
  sandbox = fake;
  try {
    seedEtc();
    sh('mkdir -p /backup');
    sh('tar -cf /backup/etc_backup_gzip.tar.gz /etc'); // note: no -z
    sh('tar -cJf /backup/etc_backup_xz.tar.xz /etc');

    const gzipRule = TASK.validationRules.find((r) => r.label.includes('gzip data'));
    const xzRule = TASK.validationRules.find((r) => r.label.includes('XZ data'));
    const gzip = runCheck(gzipRule);
    const xz = runCheck(xzRule);

    assert.equal(gzip.passed, false, 'plain tar named .gz must NOT be accepted as gzip');
    assert.equal(xz.passed, true, 'genuine xz archive must pass its format check');
    assert.match(gzip.out, /FAIL/, gzip.out);
  } finally {
    sandbox = prev;
    fs.rmSync(fake, { recursive: true, force: true });
  }
});
