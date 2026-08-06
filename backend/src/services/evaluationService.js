const config = require('../config');
const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const orchestrator = require('./orchestratorClient');
const { callGemini } = require('./geminiService');
const { buildRuleCommand } = require('./ruleCommands');

function humanLabel(rule, passed) {
  if (passed) return rule.label;
  return rule.label;
}

/**
 * Run every validation rule against the live container.
 * Returns { checks, passedCount, totalRules, updatedAt }.
 */
async function runLiveChecks(task, containerId, timeoutMs = 10000) {
  const results = await Promise.all(
    (task.validationRules || []).map(async (rule, index) => {
      const command = buildRuleCommand(rule);
      if (!command) {
        return { index, label: rule.label, type: rule.type, passed: false, actual: 'unsupported rule type' };
      }
      try {
        const out = await orchestrator.execInContainer(containerId, command, timeoutMs);
        const passed = String(out.stdout || '').trim().split('\n').pop() === 'OK';
        return {
          index,
          label: rule.label,
          type: rule.type,
          passed,
          actual: passed ? 'OK' : (out.stdout || out.stderr || '').trim().slice(0, 120),
        };
      } catch {
        return { index, label: rule.label, type: rule.type, passed: false, actual: 'container unreachable' };
      }
    })
  );
  const checks = results.sort((a, b) => a.index - b.index);
  return {
    checks,
    passedCount: checks.filter((c) => c.passed).length,
    totalRules: checks.length,
    updatedAt: new Date().toISOString(),
  };
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

module.exports = { evaluateAttempt, buildRuleCommand, runLiveChecks };
