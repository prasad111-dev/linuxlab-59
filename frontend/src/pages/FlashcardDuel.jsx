import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, XCircle, Sparkles, Layers } from 'lucide-react';
import { api } from '../lib/api';
import { Spinner, FullPageSpinner } from '../components/Spinner';
import InterviewReport from '../components/InterviewReport';
import { useInterviewProgress } from '../lib/useInterviewProgress';
import { FLASHCARDS, FLASHCARD_TIERS } from '../data/interviewData';
import { cn, formatDuration } from '../lib/format';

export default function FlashcardDuel() {
  const cards = useMemo(() => FLASHCARDS, []);
  const { data: saved, loaded, save, clear } = useInterviewProgress('flashcard');
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null); // { card, option, correct } snapshot of the card being answered
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(Date.now());
  const didInit = useRef(false);
  const saveTimer = useRef(null);

  // The card on screen is locked by `idx` until the user presses "Next card".
  // `answers.length` only tracks how many have been answered, so answering a
  // card must NOT advance the visible card (which previously made the feedback
  // panel read the next card's answer/explanation).
  const tierIndex = Math.min(FLASHCARD_TIERS.length - 1, Math.floor(idx / 5));
  const cardIndex = idx % 5;
  const current = cards[idx];
  const correctSoFar = answers.filter((a) => a.correct).length;

  // Resume from saved progress after login
  useEffect(() => {
    if (!loaded || didInit.current) return;
    didInit.current = true;
    if (saved?.answers?.length) {
      setAnswers(saved.answers);
      setIdx(saved.answers.length);
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

  const pick = (opt) => {
    if (picked !== null) return;
    const card = current;
    const isCorrect = opt === card.answer;
    setPicked({ card, option: opt, correct: isCorrect });
    setAnswers((prev) => [
      ...prev,
      { prompt: card.question, answer: card.answer, userAnswer: opt, correct: isCorrect, topic: card.tier },
    ]);
  };

  const next = () => {
    setPicked(null);
    if (idx + 1 >= cards.length) {
      finish();
    } else {
      setIdx(idx + 1);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      const session = await api('/interview/sessions', {
        method: 'POST',
        body: {
          mode: 'flashcard',
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

  if (!loaded) return <FullPageSpinner label="Loading your progress…" />;
  if (report) return <InterviewReport session={report} onRetry={() => window.location.reload()} />;

  const finishedAll = answers.length >= cards.length && picked === null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link to="/interview" className="btn-ghost !px-3 !py-2">
          <ArrowLeft size={16} /> Hub
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Layers size={15} /> Tier {tierIndex + 1}/25 · Card {cardIndex + 1}/5
        </div>
      </div>

      {/* Tier progress */}
      <div className="mt-5 grid grid-cols-10 gap-1.5">
        {FLASHCARD_TIERS.map((t, i) => {
          const tierAnswered = Math.max(0, Math.min(5, answers.length - i * 5));
          const completed = tierAnswered === 5;
          return (
            <div
              key={t.id}
              title={t.name}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg text-[11px] font-bold transition',
                completed
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : i === tierIndex
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600'
              )}
            >
              {completed ? <CheckCircle2 size={13} /> : i > tierIndex ? <Lock size={12} /> : i + 1}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-400">
        {FLASHCARD_TIERS[tierIndex].name} · {correctSoFar}/{answers.length} correct so far
      </p>

      {finishedAll ? (
        <div className="card mt-6 text-center !p-10">
          <div className="text-5xl">🏁</div>
          <h2 className="mt-4 text-2xl font-extrabold">All 125 cards answered!</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            You got {correctSoFar}/{answers.length} correct. Get your AI analysis now.
          </p>
          <button onClick={finish} disabled={saving} className="btn-primary mt-6">
            {saving ? <Spinner size={16} /> : <Sparkles size={16} />} Finish & get AI analysis
          </button>
        </div>
      ) : (
        <>
          <div className="card mt-6 animate-fade-up !p-7" key={idx}>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">{current.tier}</span>
              <span className="badge bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">Q{current.id}/125</span>
            </div>
            <h2 className="mt-4 font-mono text-2xl font-bold tracking-tight">{current.cmd}</h2>
            <p className="mt-1 text-lg font-semibold text-slate-700 dark:text-slate-200">{current.question}</p>

            <div className="mt-6 space-y-2.5">
              {current.options.map((opt) => {
                const isAnswer = picked !== null && opt === picked.card.answer;
                const isPicked = opt === picked?.option;
                return (
                  <button
                    key={opt}
                    onClick={() => pick(opt)}
                    disabled={picked !== null}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition',
                      picked === null && 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 dark:border-white/10 dark:hover:bg-white/5',
                      picked !== null && isAnswer && 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
                      picked !== null && isPicked && !isAnswer && 'border-red-400 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
                      picked !== null && !isPicked && !isAnswer && 'opacity-50'
                    )}
                  >
                    {picked !== null && isAnswer ? (
                      <CheckCircle2 size={17} className="shrink-0 text-emerald-500" />
                    ) : picked !== null && isPicked ? (
                      <XCircle size={17} className="shrink-0 text-red-500" />
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div
                className={cn(
                  'mt-5 rounded-xl border p-4 text-sm',
                  picked.correct
                    ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : 'border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/5'
                )}
              >
                <p className="font-bold">{picked.correct ? 'Correct!' : 'Not quite.'}</p>
                <p className="mt-1 font-mono text-slate-600 dark:text-slate-300">{picked.card.explanation}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            {picked !== null ? (
              <button onClick={next} className="btn-primary">
                Next card <ArrowRight size={16} />
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
