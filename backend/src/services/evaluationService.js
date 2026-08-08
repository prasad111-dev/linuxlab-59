const config = require('../config');
const Task = require('../models/Task');
const Attempt = require('../models/Attempt');
const orchestrator = require('./orchestratorClient');
const { callGemini } = require('./geminiService');
const { buildRuleCommand, matchesCommandHistory } = require('./ruleCommands');

function isHistoryRule(rule) {
  return rule.type === 'command_history_contains';
}

function humanLabel(rule, passed) {
  return rule.label;
}

/** Run one rule command with a single retry — transient container blips (a
 *  process being killed mid-restart, a busy socket) must not count as a hard
 *  evaluation failure. Returns the orchestrator output or null when both
 *  attempts fail. */
async function execWithRetry(containerId, command, timeoutMs) {
  for (let i = 0; i < 2; i++) {
    try {
      return await orchestrator.execInContainer(containerId, command, timeoutMs);
    } catch (e) {
      if (i === 0) await new Promise((r) => setTimeout(r, 400));
      else throw e;
    }
  }
  return null;
}

/**
 * Run every validation rule against the live container (or the student's
 * command history for command_history_contains rules).
 * Returns { checks, passedCount, totalRules, updatedAt }.
 */
async function runLiveChecks(task, containerId, timeoutMs = 10000, commandHistory = []) {
  const results = await Promise.all(
    (task.validationRules || []).map(async (rule, index) => {
      if (isHistoryRule(rule)) {
        const passed = matchesCommandHistory(rule, commandHistory);
        return {
          index,
          label: rule.label,
          type: rule.type,
          passed,
          actual: passed ? 'command found in history' : 'command not run yet',
        };
      }
      const command = buildRuleCommand(rule);
      if (!command) {
        return { index, label: rule.label, type: rule.type, passed: false, actual: 'unsupported rule type' };
      }
      try {
        const out = await execWithRetry(containerId, command, timeoutMs);
        if (!out) {
          return { index, label: rule.label, type: rule.type, passed: false, actual: 'container unreachable' };
        }
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
  // Measure at the start: wall time spent by the student, not the evaluation.
  const timeTakenSeconds = Math.max(1, Math.round((Date.now() - attempt.startedAt.getTime()) / 1000));

  for (const rule of task.validationRules || []) {
    if (isHistoryRule(rule)) {
      const passed = matchesCommandHistory(rule, attempt.commandHistory || []);
      results.push({
        label: humanLabel(rule, passed),
        passed,
        expected: rule.params?.command || rule.label,
        actual: passed ? 'command found in history' : 'command not run',
      });
      continue;
    }
    const command = buildRuleCommand(rule);
    if (!command) {
      results.push({ label: rule.label, passed: false, expected: 'valid rule', actual: 'unsupported rule type' });
      continue;
    }
    try {
      const out = await execWithRetry(attempt.containerId, command, 20000);
      const passed = out ? String(out.stdout || '').trim().split('\n').pop() === 'OK' : false;
      results.push({
        label: humanLabel(rule, passed),
        passed,
        expected: rule.params?.expected || rule.label,
        actual: passed ? 'OK' : (out && (out.stdout || out.stderr || 'no output').trim().slice(0, 300)) || 'container unreachable',
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
  const passed = totalRules > 0 && maxScore > 0 && score / maxScore >= config.passMark / 100;

  const mistakes = results.filter((r) => !r.passed);
  const rulesSummary = results
    .map((r) => `${r.passed ? '✅' : '❌'} ${r.label}`)
    .join('\n');

  let feedback =
    totalRules === 0
      ? 'This task has no validation checks configured — ask your instructor to add rules before it can be scored.'
      : mistakes.length === 0
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
