import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, PlayCircle, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';
import { timeAgo, formatDuration, cn } from '../lib/format';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'evaluated', label: 'Completed' },
  { key: 'running', label: 'Running' },
  { key: 'terminated', label: 'Exited' },
];

export default function History() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api('/attempts')
      .then(setAttempts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? attempts : attempts.filter((a) => a.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Practice history</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Every attempt, score and AI analysis — saved permanently.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'badge !px-3 !py-1.5 transition',
              filter === f.key
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && <FullPageSpinner label="Loading history…" />}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-5xl">📭</div>
            <p className="mt-4 font-semibold text-slate-500 dark:text-slate-400">No attempts here yet.</p>
            <Link to="/practicals" className="btn-primary mt-4">Find a practical</Link>
          </div>
        )}
        {filtered.map((a) => (
          <Link key={a.id} to={`/history/${a.id}`} className="card flex items-center gap-4 transition hover:border-brand-300 dark:hover:border-brand-500/40">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                a.status === 'evaluated'
                  ? a.passed
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15'
                    : 'bg-red-100 text-red-600 dark:bg-red-500/15'
                  : a.status === 'running'
                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/15'
                    : 'bg-slate-100 text-slate-500 dark:bg-white/5'
              )}
            >
              {a.status === 'evaluated' ? (a.passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />) : a.status === 'running' ? <PlayCircle size={20} /> : <Clock size={20} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{a.task?.title || 'Task'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {a.category?.icon} {a.category?.name || ''} · {timeAgo(a.createdAt)}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              {a.status === 'evaluated' ? (
                <>
                  <p className={cn('font-black', a.passed ? 'text-emerald-500' : 'text-red-500')}>
                    {a.score}/{a.maxScore}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDuration(a.timeTakenSeconds)}</p>
                </>
              ) : (
                <span className={cn('badge', a.status === 'running' ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400')}>
                  {a.status}
                </span>
              )}
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
