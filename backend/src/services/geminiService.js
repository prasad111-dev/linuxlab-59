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

/**
 * Interview prep AI analysis. `session` is { mode, score, maxScore, accuracy,
 * wpm, answers: [{prompt, answer, userAnswer, correct, topic}], weakTopics }.
 * Returns a structured markdown report the frontend renders as-is.
 */
async function generateInterviewReport(session) {
  const total = Math.max(1, session.answers.length || 1);
  const correct = session.answers.filter((a) => a.correct).length;
  const wrong = session.answers.filter((a) => !a.correct);
  const lines = session.answers.map(
    (a, i) =>
      `${i + 1}. [${a.correct ? 'correct' : 'WRONG'}] ${a.topic || 'Linux'}: ${a.prompt}\n` +
      `   expected: ${a.answer}\n` +
      `   you answered: ${a.userAnswer || '(blank)'}`
  );

  const modeFacts = {
    flashcard:
      'The student was doing a FLASHCARD DUEL: 125 multiple-choice command flashcards across 25 topic tiers (Navigation, Help, Files, Search, Text, Permissions, Processes, System info, Disk, Archives, Networking, DNS, Packages, Users, Groups, Links, Env vars, Scheduling, Bash, Scripting, Redirection, Signals, Security, Hardware).',
    quest:
      'The student was doing QUEST MODE: real-world Linux scenarios where they had to type the correct command or pipeline to solve each task.',
    typing:
      'The student was doing a TYPING SHOOTER: rapid typing of real Linux commands. Focus your analysis on command accuracy, typing speed (WPM) and which commands are most error prone.',
    'terminal-mission':
      'The student was doing TERMINAL MISSION: realistic support tickets (from beginner to production/emergency severity) where they must type the exact command that fixes the reported problem.',
    'admin-tickets':
      'The student was doing an ADMIN TICKET QUEUE: a queue of support tickets with priorities (critical/high/low) that must be resolved before a shift ends; each ticket needs the right command.',
    'permission-puzzle':
      'The student was doing a PERMISSION PUZZLE: reading and translating Linux permission strings, octal modes, and choosing the correct chmod command.',
    'wrong-command':
      'The student was doing FIND THE WRONG COMMAND: spotting the incorrect command in a set of options and explaining why it fails.',
    'incident-response':
      'The student was doing INCIDENT RESPONSE: a branching production incident (high CPU, app down, users locked out) where they picked the next correct diagnostic or remediation command at each step.',
    'build-command':
      'The student was doing BUILD THE COMMAND: composing a complete command from a written requirement (no options shown, they type it).',
    'command-detective':
      'The student was doing COMMAND DETECTIVE: given only terminal output, deduce which command produced it.',
    'escape-room':
      'The student was doing a LINUX ESCAPE ROOM: navigating a virtual filesystem with pwd/ls/cd/cat/find to find hidden files and unlock the next room.',
    'command-battle':
      'The student was doing a COMMAND BATTLE: time-pressured command tasks judged on speed and accuracy.',
    'career-mode':
      'The student was doing JUNIOR-TO-SENIOR CAREER MODE: climbing ranks from Junior Linux Admin to Site Reliability Engineer, solving level-gated command tasks.',
    'fix-mistake':
      'The student was doing FIX MY MISTAKE: diagnosing why a dangerous or wrong command is bad and choosing the safe fix.',
    'command-speedrun':
      'The student was doing a COMMAND SPEEDRUN: answering command tasks against a running countdown timer.',
    'production-checklist':
      'The student was doing a PRODUCTION CHECKLIST: completing a real deployment/operational checklist (e.g. deploying nginx) in the correct order.',
    'virtual-lab':
      'The student was doing a VIRTUAL LINUX LAB: exploring a simulated filesystem with real commands to complete goals, with no real VM required.',
    'command-chain':
      'The student was doing a COMMAND CHAIN: building multi-command pipelines (find | tar | gzip) to solve a task end-to-end.',
    'interview-simulation':
      'The student was doing an INTERVIEW SIMULATION: answering conceptual Linux interview questions in free text, graded by the AI on technical accuracy, completeness and confidence.',
    'daily-challenge':
      'The student was doing a DAILY LINUX CHALLENGE: a short rotating set of mixed command/MCQ tasks, one challenge per day.',
    'predict-output':
      'The student was doing PREDICT THE OUTPUT: predicting what a given command or script will print, proving they understand execution, not just syntax.',
    'scenario-generator':
      'The student was doing a SCENARIO GENERATOR: unique AI-generated administration scenarios (fresh company, ticket, difficulty) solved end-to-end.',
    'career-simulator':
      'The student was doing a LINUX ADMIN CAREER SIMULATOR: progressing through an entire career (join ABC Bank, handle tickets, incidents, audits, promotions) as a series of escalating tasks.',
  }[session.mode] || '';

  return callGemini(
    'You are a senior Linux technical interviewer and career coach. The student has completed an interview-prep drill. ' +
      'Write a concise, encouraging, and actionable analysis (markdown). Structure it exactly with these sections: ' +
      '## Verdict (one or two sentences summarizing readiness), ## Score (score/max, accuracy %, and for typing WPM), ' +
      '## Strengths (bullets), ## Areas to improve (bullets naming specific commands/topics from their mistakes), ' +
      '## Study plan (3 concrete next steps, listing specific commands to practice). ' +
      'Keep the whole report under 280 words. Use their actual mistakes below.',
    `${modeFacts}\n\nScore: ${session.score}/${session.maxScore} · Accuracy ${Math.round(session.accuracy || 0)}%` +
      `${session.mode === 'typing' && session.wpm ? ` · ${Math.round(session.wpm)} WPM` : ''}` +
      `\n\nWeak topics flagged: ${(session.weakTopics || []).join(', ') || 'none'}\n\n` +
      `Answers (${correct}/${total} correct):\n${lines.join('\n') || '(no answers recorded)'}\n\n` +
      (wrong.length > 0
        ? `Focus your critique mainly on these wrong answers:\n${wrong
            .map((a) => `- ${a.prompt} -> correct: ${a.answer}, user gave: ${a.userAnswer || '(blank)'}`)
            .join('\n')}`
        : ''),
    { temperature: 0.4, maxTokens: 900 }
  );
}

function extractJson(text) {
  const cleaned = String(text || '')
    .replace(/```json/gi, '```')
    .trim();
  const match = cleaned.match(/```\s*([\s\S]*?)\s*```/);
  const raw = match ? match[1] : cleaned;
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      /* fall through */
    }
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Gemini question generator for interview drills. `mode` selects the engine
 * (command / mcq / free) which drives the JSON shape returned. Returns an
 * array of questions the frontend can feed straight into the matching drill.
 */
async function generateInterviewQuestions(mode, opts = {}) {
  const topic = String(opts.topic || '').slice(0, 80);
  const count = Math.min(10, Math.max(1, Math.floor(Number(opts.count) || 5)));

  const promptFor = {
    command:
      'You are a Linux admin exam generator. Create realistic, correct tasks where the solution is a single command or short pipeline. ' +
      'Return ONLY a JSON array. Each item: {"prompt": "a concrete scenario/requirement", "answer": "the exact command", "topic": "short topic", "explanation": "why this command is correct"}. ' +
      'Mix difficulty. Ensure every command is valid on a standard Ubuntu system.',
    mcq:
      'You are a Linux admin exam generator. Create multiple-choice questions. ' +
      'Return ONLY a JSON array. Each item: {"prompt": "the question", "options": ["a","b","c","d"], "correctIndex": 0, "topic": "short topic", "explanation": "why the correct option is right and briefly why distractors are wrong"}. ' +
      'Exactly one correctIndex (0-3); options must be plausible; shuffle the correct answer position.',
    free:
      'You are a senior Linux interviewer. Create conceptual interview questions that test real understanding (permissions, processes, networking, shell, filesystem, systemd, troubleshooting). ' +
      'Return ONLY a JSON array. Each item: {"prompt": "the interview question", "topic": "short topic", "model": "a concise expected-answer rubric"}.',
  };

  const system =
    promptFor[mode] ||
    promptFor.command +
      '\nAlso accept any reasonable standard Linux admin scenario.';

  const extra = topic ? ` Focus all questions on the topic: ${topic}.` : '';

  const text = await callGemini(
    system,
    `Generate ${count} questions${extra}\nReturn ONLY the JSON array, no prose, no markdown fences.`,
    { temperature: 0.8, maxTokens: 2400 }
  );

  const parsed = extractJson(text);
  if (!Array.isArray(parsed)) {
    throw new HttpError(502, 'Gemini returned unparseable question data');
  }

  return parsed
    .filter((q) => q && typeof q === 'object' && q.prompt)
    .slice(0, count)
    .map((q) => ({
      prompt: String(q.prompt).slice(0, 300),
      answer: String(q.answer || '').slice(0, 300),
      topic: String(q.topic || 'Linux').slice(0, 80),
      explanation: String(q.explanation || '').slice(0, 300),
      options: Array.isArray(q.options)
        ? q.options.slice(0, 6).map((o) => String(o).slice(0, 120))
        : [],
      correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : -1,
      model: String(q.model || '').slice(0, 300),
    }));
}

/**
 * Grade a free-text interview answer with Gemini. Returns
 * { score (0-5), feedback, missing }.
 */
async function gradeInterviewAnswer(question, answer) {
  const text = await callGemini(
    'You are a senior Linux technical interviewer grading a candidate\'s answer. Be fair and specific. ' +
      'Return ONLY a JSON object: {"score": 0-5, "feedback": "2-3 sentences of concrete feedback", "missing": "one short sentence listing key points they missed or a sharper answer would mention"}. ' +
      'No markdown, no prose outside the JSON.',
    `Question: ${question.prompt}\nTopic: ${question.topic || 'Linux'}\nExpected rubric: ${question.model || 'not provided'}\n\nCandidate answer:\n${answer}\n\nGrade it.`,
    { temperature: 0.4, maxTokens: 500 }
  );

  const cleaned = String(text || '')
    .replace(/```json/gi, '```')
    .trim();
  const match = cleaned.match(/```\s*([\s\S]*?)\s*```/);
  const raw = match ? match[1] : cleaned;
  const obj = (() => {
    try {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      return JSON.parse(start !== -1 && end > start ? raw.slice(start, end + 1) : raw);
    } catch {
      return null;
    }
  })();

  if (!obj || typeof obj !== 'object') {
    return {
      score: 3,
      feedback: 'The AI grader could not parse a score, so your answer was recorded as a pass. Review the expected points below.',
      missing: question.model || '',
    };
  }

  const score = Math.max(0, Math.min(5, Math.round(Number(obj.score) || 0)));
  return {
    score,
    feedback: String(obj.feedback || '').slice(0, 500),
    missing: String(obj.missing || question.model || '').slice(0, 300),
  };
}

/**
 * Judge whether a user's typed command correctly accomplishes a task.
 * Accepts ANY valid approach (different tools/flags/pipelines that achieve
 * the same result) — not just the canonical answer. Returns
 * { correct, score (0-5), feedback, expected }.
 */
async function evaluateCommandAnswer(question, answer) {
  const text = await callGemini(
    'You are a senior Linux/DevOps engineer grading a candidate command in a lab. ' +
      'The candidate is NOT expected to reproduce one exact command — any safe, correct approach that accomplishes the task is a pass ' +
      '(e.g. ls -l vs ll, systemctl restart vs service restart, du -sh vs du -sh --apparent-size, find with different but equivalent expressions). ' +
      'Return ONLY JSON, no markdown: {"correct": true or false, "score": 0-5, "feedback": "1-2 short sentences explaining whether it is correct or what is wrong", "expected": "the canonical command or key steps"}.',
    `Task: ${question.prompt}\nExpected approach (for reference only): ${question.answer || 'not provided'}\nCandidate command:\n${answer}\n\nIs the candidate command a correct way to accomplish the task? Be fair to alternative valid approaches.`,
    { temperature: 0.2, maxTokens: 400 }
  );

  const cleaned = String(text || '')
    .replace(/```json/gi, '```')
    .trim();
  const match = cleaned.match(/```\s*([\s\S]*?)\s*```/);
  const raw = match ? match[1] : cleaned;
  const obj = (() => {
    try {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      return JSON.parse(start !== -1 && end > start ? raw.slice(start, end + 1) : raw);
    } catch {
      return null;
    }
  })();

  if (!obj || typeof obj !== 'object' || typeof obj.correct !== 'boolean') {
    throw new HttpError(502, 'AI grader could not parse its verdict');
  }

  const score = Math.max(0, Math.min(5, Math.round(Number(obj.score) || (obj.correct ? 5 : 0))));
  return {
    correct: obj.correct,
    score,
    feedback: String(obj.feedback || '').slice(0, 500),
    expected: String(obj.expected || question.answer || '').slice(0, 300),
  };
}

module.exports = {
  callGemini,
  generateHint,
  generateExplain,
  chatWithAi,
  generateInterviewReport,
  generateInterviewQuestions,
  gradeInterviewAnswer,
  evaluateCommandAnswer,
};
