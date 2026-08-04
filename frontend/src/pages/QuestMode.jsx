import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Sparkles, Compass } from 'lucide-react';
import { api } from '../lib/api';
import { Spinner } from '../components/Spinner';
import InterviewReport from '../components/InterviewReport';
import { useInterviewProgress } from '../lib/useInterviewProgress';
import { QUESTS } from '../data/interviewData';
import { cn, formatDuration } from '../lib/format';

function normalize(s) {
  return String(s || '').trim().replace(/\s+/g, ' ');
}

export default function QuestMode() {
  const quests = useMemo(() => QUESTS, []);
  const { data: saved, loaded, save, clear } = useInterviewProgress('quest');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(Date.now());
  const didInit = useRef(false);
  const saveTimer = useRef(null);

  const index = Math.min(answers.length, quests.length - 1);
  const finishedAll = answers.length >= quests.length;

  // Resume from saved progress after login
  useEffect(() => {
    if (!loaded || didInit.current) return;
    didInit.current = true;
    if (saved?.answers?.length) {
      setAnswers(saved.answers);
      startedAt.current = Date.now() - (saved.elapsedMs || 0);
    }
  }, [loaded, saved]);

  // Debounced save of progress whenever answers change
  useEffect(() => {
    if (!didInit.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save({ answers, elapsedMs: Date.now() - startedAt.current });
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, save]);

  const q = quests[index];
  const correctSoFar = answers.filter((a) => a.correct).length;

  const check = (e) => {
    e.preventDefault();
    if (result) return;
    const given = normalize(value);
    const isCorrect = given === normalize(q.answer);
    setResult({ correct: isCorrect, given });
    setAnswers((prev) => [
      ...prev,
      { prompt: q.prompt, answer: q.answer, userAnswer: given, correct: isCorrect, topic: 'Quest' },
    ]);
  };

  const next = () => {
    setValue('');
    setResult(null);
  };

  const finish = async () => {
    setSaving(true);
    try {
      const session = await api('/interview/sessions', {
        method: 'POST',
        body: {
          mode: 'quest',
          answers,
          score: correctSoFar,
          maxScore: answers.length,
          timeTakenSeconds: Math.floor((Date.now() - startedAt.current) / 1000),
        },
      });
      clear();
      setReport(session);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size={26} className="text-brand-500" /></div>;
  if (report) return <InterviewReport session={report} onRetry={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link to="/interview" className="btn-ghost !px-3 !py-2">
          <ArrowLeft size={16} /> Hub
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Compass size={15} /> Quest {index + 1}/30 · {correctSoFar} solved
        </div>
      </div>

      <div className="mt-5 flex gap-1.5">
        {quests.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition',
              i < answers.length ? 'bg-emerald-400' : i === answers.length ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'
            )}
          />
        ))}
      </div>

      {finishedAll ? (
        <div className="card mt-6 text-center !p-10">
          <div className="text-5xl">🏁</div>
          <h2 className="mt-4 text-2xl font-extrabold">All 30 quests solved!</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            You solved {correctSoFar}/30. Get your AI analysis now.
          </p>
          <button onClick={finish} disabled={saving} className="btn-primary mt-6">
            {saving ? <Spinner size={16} /> : <Sparkles size={16} />} Finish & get AI analysis
          </button>
        </div>
      ) : (
        <>
          <div className="card mt-6 animate-fade-up !p-7" key={index}>
            <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">Scenario {q.id}</span>
            <h2 className="mt-4 text-xl font-bold">{q.prompt}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Type the exact command that solves it.</p>

            <form onSubmit={check} className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 font-mono text-sm text-emerald-500">$</span>
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="your command…"
                  spellCheck={false}
                  autoComplete="off"
                  disabled={result !== null}
                  className="input !font-mono !pl-9 disabled:opacity-70"
                />
              </div>
              <button type="submit" disabled={!value.trim() || result !== null} className="btn-primary">
                <Check size={16} /> Check
              </button>
            </form>

            {result && (
              <div
                className={cn(
                  'mt-5 rounded-xl border p-4 text-sm',
                  result.correct
                    ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : 'border-red-200 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/5'
                )}
              >
                <p className="font-bold">{result.correct ? 'Correct! Well done.' : 'Not quite.'}</p>
                <p className="mt-1 font-mono text-slate-600 dark:text-slate-300">
                  <span className="text-emerald-600 dark:text-emerald-400">Answer:</span> {q.answer}
                </p>
                {!result.correct && result.given && (
                  <p className="mt-0.5 font-mono text-red-500">Yours: {result.given}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            {result ? (
              <button onClick={next} className="btn-primary">
                Next quest <ArrowRight size={16} />
              </button>
            ) : (
              <span />
            )}
            <button onClick={finish} disabled={saving || answers.length === 0} className="btn-ghost">
              {saving ? <Spinner size={16} /> : <Sparkles size={16} />} Finish & get AI analysis
            </button>
          </div>
        </>
      )}
      <p className="mt-2 text-right text-xs text-slate-400">
        Time elapsed: {formatDuration(Math.floor((Date.now() - startedAt.current) / 1000))}
      </p>
    </div>
  );
}
