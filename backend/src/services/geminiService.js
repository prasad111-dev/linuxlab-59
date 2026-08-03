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
    contents: [{ role: 'user', parts: [{ text: user }] }],
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

async function generateHint(task, attempt) {
  return callGemini(
    'You are a Linux instructor helping a student inside an isolated lab container. ' +
      'Give ONLY a small, partial clue (2-4 sentences) that points them in the right direction. ' +
      'Do NOT reveal the full solution or exact commands.',
    `Task: ${task.title}\nScenario: ${task.scenario}\nObjectives: ${(task.objectives || []).join('; ')}\n\n` +
      `Recent student commands:\n${(attempt.commandHistory || []).slice(-10).join('\n') || '(none yet)'}\n\n` +
      `Give a small clue for the next step.`,
    { temperature: 0.5, maxTokens: 300 }
  );
}

async function generateExplain(task) {
  return callGemini(
    'You are a Linux instructor. Explain the relevant Linux concept for this task clearly and simply ' +
      '(max 160 words). Do NOT give the exact solution steps or commands to run.',
    `Task: ${task.title}\nCategory: ${task.category?.name || 'Linux'}\nScenario: ${task.scenario}\n\n` +
      `Learning outcomes: ${(task.learningOutcomes || []).join('; ')}\n\n` +
      `Explain the core concept the student needs to understand for this task.`,
    { temperature: 0.4, maxTokens: 500 }
  );
}

module.exports = { callGemini, generateHint, generateExplain };
