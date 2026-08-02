const config = require('../config');
const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const orchestrator = require('./orchestratorClient');
const { callGemini } = require('./geminiService');

function shellQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function buildRuleCommand(rule) {
  const p = rule.params || {};
  const v = {
    file_exists: () => `test -f ${shellQuote(p.path)} && echo OK || echo FAIL`,
    dir_exists: () => `test -d ${shellQuote(p.path)} && echo OK || echo FAIL`,
    user_exists: () => `id -u ${shellQuote(p.username)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    group_exists: () => `getent group ${shellQuote(p.group)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    package_installed: () =>
      `dpkg -s ${shellQuote(p.package)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    service_active: () => `systemctl is-active --quiet ${shellQuote(p.service)} && echo OK || echo FAIL`,
    service_enabled: () =>
      `systemctl is-enabled --quiet ${shellQuote(p.service)} 2>/dev/null && echo OK || echo FAIL`,
    port_open: () => `ss -ltn 2>/dev/null | grep -qE '[:.]${Number(p.port)}(\\s|$)' && echo OK || echo FAIL`,
    file_contains: () =>
      `grep -qF ${shellQuote(p.needle)} ${shellQuote(p.path)} 2>/dev/null && echo OK || echo FAIL`,
    file_permissions: () =>
      `[ "$(stat -c '%a' ${shellQuote(p.path)} 2>/dev/null)" = "${p.expected}" ] && echo OK || echo FAIL`,
    file_owner: () =>
      `[ "$(stat -c '%U:%G' ${shellQuote(p.path)} 2>/dev/null)" = "${p.expected}" ] && echo OK || echo FAIL`,
    command_contains: () => `${p.command} 2>&1 | grep -qF ${shellQuote(p.needle)} && echo OK || echo FAIL`,
  };
  const builder = v[rule.type];
  if (!builder) return null;
  return builder();
}

function humanLabel(rule, passed) {
  if (passed) return rule.label;
  return rule.label;
}

async function evaluateAttempt(attempt, task) {
  const results = [];
  let containerOk = true;

  for (const rule of task.validationRules || []) {
    const command = buildRuleCommand(rule);
    if (!command) {
      results.push({ label: rule.label, passed: false, expected: 'valid rule', actual: 'unsupported rule type' });
      continue;
    }
    try {
      const out = await orchestrator.execInContainer(attempt.containerId, command, 20000);
      const passed = String(out.stdout || '').trim().split('\n').pop() === 'OK';
      results.push({
        label: humanLabel(rule, passed),
        passed,
        expected: rule.params?.expected || rule.label,
        actual: passed ? 'OK' : (out.stdout || out.stderr || 'no output').trim().slice(0, 300),
      });
    } catch (e) {
      containerOk = false;
      results.push({ label: rule.label, passed: false, expected: rule.label, actual: `container error: ${e.message}` });
    }
  }

  if (!containerOk) {
    throw new Error('lab container is no longer running — session expired');
  }

  const totalRules = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const score = totalRules ? Math.round((passedCount / totalRules) * task.points) : 0;
  const maxScore = task.points;
  const passed = maxScore > 0 && score / maxScore >= config.passMark / 100;
  const timeTakenSeconds = Math.max(1, Math.round((Date.now() - attempt.startedAt.getTime()) / 1000));

  const mistakes = results.filter((r) => !r.passed);
  const rulesSummary = results
    .map((r) => `${r.passed ? '✅' : '❌'} ${r.label}`)
    .join('\n');

  let feedback =
    mistakes.length === 0
      ? 'Excellent work! Every validation check passed. Your configuration is correct and production-ready.'
      : `You passed ${passedCount} of ${totalRules} checks. Review the failed checks below and retry.`;

  let optimization = '';
  let geminiComment = '';
  if (config.gemini.apiKey && (mistakes.length > 0 || config.isProd)) {
    try {
      geminiComment = await callGemini(
        'You are a senior Linux administrator giving feedback to a student in a Linux lab. ' +
          'Be concise (max 120 words). Do NOT provide the full solution — give a pointer and best practices.',
        `Task: ${task.title}\nScenario: ${task.scenario}\n` +
          `Checks:\n${rulesSummary}\n\n` +
          `Student command history (best effort):\n${(attempt.commandHistory || []).slice(-15).join('\n')}\n\n` +
          `Give brief feedback on what likely went wrong and the best practice for this task.`,
        { temperature: 0.4, maxTokens: 600 }
      );
      optimization = geminiComment;
    } catch {
      /* graceful */
    }
  }
  if (!optimization) {
    optimization =
      mistakes.length === 0
        ? 'Keep going! Consider writing your commands into repeatable scripts and documenting configuration changes for your team.'
        : 'Tip: review the failed checks, read the relevant man pages, and verify each objective one at a time before resubmitting.';
  }

  // Recommended next task: another published task in the same category
  const recommendedNext = await Task.findOne({
    _id: { $ne: task._id },
    category: task.category,
    status: 'published',
  })
    .sort({ points: 1 })
    .select('_id title')
    .lean();

  return {
    score,
    maxScore,
    passed,
    timeTakenSeconds,
    mistakes,
    rulesSummary,
    feedback: `${feedback}\n${rulesSummary}`,
    optimization,
    correctSolution: task.solution || '',
    recommendedNext: recommendedNext
      ? { taskId: recommendedNext._id.toString(), title: recommendedNext.title }
      : null,
    evaluation: { results, passedCount, totalRules },
  };
}

module.exports = { evaluateAttempt, buildRuleCommand };
