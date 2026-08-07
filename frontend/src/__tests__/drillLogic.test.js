import { describe, it, expect } from 'vitest';
import { normalize, buildDaily } from '../lib/drillLogic';
import {
  QUESTS,
  TYPING_COMMANDS,
  FLASHCARDS,
  DRILL_DATA,
  MCQ_DATA,
  TICKET_DATA,
  CHECKLIST_DATA,
  FREE_DATA,
  CAREER_DATA,
  DAILY_POOL,
  SCENARIO_FALLBACK,
} from '../data/interviewData';

describe('normalize', () => {
  it('trims and collapses whitespace', () => {
    expect(normalize('  ls   -la  ')).toBe('ls -la');
    expect(normalize('')).toBe('');
    expect(normalize(undefined)).toBe('');
  });
});

describe('buildDaily', () => {
  it('returns 5 questions with the right mix and types', () => {
    const list = buildDaily(new Date('2026-08-06T12:00:00'));
    expect(list).toHaveLength(5);
    expect(list.filter((q) => q._type === 'command')).toHaveLength(3);
    expect(list.filter((q) => q._type === 'mcq')).toHaveLength(2);
  });

  it('is deterministic for the same day', () => {
    const a = buildDaily(new Date('2026-08-06T00:00:00'));
    const b = buildDaily(new Date('2026-08-06T23:59:59'));
    expect(a.map((q) => q.prompt).sort()).toEqual(b.map((q) => q.prompt).sort());
  });
});

describe('interview data invariants', () => {
  it('quest / typing / flashcard pools have the advertised sizes', () => {
    expect(QUESTS).toHaveLength(34);
    expect(TYPING_COMMANDS).toHaveLength(34);
    expect(FLASHCARDS).toHaveLength(130);
    expect(SCENARIO_FALLBACK.length).toBeGreaterThanOrEqual(5);
  });

  it('every MCQ question has options and a valid correctIndex', () => {
    const mcqQuestions = [...Object.values(MCQ_DATA).flat(), ...DAILY_POOL.mcq];
    for (const q of mcqQuestions) {
      expect(Array.isArray(q.options) && q.options.length >= 2).toBe(true);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });

  it('every command drill question has a non-empty answer', () => {
    const commandQuestions = Object.values(DRILL_DATA).flat();
    for (const q of commandQuestions) {
      expect(typeof q.answer === 'string' && q.answer.trim().length > 0).toBe(true);
    }
  });

  it('free-answer questions carry a model answer for the grader', () => {
    for (const q of FREE_DATA['interview-simulation']) {
      expect(typeof q.model === 'string' && q.model.length > 0).toBe(true);
    }
  });

  it('ticket and checklist pools are non-empty', () => {
    expect(Object.values(TICKET_DATA).flat().length).toBeGreaterThan(0);
    expect(Object.values(CHECKLIST_DATA).flat().length).toBeGreaterThan(0);
    expect(Object.values(CAREER_DATA).every((c) => c.levels.length > 0)).toBe(true);
  });
});
