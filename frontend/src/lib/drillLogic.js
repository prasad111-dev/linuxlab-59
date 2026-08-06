import { DAILY_POOL, shuffle } from '../data/interviewData';

/** Collapse whitespace so loosely-typed answers compare equal. */
export function normalize(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Build the fixed 5-question daily drill (3 command + 2 MCQ) for a given day. */
export function buildDaily(now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  const list = [];
  for (let i = 0; i < 3; i++) {
    const q = DAILY_POOL.command[(day + i * 3) % DAILY_POOL.command.length];
    list.push({ ...q, _type: 'command' });
  }
  for (let i = 0; i < 2; i++) {
    const q = DAILY_POOL.mcq[(day * 2 + i * 5) % DAILY_POOL.mcq.length];
    list.push({ ...q, _type: 'mcq' });
  }
  return shuffle(list);
}
