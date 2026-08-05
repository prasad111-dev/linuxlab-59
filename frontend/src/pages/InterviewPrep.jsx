import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronRight, History } from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';
import { MODES, CATEGORIES, modeMeta } from '../data/interviewData';
import { timeAgo, cn } from '../lib/format';

export default function InterviewPrep() {
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    api('/interview/sessions')
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    modes: MODES.filter((m) => m.category === cat),
  })).filter((g) => g.modes.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Interview <span className="gradient-text">Preparation</span>
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {MODES.length} AI-powered drills — from command tickets to career simulators. Every session ends
            with a personalized analysis from the AI coach, and several modes generate fresh questions on demand.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Sparkles size={14} className="text-brand-500" /> AI analysis saved to your history
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{MODES.length} drills</span>
        <span className="badge bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">{CATEGORIES.length} categories</span>
        <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Gemini-generated scenarios</span>
      </div>

      {byCategory.map(({ cat, modes }) => (
        <section key={cat} className="mt-10">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">{cat}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modes.map((m) => (
              <Link
                key={m.mode}
                to={m.route}
                className="card group relative flex flex-col !p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl dark:hover:border-brand-500/40"
              >
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl text-white shadow-lg', m.gradient)}>
                  {m.icon}
                </div>
                <h3 className="mt-4 text-base font-extrabold">{m.title}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">{m.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  {m.gemini ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-500">
                      <Sparkles size={12} /> AI-generated
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
                    Start <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-14">
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
            {sessions.map((s) => {
              const meta = modeMeta(s.mode);
              return (
                <div key={s.id} className="card flex items-center gap-4 !p-4">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl text-white', meta.gradient)}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{meta.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {s.score}/{s.maxScore} · {s.accuracy}% accuracy{s.wpm ? ` · ${s.wpm} WPM` : ''} · {timeAgo(s.createdAt)}
                    </p>
                  </div>
                  <Link to={`/interview/session/${s.id}`} className="icon-btn text-slate-400 hover:text-brand-500">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
