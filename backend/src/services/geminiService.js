const config = require('../config');
const { HttpError } = require('../utils/httpError');

/**
 * Thin wrapper around the Gemini REST API (no SDK dependency).
 * Uses the free tier; fails gracefully with a 503 when no key is set.
 */
async function callGemini(system, user, opts = {}) {
  if (!config.gemini.apiKey) {
    throw new HttpError(503, 'Gemini API key is not configured on the server');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent`;
  const body = {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents:
      opts.contents ||
      [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 1024,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.gemini.apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new HttpError(502, `Gemini API error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new HttpError(502, 'Gemini returned an empty response');
  }
  return text;
}

function formatLiveState(live) {
  if (!live || !live.checks || live.checks.length === 0) return '';
  const failed = live.checks.filter((c) => !c.passed);
  const parts = [`Current progress: passed ${live.passedCount} of ${live.totalRules} validation checks.`];
  if (failed.length > 0) {
    parts.push(
      'Failed checks:' +
        failed
          .map((c) => `\n- ${c.label} (observed: ${c.actual || 'not satisfied'})`)
          .join('')
    );
  }
  parts.push(
    'Use read-only commands like `cat`, `less`, `ls`, `getent`, `systemctl status` to inspect the server state when relevant.'
  );
  return parts.join('\n');
}

async function generateHint(task, attempt, live) {
  return callGemini(
    'You are a Linux instructor helping a student inside an isolated lab container. ' +
      'Give ONLY a small, partial clue (2-4 sentences) that points them in the right direction. ' +
      'Do NOT reveal the full solution or exact commands. Use their recent commands and current progress ' +
      'to see where they are stuck, and tell them which read-only commands (cat/less/getent/systemctl status) ' +
      'to run to inspect the server themselves.',
    `Task: ${task.title}\nScenario: ${task.scenario}\nObjectives: ${(task.objectives || []).join('; ')}\n\n` +
      `Student's recent commands:\n${(attempt.commandHistory || []).slice(-10).join('\n') || '(none yet)'}\n\n` +
      `${formatLiveState(live)}\n\n` +
      `Give a small clue for the next step.`,
    { temperature: 0.5, maxTokens: 300 }
  );
}

async function generateExplain(task, live) {
  return callGemini(
    'You are a Linux instructor. Explain the relevant Linux concept for this task clearly and simply ' +
      '(max 160 words). Do NOT give the exact solution steps or commands to run. Reference what the student ' +
      'has already done and which checks are still failing, and suggest read-only commands (cat/less) to inspect ' +
      'the current state themselves.',
    `Task: ${task.title}\nCategory: ${task.category?.name || 'Linux'}\nScenario: ${task.scenario}\n\n` +
      `Learning outcomes: ${(task.learningOutcomes || []).join('; ')}\n\n` +
      `${formatLiveState(live)}\n\n` +
      `Explain the core concept the student needs to understand for this task.`,
    { temperature: 0.4, maxTokens: 500 }
  );
}

/**
 * Multi-turn lab tutor chat. `history` is [{ role: 'user'|'assistant', text }],
 * `live` is the result of runLiveChecks (current validation state).
 */
async function chatWithAi(task, attempt, history, message, live) {
  const facts =
    `You are the AI lab tutor inside a student's Linux container. The student is doing the task below. ` +
    `Use their progress and commands to answer. Be concise and practical; never give the full solution unless asked; ` +
    `guide them with read-only inspection commands (cat/less/getent/systemctl status) when relevant. ` +
    `You can also reference which validation checks are failing.\n\n` +
    `Task: ${task.title}\nScenario: ${task.scenario}\nObjectives: ${(task.objectives || []).join('; ')}\n\n` +
    `Student's recent commands:\n${(attempt.commandHistory || []).slice(-12).join('\n') || '(none yet)'}\n\n` +
    `${formatLiveState(live)}`;

  const contents = [];
  for (const m of history || []) {
    if (m && m.text) contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] });
  }
  contents.push({ role: 'user', parts: [{ text: String(message) }] });

  return callGemini(facts, null, { contents, temperature: 0.5, maxTokens: 700 });
}

module.exports = { callGemini, generateHint, generateExplain, chatWithAi };
