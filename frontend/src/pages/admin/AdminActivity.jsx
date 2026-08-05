import { useEffect, useState } from 'react';
import {
  LogIn,
  Activity,
  RefreshCw,
  Server,
  Terminal,
  FileText,
  FolderTree,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { cn, timeAgo } from '../../lib/format';
import { difficultyMeta } from '../../lib/format';

const fmtDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function StatusBadge({ alive }) {
  if (alive === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <span className="h-2 w-2 rounded-full bg-slate-400" /> Env unknown
      </span>
    );
  }
  return alive ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Container active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-500/15 dark:text-red-400">
      <span className="h-2 w-2 rounded-full bg-red-500" /> Container down
    </span>
  );
}

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState(null);
  const [reachable, setReachable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    Promise.all([
      api('/admin/login-logs'),
      api('/admin/active-sessions').catch((e) => ({ sessions: [], orchestratorReachable: false })),
    ])
      .then(([l, s]) => {
        setLogs(l);
        setSessions(s.sessions);
        setReachable(s.orchestratorReachable);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    load();
    const t = setInterval(() => {
      setRefreshing(true);
      load();
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const manualRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Live activity</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Who logged in and which students are in a live lab right now.</p>
        </div>
        <button onClick={manualRefresh} className="btn-secondary" disabled={refreshing}>
          <RefreshCw size={15} className={cn(refreshing && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <FullPageSpinner label="Loading live activity…" />
      ) : (
        <>
          <div className="mt-6 card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <LogIn size={18} className="text-brand-500" /> Login log
              </h2>
              <span className="text-xs text-slate-400">{logs.length} recent</span>
            </div>
            {logs.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No logins recorded yet.</p>
            ) : (
              <div className="max-h-[26rem] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900">
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                      <th className="px-4 py-3">User</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Email</th>
                      <th className="hidden px-4 py-3 md:table-cell">Exact time</th>
                      <th className="px-4 py-3 text-right">Logged in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-xs font-black text-white">
                              {l.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                            <span className="font-semibold">{l.name || '—'}</span>
                          </span>
                        </td>
                        <td className="hidden px-4 py-2.5 text-slate-500 dark:text-slate-400 sm:table-cell">{l.email}</td>
                        <td className="hidden px-4 py-2.5 text-slate-500 dark:text-slate-400 md:table-cell">{fmtDateTime(l.at)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-brand-600 dark:text-brand-400">{timeAgo(l.at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Activity size={18} className="text-emerald-500" /> Active sessions
              </h2>
              <span className="text-xs text-slate-400">{sessions?.length ?? 0} running</span>
            </div>
            {sessions === null ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Loading sessions…</p>
            ) : !reachable ? (
              <div className="flex items-center gap-3 py-12 px-6 text-sm text-amber-600 dark:text-amber-400">
                <ShieldAlert size={18} />
                Orchestrator is unreachable — start the VPS container service to see environment status.
              </div>
            ) : sessions.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No students are in a lab right now.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {sessions.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      {s.user?.picture ? (
                        <img src={s.user.picture} alt="" className="h-9 w-9 shrink-0 rounded-full" />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-sm font-black text-white">
                          {s.user?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{s.user?.name || 'Unknown user'}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{s.user?.email}</span>
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                      <FileText size={15} className="shrink-0 text-brand-500" />
                      <span className="truncate font-semibold">{s.task?.title || 'Unknown task'}</span>
                      {s.task?.difficulty && (
                        <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-bold', difficultyMeta(s.task.difficulty).cls)}>
                          {difficultyMeta(s.task.difficulty).label}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FolderTree size={15} className="shrink-0" />
                      {s.category?.icon} {s.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400" title={fmtDateTime(s.startedAt)}>
                      started {timeAgo(s.startedAt)}
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusBadge alive={s.containerAlive} />
                      <span className="hidden items-center gap-1.5 text-xs text-slate-400 xl:flex" title="Container ID">
                        <Terminal size={12} /> <span className="font-mono">{s.containerId}</span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {sessions && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Server size={13} /> Sessions refresh every 30s. A container marked down means the student's lab environment has stopped.
            </p>
          )}
        </>
      )}
    </div>
  );
}
