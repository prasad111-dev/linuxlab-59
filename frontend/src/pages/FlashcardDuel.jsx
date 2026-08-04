import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, XCircle, Sparkles, Layers } from 'lucide-react';
import { api } from '../lib/api';
import { Spinner } from '../components/Spinner';
import InterviewReport from '../components/InterviewReport';
import { FLASHCARDS, FLASHCARD_TIERS } from '../data/interviewData';
import { cn, formatDuration } from '../lib/format';

export default function FlashcardDuel() {
  const cards = useMemo(() => FLASHCARDS, []);
  const [answers, setAnswers] = useState([]);
  const [tierIndex, setTierIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(Date.now());

  const current = cards[tierIndex * 5 + cardIndex];
  const correctSoFar = answers.filter((a) => a.correct).length;

  const pick = (opt) => {
    if (picked !== null) return;
    setPicked(opt);
    const isCorrect = opt === current.answer;
    setAnswers((prev) => [
      ...prev,
      { prompt: current.question, answer: current.answer, userAnswer: opt, correct: isCorrect, topic: current.tier },
    ]);
  };

  const next = () => {
    setPicked(null);
    if (cardIndex < 4) {
      setCardIndex(cardIndex + 1);
    } else if (tierIndex < FLASHCARD_TIERS.length - 1) {
      setTierIndex(tierIndex + 1);
      setCardIndex(0);
    } else {
      finish();
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
      setReport(session);
    } finally {
      setSaving(false);
    }
  };

  if (report) return <InterviewReport session={report} onRetry={() => window.location.reload()} />;

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
        {FLASHCARD_TIERS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => i < tierIndex && (setTierIndex(i), setCardIndex(0), setPicked(null))}
            disabled={i > tierIndex}
            title={t.name}
            className={cn(
              'flex h-9 items-center justify-center rounded-lg text-[11px] font-bold transition',
              i < tierIndex
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : i === tierIndex
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600'
            )}
          >
            {i < tierIndex ? <CheckCircle2 size={13} /> : i > tierIndex ? <Lock size={12} /> : i + 1}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-400">
        {FLASHCARD_TIERS[tierIndex].name} · {correctSoFar}/{answers.length} correct so far
      </p>

      <div className="card mt-6 animate-fade-up !p-7" key={`${tierIndex}-${cardIndex}`}>
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">{current.tier}</span>
          <span className="badge bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">Q{current.id}/125</span>
        </div>
        <h2 className="mt-4 font-mono text-2xl font-bold tracking-tight">{current.cmd}</h2>
        <p className="mt-1 text-lg font-semibold text-slate-700 dark:text-slate-200">{current.question}</p>

        <div className="mt-6 space-y-2.5">
          {current.options.map((opt) => {
            const isAnswer = opt === current.answer;
            const isPicked = opt === picked;
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={picked !== null}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition',
                  picked === null && 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-white/10 dark:hover:bg-white/5',
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
              picked === current.answer
                ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                : 'border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/5'
            )}
          >
            <p className="font-bold">{picked === current.answer ? 'Correct!' : 'Not quite.'}</p>
            <p className="mt-1 font-mono text-slate-600 dark:text-slate-300">{current.explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        {picked !== null ? (
          <button onClick={next} className="btn-primary">
            {cardIndex === 4 && tierIndex === FLASHCARD_TIERS.length - 1 ? 'Finish duel' : 'Next card'} <ArrowRight size={16} />
          </button>
        ) : (
          <span />
        )}
        <button onClick={finish} disabled={saving || answers.length === 0} className="btn-ghost">
          {saving ? <Spinner size={16} /> : <Sparkles size={16} />} Finish & get AI analysis
        </button>
      </div>
      <p className="mt-2 text-right text-xs text-slate-400">
        Time elapsed: {formatDuration(Math.floor((Date.now() - startedAt.current) / 1000))}
      </p>
    </div>
  );
}
