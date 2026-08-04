import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronRight, History } from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';
import { MODES } from '../data/interviewData';
import { timeAgo, cn } from '../lib/format';

export default function InterviewPrep() {
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    api('/interview/sessions')
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Interview <span className="gradient-text">Preparation</span>
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Sharpen your Linux command skills with three AI-powered drills. Each session ends with a
            personalized analysis from the AI coach.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Sparkles size={14} className="text-indigo-500" /> AI analysis saved to your history
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {MODES.map((m) => (
          <Link
            key={m.mode}
            to={m.route}
            className="card group relative flex flex-col !p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:hover:border-indigo-500/40"
          >
            <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl text-white shadow-lg', m.gradient)}>
              {m.icon}
            </div>
            <h2 className="mt-4 text-lg font-extrabold">{m.title}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">{m.tagline}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Start practice <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <History size={18} className="text-slate-400" />
          <h2 className="text-lg font-extrabold">Your interview history</h2>
        </div>

        {!sessions ? (
          <FullPageSpinner label="Loading your sessions…" />
        ) : sessions.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="text-5xl">📝</div>
            <p className="mt-4 font-semibold text-slate-500 dark:text-slate-400">
              No interview drills yet. Pick a mode above to get your first AI analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="card flex items-center gap-4 !p-4">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl',
                    s.mode === 'flashcard'
                      ? 'bg-indigo-100 dark:bg-indigo-500/15'
                      : s.mode === 'quest'
                        ? 'bg-emerald-100 dark:bg-emerald-500/15'
                        : 'bg-rose-100 dark:bg-rose-500/15'
                  )}
                >
                  {s.mode === 'flashcard' ? '🧠' : s.mode === 'quest' ? '🗺️' : '⌨️'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="capitalize font-bold">
                    {s.mode === 'flashcard' ? 'Flashcard Duel' : s.mode === 'quest' ? 'Quest Mode' : 'Typing Shooter'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {s.score}/{s.maxScore} · {s.accuracy}% accuracy{s.wpm ? ` · ${s.wpm} WPM` : ''} · {timeAgo(s.createdAt)}
                  </p>
                </div>
                <Link to={`/interview/session/${s.id}`} className="icon-btn text-slate-400 hover:text-indigo-500">
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
