import { useEffect, useState } from 'react';
import { Activity, FileText, FolderTree, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { cn, timeAgo, formatDuration, scoreColor, difficultyMeta } from '../../lib/format';

const STATUS = {
  running: { label: 'Running', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  submitted: { label: 'Submitted', cls: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400' },
  evaluated: { label: 'Evaluated', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  terminated: { label: 'Terminated', cls: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300' },
  error: { label: 'Error', cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300' };
  return <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold', s.cls)}>{s.label}</span>;
}

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/admin/attempts')
      .then(setAttempts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Attempts</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">All practice attempts across students, newest first.</p>
        </div>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{attempts.length} shown</span>
      </div>

      <div className="mt-6 card overflow-hidden p-0">
        {loading && <FullPageSpinner label="Loading attempts…" />}
        {!loading && attempts.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">No attempts recorded yet.</p>
        )}
        {!loading && attempts.length > 0 && (
          <div className="max-h-[36rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Task</th>
                  <th className="hidden px-4 py-3 md:table-cell">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Score</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Result</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Time</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 align-middle last:border-0 dark:border-white/5">
                    <td className="px-4 py-3">
                      <span className="flex min-w-0 items-center gap-3">
                        {a.user?.picture ? (
                          <img src={a.user.picture} alt="" className="h-8 w-8 shrink-0 rounded-full" />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-xs font-black text-white">
                            {a.user?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{a.user?.name || 'Unknown user'}</span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{a.user?.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText size={15} className="shrink-0 text-brand-500" />
                        <span className="truncate font-semibold">{a.task?.title || 'Unknown task'}</span>
                        {a.task?.difficulty && (
                          <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold', difficultyMeta(a.task.difficulty).cls)}>
                            {difficultyMeta(a.task.difficulty).label}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 md:table-cell">
                      <span className="flex items-center gap-2">
                        <FolderTree size={15} className="shrink-0 text-slate-400" />
                        {a.category?.icon} {a.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={cn('font-bold', scoreColor(a.score, a.maxScore))}>
                        {a.score}
                        <span className="font-medium text-slate-400"> / {a.maxScore}</span>
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {a.status === 'evaluated' ? (
                        a.passed ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Passed</span>
                        ) : (
                          <span className="font-bold text-red-600 dark:text-red-400">Failed</span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 lg:table-cell">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {formatDuration(a.timeTakenSeconds)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300" title={a.createdAt}>
                      {timeAgo(a.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Activity size={13} /> Shows the most recent attempts. Running attempts are the ones with a live lab environment.
      </p>
    </div>
  );
}
