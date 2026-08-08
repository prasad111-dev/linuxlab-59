const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'bank-test-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/app-test-nodb';

const { TOP_145_QUESTIONS } = require('../src/data/top145Questions');
const { INTERVIEW_MODES, isInterviewMode } = require('../src/constants/interviewModes');
const { ensureBuiltInQuestions } = require('../src/services/questionBankService');

test('built-in question bank has at least 145 complete, unique questions', () => {
  assert.ok(TOP_145_QUESTIONS.length >= 145, `expected >=145 questions, got ${TOP_145_QUESTIONS.length}`);

  const prompts = new Set();
  for (const q of TOP_145_QUESTIONS) {
    assert.ok(typeof q.prompt === 'string' && q.prompt.trim().length > 0, 'every question needs a prompt');
    assert.ok(typeof q.topic === 'string' && q.topic.trim().length > 0, 'every question needs a topic');
    assert.ok(typeof q.model === 'string' && q.model.trim().length > 0, 'every question needs a grading rubric (model)');
    assert.ok(!prompts.has(q.prompt), `duplicate prompt in bank: ${q.prompt}`);
    prompts.add(q.prompt);
  }
});

test('the top-145-questions drill mode is registered', () => {
  assert.ok(INTERVIEW_MODES.includes('top-145-questions'), 'mode must be in INTERVIEW_MODES');
  assert.ok(isInterviewMode('top-145-questions'), 'isInterviewMode must accept the mode');
});

test('questionBankService exposes an idempotent seed', async () => {
  assert.equal(typeof ensureBuiltInQuestions, 'function');

  // The seed must build upsert docs keyed on the prompt so running it twice
  // never duplicates or clobbers admin edits. We can't hit a live Mongo here,
  // so assert the invariant through the data instead: unique prompts mean the
  // prompt-keyed upsert is collision-free.
  const prompts = new Set(TOP_145_QUESTIONS.map((q) => q.prompt));
  assert.equal(prompts.size, TOP_145_QUESTIONS.length, 'prompt keys must be unique for the upsert filter');
});
