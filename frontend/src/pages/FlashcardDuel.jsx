import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, Check, Sparkles, Layers } from 'lucide-react';
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
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(Date.now());
  const didInit = useRef(false);
  const finishedRef = useRef(false);
  const saveTimer = useRef(null);
  const answersRef = useRef([]);
  const idxRef = useRef(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  const tierIndex = Math.min(FLASHCARD_TIERS.length - 1, Math.floor(idx / 5));
  const cardIndex = idx % 5;
  const current = cards[idx];
  const currentAnswer = answers[idx];
  const correctSoFar = answers.filter((a) => a.correct).length;

  // Resume from saved progress after login
  useEffect(() => {
    if (!loaded || didInit.current) return;
    didInit.current = true;
    if (saved?.answers?.length) {
      setAnswers(saved.answers);
      setIdx(
        Math.min(saved.idx ?? saved.answers.length, saved.answers.length, Math.max(0, cards.length - 1))
      );
      startedAt.current = Date.now() - (saved.elapsedMs || 0);
    }
  }, [loaded, saved, cards.length]);

  // Debounced save of progress whenever answers/position change
  useEffect(() => {
    if (!didInit.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save({ answers, idx, elapsedMs: Date.now() - startedAt.current });
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, idx, save]);

  // Flush any pending save on unmount so leaving mid-quiz never restarts at card 1
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (didInit.current && !finishedRef.current) {
        save({ answers: answersRef.current, idx: idxRef.current, elapsedMs: Date.now() - startedAt.current });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (opt) => {
    const card = current;
    const isCorrect = opt === card.answer;
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = { prompt: card.question, answer: card.answer, userAnswer: opt, correct: isCorrect, topic: card.tier };
      return next;
    });
  };

  const prev = () => {
    if (idx > 0) setIdx(idx - 1);
  };

  const next = () => {
    if (!currentAnswer) return;
    if (idx + 1 >= cards.length) {
      finish();
    } else {
      setIdx(idx + 1);
    }
  };

  const finish = async () => {
    if (saving) return;
    finishedRef.current = true;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
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

  const finishedAll = answers.length >= cards.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link to="/interview" className="btn-ghost !px-3 !py-2">
          <ArrowLeft size={16} /> Hub
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Layers size={15} /> Tier {tierIndex + 1}/{FLASHCARD_TIERS.length} · Card {cardIndex + 1}/5
        </div>
      </div>

      {/* Tier progress — unlocked tiers are clickable to jump straight back to
          an earlier quiz; locked tiers stay locked until the previous one is done */}
      <div className="mt-5 grid grid-cols-10 gap-1.5">
        {FLASHCARD_TIERS.map((t, i) => {
          const tierAnswered = Math.max(0, Math.min(5, answers.length - i * 5));
          const completed = tierAnswered === 5;
          const unlocked = i <= tierIndex;
          const box = (
            <>
              {completed ? <CheckCircle2 size={13} /> : !unlocked ? <Lock size={12} /> : i + 1}
            </>
          );
          return unlocked ? (
            <button
              key={t.id}
              type="button"
              title={`Go to tier ${i + 1}: ${t.name}`}
              aria-label={`Go to tier ${i + 1}: ${t.name}`}
              onClick={() => setIdx(i * 5)}
              className={cn(
                'flex h-9 items-center justify-center rounded-lg text-[11px] font-bold transition',
                completed
                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
                  : i === tierIndex
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-600 dark:hover:bg-white/10'
              )}
            >
              {box}
            </button>
          ) : (
            <div
              key={t.id}
              title={t.name}
              className="flex h-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600"
            >
              {box}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-400">
        {FLASHCARD_TIERS[tierIndex].name} · {answers.length} of {cards.length} cards answered
      </p>

      {finishedAll ? (
        <div className="card mt-6 text-center !p-10">
          <div className="text-5xl">🏁</div>
          <h2 className="mt-4 text-2xl font-extrabold">All {cards.length} cards answered!</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Get your AI analysis — every answer is reviewed on the evaluation page.
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
              <span className="badge bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">Q{current.id}/{cards.length}</span>
              {currentAnswer && (
                <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">Answered</span>
              )}
            </div>
            <h2 className="mt-4 font-mono text-2xl font-bold tracking-tight">{current.cmd}</h2>
            <p className="mt-1 text-lg font-semibold text-slate-700 dark:text-slate-200">{current.question}</p>

            <div className="mt-6 space-y-2.5">
              {current.options.map((opt) => {
                const selected = currentAnswer?.userAnswer === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => pick(opt)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition',
                      selected
                        ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 dark:border-white/10 dark:hover:bg-white/5'
                    )}
                  >
                    {selected ? (
                      <Check size={17} className="shrink-0 text-brand-500" />
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                    )}
                    {opt}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              Correct answers are revealed only on the evaluation page after you finish.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button onClick={prev} disabled={idx === 0} className="btn-ghost !px-3 !py-2">
                <ArrowLeft size={16} /> Previous
              </button>
              <button onClick={next} disabled={!currentAnswer} className="btn-primary">
                {idx + 1 >= cards.length ? 'Finish' : 'Next card'} <ArrowRight size={16} />
              </button>
            </div>
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
