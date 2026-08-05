import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/format';
import { useInterviewProgress } from '../lib/useInterviewProgress';
import InterviewReport from './InterviewReport';
import VirtualLab from './VirtualLab';
import { Spinner } from './Spinner';
import {
  modeMeta,
  DRILL_DATA,
  MCQ_DATA,
  TICKET_DATA,
  CHECKLIST_DATA,
  FREE_DATA,
  CAREER_DATA,
  VIRTUAL_LABS,
  DAILY_POOL,
  SCENARIO_FALLBACK,
} from '../data/interviewData';

function normalize(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Gemini judges a typed command and accepts any valid approach. Falls back to
// an exact-match comparison whenever the AI is unavailable (or in timed modes,
// where pacing matters more than spellings).
async function aiCheck(q, typed, timed) {
  try {
    if (timed) throw new Error('exact-match mode');
    const res = await api('/interview/evaluate-command', {
      method: 'POST',
      body: { question: { prompt: q.prompt, answer: q.answer, topic: q.topic }, answer: typed },
    });
    if (res.correct) {
      return { correct: true, explanation: res.feedback || q.explanation || 'Valid approach.' };
    }
    return {
      correct: false,
      explanation: `Expected: ${res.expected || q.answer}${res.feedback ? ` — ${res.feedback}` : ''}`,
    };
  } catch {
    const correct = normalize(typed) === normalize(q.answer);
    return {
      correct,
      explanation: correct ? q.explanation : `Expected: ${q.answer}${q.explanation ? ` — ${q.explanation}` : ''}`,
    };
  }
}

const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  high: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
};
const PRIORITY_LABEL = { critical: '🔴 Critical', high: '🟠 High', low: '🟢 Low' };

function buildDaily() {
  const now = new Date();
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

export default function InterviewDrill({ mode: modeProp }) {
  const params = useParams();
  const mode = modeProp || params.mode;
  const meta = modeMeta(mode);
  const { data, loaded, save, clear } = useInterviewProgress(mode);
  const startedAt = useRef(Date.now());

  // question list per engine
  const engine = meta.engine;

  const baseList = useMemo(() => {
    if (engine === 'command') return (DRILL_DATA[mode] || []).map((q) => ({ ...q, _type: 'command' }));
    if (engine === 'mcq') return (MCQ_DATA[mode] || []).map((q) => ({ ...q, _type: 'mcq' }));
    if (engine === 'ticket') return TICKET_DATA[mode] || [];
    if (engine === 'checklist') return CHECKLIST_DATA[mode] || [];
    if (engine === 'free') return (FREE_DATA[mode] || []).map((q) => ({ ...q, _type: 'free' }));
    if (engine === 'daily') return buildDaily();
    if (engine === 'gemini') return [];
    return [];
  }, [engine, mode]);

  const careerConfig = useMemo(() => (engine === 'career' ? CAREER_DATA[mode] : null), [engine, mode]);

  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null); // { correct, userAnswer, explanation }
  const [typed, setTyped] = useState('');
  const [freeText, setFreeText] = useState('');
  const [grading, setGrading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const [genQuestions, setGenQuestions] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [careerLevel, setCareerLevel] = useState(0);
  const [careerIdx, setCareerIdx] = useState(0);
  const [failedLevels, setFailedLevels] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(null);

  // resume
  useEffect(() => {
    if (!loaded || engine === 'career' || engine === 'gemini' || engine === 'daily') return;
    if (data && Array.isArray(data.answers) && data.answers.length > 0) {
      setAnswers(data.answers);
      setIndex(data.answers.length);
    }
  }, [loaded, engine, data]);

  useEffect(() => {
    if (!loaded || engine !== 'career' || !careerConfig) return;
    if (data && Array.isArray(data.answers) && data.answers.length > 0) {
      setAnswers(data.answers);
      let remaining = data.answers.length;
      let lvl = 0;
      while (lvl < careerConfig.levels.length && remaining >= careerConfig.levels[lvl].questions.length) {
        remaining -= careerConfig.levels[lvl].questions.length;
        lvl += 1;
      }
      setCareerLevel(Math.min(lvl, careerConfig.levels.length - 1));
      setCareerIdx(remaining);
    }
  }, [loaded, engine, careerConfig, data]);

  useEffect(() => {
    if (!loaded || engine !== 'gemini') return;
    if (data && Array.isArray(data.questions) && data.questions.length > 0) {
      setGenQuestions(data.questions.map((q) => ({ ...q, _type: 'command' })));
      setAnswers(data.answers || []);
      setIndex((data.answers || []).length);
    } else {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, engine, data]);

  const list = useMemo(() => {
    if (engine === 'gemini') return genQuestions || [];
    if (engine === 'career') {
      const lvl = careerConfig.levels[careerLevel];
      return (lvl ? lvl.questions : []).map((q) => ({ ...q, _type: 'command' }));
    }
    return baseList;
  }, [engine, baseList, genQuestions, careerConfig, careerLevel]);

  const timed = meta.timed;
  const timePer = engine === 'command-speedrun' ? 5 : engine === 'command-battle' ? 10 : 0;

  // per-question countdown
  useEffect(() => {
    if (!timed || !list.length || index >= list.length || selected || evaluating) return;
    const deadline = Date.now() + timePer * 1000;
    const iv = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(iv);
        recordAnswer(false, '(timeout)', '(out of time)');
      }
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, index, list.length, selected, evaluating]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await api('/interview/questions/generate', {
        method: 'POST',
        body: { mode: 'scenario-generator', count: 6 },
      });
      const qs = (res.questions || []).map((q) => ({ ...q, _type: 'command' }));
      if (qs.length === 0) throw new Error('empty');
      setGenQuestions(qs);
      setAnswers([]);
      setIndex(0);
      save({ questions: qs, answers: [] });
    } catch {
      setGenQuestions(SCENARIO_FALLBACK.map((q) => ({ ...q, _type: 'command' })));
      setAnswers([]);
      setIndex(0);
    } finally {
      setGenerating(false);
    }
  }

  function recordAnswer(correct, userAnswer, explanation) {
    const q = engine === 'career' ? list[careerIdx] : list[index];
    const expected = q.answer || (Array.isArray(q.options) ? q.options[q.correctIndex] : '') || q.model || '';
    const a = {
      prompt: q.prompt,
      answer: expected,
      userAnswer,
      correct,
      topic: q.topic || 'Linux',
      explanation: explanation || q.explanation || '',
    };
    const next = [...answers, a];
    setAnswers(next);
    if (engine === 'career') {
      save({ answers: next, careerLevel });
    } else {
      save({ answers: next, index: next.length });
    }
    setTimeout(() => {
      setSelected(null);
      setTyped('');
      setFreeText('');
      setSecondsLeft(null);
      if (engine === 'career') {
        const lvl = careerConfig.levels[careerLevel];
        const doneInLevel = careerIdx + 1;
        if (doneInLevel >= lvl.questions.length) {
          const correctInLevel = next.slice(-lvl.questions.length).filter((x) => x.correct).length;
          if (correctInLevel / lvl.questions.length >= 0.7) {
            if (careerLevel >= careerConfig.levels.length - 1) {
              finishSession(next);
              return;
            }
            setCareerLevel((l) => l + 1);
            setCareerIdx(0);
          } else {
            setFailedLevels((f) => (f.includes(careerLevel) ? f : [...f, careerLevel]));
            const trimmed = next.slice(0, next.length - lvl.questions.length);
            setAnswers(trimmed);
            setCareerIdx(0);
            save({ answers: trimmed, careerLevel });
          }
        } else {
          setCareerIdx((i) => i + 1);
        }
      } else if (index + 1 >= list.length) {
        finishSession(next);
      } else {
        setIndex((i) => i + 1);
      }
    }, 250);
  }

  async function finishSession(next) {
    setSaving(true);
    const correct = next.filter((a) => a.correct).length;
    const body = {
      mode,
      answers: next,
      score: correct,
      maxScore: next.length,
      timeTakenSeconds: Math.max(1, Math.floor((Date.now() - startedAt.current) / 1000)),
    };
    try {
      const session = await api('/interview/sessions', { method: 'POST', body });
      clear();
      setReport(session);
    } catch {
      clear();
      setReport({
        id: 'local',
        mode,
        answers: next,
        score: correct,
        maxScore: next.length,
        accuracy: next.length ? Math.round((correct / next.length) * 100) : 0,
        timeTakenSeconds: body.timeTakenSeconds,
        wpm: 0,
        weakTopics: [],
        aiReport: 'Could not save this session right now. Please try again.',
        finished: true,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }

  async function submitFree() {
    const q = list[index];
    if (!freeText.trim()) return;
    setGrading(true);
    try {
      const grade = await api('/interview/grade', {
        method: 'POST',
        body: { question: { prompt: q.prompt, topic: q.topic, model: q.model }, answer: freeText },
      });
      const correct = grade.score >= 3;
      const explanation = `${grade.score}/5 — ${grade.feedback}${grade.missing ? `\nMissing: ${grade.missing}` : ''}`;
      setSelected({ correct, userAnswer: freeText, explanation });
      setFreeText(freeText);
    } catch {
      setSelected({ correct: true, userAnswer: freeText, explanation: 'AI grader unavailable — answer recorded.' });
    } finally {
      setGrading(false);
    }
  }

  // Gemini judges the typed command, accepting any valid approach. If the AI
  // is unavailable we fall back to an exact-match comparison so drills always
  // work. Timed modes (speedrun/battle) stay on exact-match for pacing.
  async function submitCommand(q, typed) {
    if (!typed.trim() || evaluating) return;
    setEvaluating(true);
    try {
      const result = await aiCheck(q, typed, timed);
      setSelected({ correct: result.correct, userAnswer: typed, explanation: result.explanation });
      recordAnswer(result.correct, result.userAnswer, result.explanation);
    } finally {
      setEvaluating(false);
    }
  }

  if (report) {
    return (
      <InterviewReport
        session={report}
        onRetry={() => {
          setReport(null);
          setAnswers([]);
          setIndex(0);
          setCareerLevel(0);
          setCareerIdx(0);
          setFailedLevels([]);
        }}
      />
    );
  }

  if (saving) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <Spinner size={30} className="text-brand-500" />
        <h2 className="mt-5 text-xl font-extrabold">Finishing your {meta.title}…</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Saving your session and asking the AI coach to analyze your answers. This takes a few seconds.
        </p>
      </div>
    );
  }

  if (engine === 'virtual') {
    return (
      <VirtualLab
        config={{ ...VIRTUAL_LABS[mode], title: meta.title }}
        onFinish={async (ans) => {
          await finishSession(ans);
        }}
      />
    );
  }

  if (!loaded || (engine === 'gemini' && !genQuestions) || generating) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={24} className="text-brand-500" />
      </div>
    );
  }

  if (engine === 'career' && careerConfig) {
    const lvl = careerConfig.levels[careerLevel];
    const totalLevels = careerConfig.levels.length;
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Header meta={meta} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {careerConfig.levels.map((l, i) => (
            <span
              key={l.rank}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-bold',
                i < careerLevel ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                : i === careerLevel ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 ring-2 ring-brand-400'
                : 'bg-slate-100 text-slate-400 dark:bg-white/5'
              )}
            >
              {i < careerLevel ? '✅' : i === careerLevel ? '▶' : ''} {l.rank}
            </span>
          ))}
        </div>
        <div className="card mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Level {careerLevel + 1} of {totalLevels} · {lvl.salary}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold">{lvl.rank}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lvl.story}</p>
          {failedLevels.includes(careerLevel) && (
            <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              You need ≥70% to earn this promotion — try again!
            </p>
          )}
        </div>
        <Progress index={careerIdx} total={lvl.questions.length} />
        <QuestionCard
          q={list[careerIdx]}
          selected={selected}
          typed={typed}
          setTyped={setTyped}
          freeText={freeText}
          setFreeText={setFreeText}
          grading={grading}
          evaluating={evaluating}
          submitFree={submitFree}
          submitCommand={submitCommand}
          recordAnswer={recordAnswer}
          timed={timed}
          secondsLeft={secondsLeft}
          engine="command"
        />
      </div>
    );
  }

  if (engine === 'ticket') {
    return (
      <TicketView
        meta={meta}
        tickets={baseList}
        answers={answers}
        save={save}
        onFinish={finishSession}
      />
    );
  }

  if (engine === 'checklist') {
    return (
      <ChecklistView meta={meta} steps={baseList} answers={answers} save={save} onFinish={finishSession} />
    );
  }

  const q = list[index];
  if (!q) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-slate-500">Getting this drill ready…</p>
        <Link to="/interview" className="btn-ghost mt-4"><ArrowLeft size={16} /> Back to hub</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Header meta={meta} />
      {engine === 'gemini' && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <Sparkles size={13} className="mr-1 inline text-brand-500" />
            Scenarios generated fresh for you by Gemini.
          </p>
          <button onClick={generate} className="btn-ghost !px-2 text-xs" disabled={generating}>
            <RefreshCw size={13} /> New scenarios
          </button>
        </div>
      )}
      {timed && <TimedBar secondsLeft={secondsLeft} total={timePer} />}
      <Progress index={index} total={list.length} />
      <QuestionCard
        q={q}
        selected={selected}
        typed={typed}
        setTyped={setTyped}
        freeText={freeText}
        setFreeText={setFreeText}
        grading={grading}
        evaluating={evaluating}
        submitFree={submitFree}
        submitCommand={submitCommand}
        recordAnswer={recordAnswer}
        timed={timed}
        secondsLeft={secondsLeft}
        engine={engine}
      />
      {saving && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Spinner size={16} className="text-brand-500" /> Saving session + AI analysis…
        </div>
      )}
    </div>
  );
}

function Header({ meta }) {
  return (
    <div className="flex items-center gap-3">
      <Link to="/interview" className="btn-ghost !px-2" aria-label="Back">
        <ArrowLeft size={18} />
      </Link>
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-xl text-white shadow', meta.gradient)}>
        {meta.icon}
      </div>
      <div>
        <h1 className="text-xl font-extrabold">{meta.title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{meta.tagline}</p>
      </div>
    </div>
  );
}

function Progress({ index, total }) {
  const pct = total ? Math.round((index / total) * 100) : 0;
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>{Math.min(index, total)} / {total} answered</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TimedBar({ secondsLeft, total }) {
  const pct = total ? Math.max(0, Math.round(((secondsLeft ?? total) / total) * 100)) : 100;
  const danger = secondsLeft !== null && secondsLeft <= 2;
  return (
    <div className="mt-4 flex items-center gap-2">
      <Zap size={15} className={danger ? 'text-red-500' : 'text-amber-500'} />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all duration-200', danger ? 'bg-red-500' : 'bg-amber-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('font-mono text-sm font-bold', danger ? 'text-red-500' : 'text-amber-500')}>{secondsLeft ?? total}s</span>
    </div>
  );
}

function QuestionCard({ q, selected, typed, setTyped, freeText, setFreeText, grading, evaluating, submitFree, submitCommand, recordAnswer, timed, secondsLeft, engine }) {
  if (!q) return null;
  const isCommand = q._type === 'command';
  const isMcq = q._type === 'mcq';
  const isFree = q._type === 'free';

  const submitCmd = (e) => {
    e.preventDefault();
    submitCommand(q, typed);
  };

  return (
    <div className="card mt-5">
      {q.story && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <span className="mr-1">🚨</span>{q.story}
        </div>
      )}
      {q.level && (
        <span className={cn('badge mb-3', q.level === 'Emergency' ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' : q.level === 'Production' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400')}>
          {q.level}
        </span>
      )}
      {q.title && <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{q.title}</p>}
      <h2 className="text-lg font-extrabold leading-snug">{q.prompt}</h2>

      {isCommand && !selected && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-lg dark:border-white/10">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-slate-900 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-slate-400">{q.topic || 'admin'}-lab · bash</span>
          </div>
          <form onSubmit={submitCmd} className="flex items-center gap-2 p-4">
            <span className="shrink-0 font-mono text-sm font-bold text-emerald-400">student@lab:~$</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoFocus
              disabled={evaluating}
              className="flex-1 bg-transparent font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="type the command…"
            />
            <button type="submit" disabled={!typed.trim() || evaluating} className="btn-primary !px-3 !py-1.5 text-sm">
              {evaluating ? <Spinner size={14} className="mr-1 text-white" /> : null}
              {evaluating ? 'Checking…' : 'Run'}
            </button>
          </form>
          {evaluating && (
            <div className="border-t border-white/10 bg-slate-900/60 px-4 py-2.5 font-mono text-xs text-brand-300">
              <Sparkles size={12} className="mr-1.5 inline" />
              AI is verifying your approach (multiple correct answers accepted)…
            </div>
          )}
        </div>
      )}

      {isMcq && !selected && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(q.options || []).map((opt, i) => (
            <button
              key={i}
              onClick={() => recordAnswer(i === q.correctIndex, opt, i === q.correctIndex ? q.explanation : `Expected: ${q.options[q.correctIndex]} — ${q.explanation || ''}`)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm font-medium transition hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-brand-500/10"
            >
              <span className="mr-2 font-mono text-xs text-slate-400">{String.fromCharCode(97 + i)})</span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {isFree && !selected && (
        <div className="mt-4">
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:border-white/10 dark:bg-white/5"
            placeholder="Answer the interviewer in your own words…"
          />
          <div className="mt-2 flex justify-end">
            <button onClick={submitFree} disabled={!freeText.trim() || grading} className="btn-primary">
              {grading ? <Spinner size={15} className="mr-1 text-white" /> : <Sparkles size={15} className="mr-1" />} Submit for AI grade
            </button>
          </div>
        </div>
      )}

      {selected && (
        <div className={cn('mt-4 rounded-xl border p-4', selected.correct ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5' : 'border-red-200 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/5')}>
          <div className="flex items-center gap-2 text-sm font-bold">
            {selected.correct ? <CheckCircle2 size={17} className="text-emerald-500" /> : <XCircle size={17} className="text-red-500" />}
            {selected.correct ? (isCommand ? 'Correct — valid approach!' : 'Correct!') : 'Not quite.'}
          </div>
          {!selected.correct && selected.userAnswer && (
            <p className="mt-1.5 font-mono text-sm text-slate-600 dark:text-slate-300">
              You typed: <span className="text-red-500">{selected.userAnswer}</span>
            </p>
          )}
          {selected.explanation && (
            <p className={cn('whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300', !selected.correct && 'mt-1.5')}>
              {selected.explanation}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <span className="text-xs font-semibold text-slate-400">Moving on…</span>
          </div>
        </div>
      )}

      {timed && !selected && secondsLeft === 0 && <p className="mt-3 text-sm font-bold text-red-500">⏰ Time's up!</p>}
    </div>
  );
}

function TicketView({ meta, tickets, answers, save, onFinish }) {
  const idx = answers.length;
  const done = tickets.filter((_, i) => i < idx);
  const current = tickets[idx];
  const [typed, setTyped] = useState('');
  const [flash, setFlash] = useState(null);

  const finish = (ans) => {
    const correct = ans.filter((a) => a.correct).length;
    onFinish(ans);
  };

  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!typed.trim() || !current || checking) return;
    setChecking(true);
    try {
      const check = await aiCheck(current, typed, false);
      const a = {
        prompt: `${PRIORITY_LABEL[current.priority] || ''} ${current.title}: ${current.prompt}`,
        answer: current.answer,
        userAnswer: typed,
        correct: check.correct,
        topic: current.topic || 'Linux',
        explanation: check.explanation,
      };
      const next = [...answers, a];
      save({ answers: next });
      setFlash({ correct: check.correct, text: check.correct ? `+XP — Ticket closed (valid approach!)` : `Ticket still open — ${check.explanation}` });
      setTimeout(() => {
        setFlash(null);
        setTyped('');
        if (next.length >= tickets.length) finish(next);
      }, check.correct ? 500 : 2600);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Header meta={meta} />
      <div className="mt-5 flex items-center gap-3">
        <span className="badge bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">Tickets closed {done.length}/{tickets.length}</span>
        <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{done.filter((_, i) => tickets[i]?.priority === 'critical').length} critical done</span>
        <span className="ml-auto text-xs font-semibold text-slate-400">Complete the queue before your shift ends</span>
      </div>

      <div className="mt-4 space-y-2">
        {tickets.map((t, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 text-sm transition',
              i < idx ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
              : i === idx ? 'border-brand-300 bg-white shadow-sm dark:border-brand-500/40 dark:bg-white/5'
              : 'border-slate-200 opacity-50 dark:border-white/10'
            )}
          >
            <span className="shrink-0 text-base">{i < idx ? '✅' : i === idx ? '▶' : '⏳'}</span>
            <span className={cn('badge shrink-0', PRIORITY_STYLES[t.priority])}>{PRIORITY_LABEL[t.priority]}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.title}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.prompt}</p>
            </div>
            {i < idx && <span className="font-mono text-xs text-slate-400">{t.answer}</span>}
          </div>
        ))}
      </div>

      {current && (
        <div className="card mt-4">
          <p className="text-sm font-bold">{current.prompt}</p>
          <form onSubmit={submit} className="mt-3 flex items-center gap-2">
            <span className="font-mono text-sm text-emerald-500">$</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:border-white/10 dark:bg-white/5"
              placeholder="resolve the ticket…"
            />
            <button type="submit" disabled={checking} className="btn-primary">
              {checking ? <Spinner size={14} className="mr-1 text-white" /> : null}
              {checking ? 'Checking…' : 'Resolve'}
            </button>
          </form>
          {checking && (
            <p className="mt-2 text-xs font-semibold text-brand-500">
              <Sparkles size={12} className="mr-1 inline" /> AI verifying your fix (any valid approach accepted)…
            </p>
          )}
          {flash && (
            <p className={cn('mt-3 whitespace-pre-wrap text-sm font-semibold', flash.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
              {flash.text}
            </p>
          )}
        </div>
      )}

      {!current && (
        <div className="card mt-4 text-center">
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">🎉 Shift complete — queue cleared!</p>
          <p className="mt-1 text-sm text-slate-500">Saving your session + AI analysis…</p>
        </div>
      )}
    </div>
  );
}

function ChecklistView({ meta, steps, answers, save, onFinish }) {
  const idx = answers.length;
  const current = steps[idx];
  const [typed, setTyped] = useState('');
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!typed.trim() || !current || checking) return;
    setChecking(true);
    try {
      const check = await aiCheck(current, typed, false);
      const a = {
        prompt: `Step ${idx + 1}: ${current.title} — ${current.prompt}`,
        answer: current.answer,
        userAnswer: typed,
        correct: check.correct,
        topic: current.topic || 'Linux',
        explanation: check.explanation,
      };
      const next = [...answers, a];
      save({ answers: next });
      setTyped('');
      if (next.length >= steps.length) onFinish(next);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Header meta={meta} />
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Complete each step in order. Every step is verified against the expected command.
      </p>
      <div className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 text-sm',
              i < idx ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
              : i === idx ? 'border-brand-300 bg-white dark:border-brand-500/40 dark:bg-white/5'
              : 'border-slate-200 opacity-50 dark:border-white/10'
            )}
          >
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', i < idx ? 'bg-emerald-500 text-white' : i === idx ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-white/10')}>
              {i < idx ? '✓' : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{s.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.prompt}</p>
            </div>
            {i < idx && <span className="font-mono text-xs text-emerald-500">{s.answer}</span>}
          </div>
        ))}
      </div>

      {current && (
        <div className="card mt-4">
          <p className="text-sm font-bold">{current.prompt}</p>
          <form onSubmit={submit} className="mt-3 flex items-center gap-2">
            <span className="font-mono text-sm text-emerald-500">$</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:border-white/10 dark:bg-white/5"
              placeholder={`step ${idx + 1} command…`}
            />
            <button type="submit" disabled={checking} className="btn-primary">
              {checking ? <Spinner size={14} className="mr-1 text-white" /> : null}
              {checking ? 'Checking…' : 'Run step'}
            </button>
          </form>
          {checking && (
            <p className="mt-2 text-xs font-semibold text-brand-500">
              <Sparkles size={12} className="mr-1 inline" /> AI verifying this step…
            </p>
          )}
        </div>
      )}

      {!current && (
        <div className="card mt-4 text-center">
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">✅ Checklist complete — deployment done!</p>
          <p className="mt-1 text-sm text-slate-500">Saving your session + AI analysis…</p>
        </div>
      )}
    </div>
  );
}
