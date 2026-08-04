/* Generate Killercoda scenarios from LinuxLab tasks.
   Each published task becomes a scenario folder (index.json + intro/finish md +
   setup.sh + per-step text.md/verify.sh) that you push to the
   linuxlab-59-killercoda GitHub repo. Killercoda auto-publishes on push.

   Usage:
     cd backend
     MONGODB_URI="<uri>" node scripts/generate-killercoda.js \
       --task "Onboarding and Offboarding Staff Accounts" \
       --task "Offboarding: remove a departed intern" \
       --out ../linuxlab-59-killercoda

   Without --task, all published tasks are generated. */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

function slugify(title) {
  return String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function shQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

// Mirrors backend/src/services/evaluationService.js buildRuleCommand.
// Returns a bash expression that exits 0 when the check passes.
function ruleToBash(rule) {
  const p = rule.params || {};
  const map = {
    file_exists: () => `test -f ${shQuote(p.path)}`,
    dir_exists: () => `test -d ${shQuote(p.path)}`,
    user_exists: () => `id -u ${shQuote(p.username)} >/dev/null 2>&1`,
    user_absent: () => `! id -u ${shQuote(p.username)} >/dev/null 2>&1`,
    group_exists: () => `getent group ${shQuote(p.group)} >/dev/null 2>&1`,
    group_absent: () => `! getent group ${shQuote(p.group)} >/dev/null 2>&1`,
    package_installed: () => `dpkg -s ${shQuote(p.package)} >/dev/null 2>&1`,
    service_active: () => `systemctl is-active --quiet ${shQuote(p.service)}`,
    service_enabled: () => `systemctl is-enabled --quiet ${shQuote(p.service)} 2>/dev/null`,
    port_open: () => `ss -ltn 2>/dev/null | grep -qE '[:.]${Number(p.port)}(\\s|$)'`,
    file_contains: () => `grep -qF ${shQuote(p.needle)} ${shQuote(p.path)} 2>/dev/null`,
    file_permissions: () => `[ "$(stat -c '%a' ${shQuote(p.path)} 2>/dev/null)" = "${p.expected}" ]`,
    file_owner: () => `[ "$(stat -c '%U:%G' ${shQuote(p.path)} 2>/dev/null)" = "${p.expected}" ]`,
    command_contains: () => `${p.command} 2>&1 | grep -qF ${shQuote(p.needle)}`,
  };
  const fn = map[rule.type];
  return fn ? fn() : null;
}

function ruleKeywords(rule) {
  const p = rule.params || {};
  return [
    p.username,
    p.group,
    p.service,
    p.package,
    p.path,
    p.port ? String(p.port) : '',
  ].filter(Boolean).map((k) => String(k).toLowerCase());
}

function assignRulesToSteps(task) {
  const instructions = task.instructions || [];
  const rules = task.validationRules || [];
  const steps = instructions.map(() => []);
  const unmatched = [];
  for (const rule of rules) {
    const keywords = ruleKeywords(rule);
    let best = -1;
    instructions.forEach((ins, i) => {
      const text = String(ins).toLowerCase();
      if (best === -1 && keywords.some((k) => text.includes(k))) best = i;
    });
    if (best >= 0) steps[best].push(rule);
    else unmatched.push(rule);
  }
  return { steps, unmatched };
}

function writeStep(dir, idx, title, text, rules) {
  const sdir = path.join(dir, `step${idx}`);
  fs.mkdirSync(sdir, { recursive: true });
  const lines = [`# ${idx}. ${title}`, '', text];
  if (rules.length > 0) {
    lines.push('', '## Check yourself', '');
    for (const r of rules) lines.push(`- ${r.label || r.type}`);
  }
  fs.writeFileSync(path.join(sdir, 'text.md'), lines.join('\n') + '\n');

  if (rules.length > 0) {
    const checks = rules
      .map((r) => {
        const cmd = ruleToBash(r);
        if (!cmd) return null;
        return `if ${cmd}; then\n  echo "PASS: ${r.label || r.type}"\nelse\n  echo "FAIL: ${r.label || r.type}"\n  exit 1\nfi`;
      })
      .filter(Boolean);
    const verify = ['#!/bin/bash', 'set +e', '']
      .concat(checks)
      .concat(['', 'echo "All checks passed"', 'exit 0']);
    fs.writeFileSync(path.join(sdir, 'verify.sh'), verify.join('\n') + '\n');
  } else {
    // No automated rule for this step: make the verify a manual "continue" that
    // always passes so students can proceed.
    fs.writeFileSync(
      path.join(sdir, 'verify.sh'),
      '#!/bin/bash\n# No automated check for this step.\nexit 0\n'
    );
  }
}

function writeScenario(outDir, task) {
  const slug = slugify(task.title);
  const dir = path.join(outDir, slug);
  fs.mkdirSync(dir, { recursive: true });

  const { steps, unmatched } = assignRulesToSteps(task);

  // setup.sh — simulates the scenario before the student starts
  const setupCommands = Array.isArray(task.setupCommands) ? task.setupCommands.filter((c) => c && c.trim()) : [];
  if (setupCommands.length > 0) {
    fs.writeFileSync(
      path.join(dir, 'setup.sh'),
      '#!/bin/bash\n# Runs once when the environment starts (simulated scenario state).\nset -e\n' +
        setupCommands.join('\n') +
        '\n'
    );
  }

  // intro.md
  const intro = ['# ' + task.title, '']
    .concat(task.scenario ? ['**Scenario**', '', task.scenario, ''] : [])
    .concat(task.requirements && task.requirements.length ? ['**Requirements**', ''] : [])
    .concat((task.requirements || []).map((r) => `- ${r}`))
    .concat(['']);
  fs.writeFileSync(path.join(dir, 'intro.md'), intro.join('\n'));

  // steps
  const stepDefs = (task.instructions || []).map((ins, i) => {
    const title = ins.length > 60 ? ins.slice(0, 57).trimEnd() + '…' : ins;
    writeStep(dir, i + 1, title, ins, steps[i]);
    return { title, text: `step${i + 1}/text.md`, verify: `step${i + 1}/verify.sh` };
  });

  // catch-all step for unmatched rules
  if (unmatched.length > 0) {
    const idx = stepDefs.length + 1;
    const title = 'Final verification';
    const lines = ['# Final verification', '', 'Verify the overall result of this task:'];
    writeStep(dir, idx, title, lines.join('\n'), unmatched);
    stepDefs.push({ title, text: `step${idx}/text.md`, verify: `step${idx}/verify.sh` });
  }

  // finish.md
  const finish = ['# Complete', '']
    .concat(task.expectedOutcome ? ['**Expected outcome**', '', task.expectedOutcome, ''] : [])
    .concat(task.learningOutcomes && task.learningOutcomes.length ? ['**You learned**', ''] : [])
    .concat((task.learningOutcomes || []).map((l) => `- ${l}`))
    .concat(['']);
  fs.writeFileSync(path.join(dir, 'finish.md'), finish.join('\n'));

  // index.json
  const details = {
    intro: { text: 'intro.md' },
    steps: stepDefs,
    finish: { text: 'finish.md' },
  };
  if (setupCommands.length > 0) details.intro.background = 'setup.sh';
  const index = {
    title: task.title,
    description: task.scenario || '',
    details,
    backend: { imageid: 'ubuntu' },
  };
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  return { slug, dir, steps: stepDefs.length };
}

async function main() {
  const args = process.argv.slice(2);
  const wanted = [];
  let outDir = path.resolve(__dirname, '..', '..', 'linuxlab-59-killercoda');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--task' && args[i + 1]) wanted.push(args[i + 1]);
    if (args[i] === '--out' && args[i + 1]) outDir = path.resolve(args[i + 1]);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI (the database connection string) first.');
  await mongoose.connect(uri);
  console.log('[killercoda] connected');

  const filter = { status: 'published' };
  if (wanted.length > 0) filter.title = { $in: wanted };
  const tasks = await Task.find(filter).lean();

  if (tasks.length === 0) {
    await mongoose.disconnect();
    throw new Error('No published tasks found to generate.');
  }

  fs.mkdirSync(outDir, { recursive: true });
  let generated = 0;
  for (const task of tasks) {
    const { slug, steps } = writeScenario(outDir, task);
    generated += 1;
    console.log(`[killercoda] ${slug} (${steps} steps) -> ${slug}/`);
  }

  fs.writeFileSync(path.join(outDir, 'README.md'), 'LinuxLab-59 Killercoda scenarios\n');
  console.log(`[killercoda] done — ${generated} scenario(s) in ${outDir}`);
  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[killercoda] failed:', e.message);
    process.exit(1);
  });
