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
  Power,
} from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { cn, timeAgo } from '../../lib/format';
import { difficultyMeta } from '../../lib/format';

const fmtDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function fmtDuration(ms) {
  if (!ms) return '—';
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '<1m';
}

function StatusBadge({ alive, idleSeconds }) {
  if (alive === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <span className="h-2 w-2 rounded-full bg-slate-400" /> Env unknown
      </span>
    );
  }
  if (!alive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-500/15 dark:text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-500" /> Container down
      </span>
    );
  }
  const idle = idleSeconds === null || idleSeconds === undefined ? 0 : idleSeconds;
  if (idle < 60) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Active now
      </span>
    );
  }
  const mins = Math.max(1, Math.round(idle / 60));
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      <span className="h-2 w-2 rounded-full bg-amber-500" /> Idle · {mins}m
    </span>
  );
}

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState(null);
  const [reachable, setReachable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [terminatingId, setTerminatingId] = useState(null);
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [terminateMessage, setTerminateMessage] = useState('');

  const openTerminateDialog = (s) => {
    setTerminateMessage('');
    setTerminateTarget(s);
  };

  const cancelTerminate = () => setTerminateTarget(null);

  const confirmTerminate = async () => {
    if (!terminateTarget) return;
    setTerminatingId(terminateTarget.id);
    try {
      await api(`/admin/sessions/${terminateTarget.id}/terminate`, {
        method: 'POST',
        body: { message: terminateMessage.trim() },
      });
      setTerminateTarget(null);
      load();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setTerminatingId(null);
    }
  };

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
    }, 5000);
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
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No users logged in yet.</p>
            ) : (
              <div className="max-h-[26rem] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900">
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                      <th className="px-4 py-3">User</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Email</th>
                      <th className="hidden px-4 py-3 md:table-cell">Total time</th>
                      <th className="hidden px-4 py-3 md:table-cell">Last login</th>
                      <th className="hidden px-4 py-3 md:table-cell">Logout</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-xs font-black text-white">
                              {l.picture ? (
                                <img src={l.picture} alt={l.name} className="h-full w-full object-cover" />
                              ) : (
                                l.name?.charAt(0).toUpperCase() || '?'
                              )}
                            </span>
                            <span className="font-semibold">{l.name || '—'}</span>
                          </span>
                        </td>
                        <td className="hidden px-4 py-2.5 text-slate-500 dark:text-slate-400 sm:table-cell">{l.email}</td>
                        <td className="hidden px-4 py-2.5 md:table-cell">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtDuration(l.totalActiveMs)}</span>
                        </td>
                        <td className="hidden px-4 py-2.5 md:table-cell">
                          <span className="block text-slate-700 dark:text-slate-300">{timeAgo(l.lastLoginAt)}</span>
                          <span className="block text-xs text-slate-400">{fmtDateTime(l.lastLoginAt)}</span>
                        </td>
                        <td className="hidden px-4 py-2.5 md:table-cell">
                          {l.online || !l.lastLogoutAt ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <>
                              <span className="block text-slate-700 dark:text-slate-300">{timeAgo(l.lastLogoutAt)}</span>
                              <span className="block text-xs text-slate-400">{fmtDateTime(l.lastLogoutAt)}</span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {l.online ? (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                              title={l.lastSeenAt ? `Last seen ${timeAgo(l.lastSeenAt)}` : ''}
                            >
                              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                              <span className="h-2 w-2 rounded-full bg-slate-400" /> Offline
                            </span>
                          )}
                        </td>
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
              <div className="max-h-[32rem] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Task</th>
                      <th className="hidden px-4 py-3 md:table-cell">Category</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Started</th>
                      <th className="px-4 py-3">Environment</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Container</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id} className="border-b border-slate-100 align-middle last:border-0 dark:border-white/5">
                        <td className="px-4 py-3">
                          <span className="flex min-w-0 items-center gap-3">
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
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex min-w-0 items-center gap-2">
                            <FileText size={15} className="shrink-0 text-brand-500" />
                            <span className="truncate font-semibold">{s.task?.title || 'Unknown task'}</span>
                            {s.task?.difficulty && (
                              <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold', difficultyMeta(s.task.difficulty).cls)}>
                                {difficultyMeta(s.task.difficulty).label}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 md:table-cell">
                          <span className="flex items-center gap-2">
                            <FolderTree size={15} className="shrink-0 text-slate-400" />
                            {s.category?.icon} {s.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 sm:table-cell" title={fmtDateTime(s.startedAt)}>
                          {timeAgo(s.startedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span title={s.lastActiveAt ? `Last seen ${fmtDateTime(s.lastActiveAt)}` : ''}>
                            <StatusBadge alive={s.containerAlive} idleSeconds={s.idleSeconds} />
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400" title={`Container ID: ${s.containerId}`}>
                            <Terminal size={12} />
                            <span className="max-w-[10rem] truncate font-mono">{s.containerId}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openTerminateDialog(s)}
                            disabled={terminatingId === s.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <Power size={13} />
                            {terminatingId === s.id ? 'Closing…' : 'Terminate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {sessions && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Server size={13} /> Sessions refresh every 5s. A container marked down means the student's lab environment has stopped.
            </p>
          )}
        </>
      )}

      {terminateTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={cancelTerminate}
        >
          <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-red-600 dark:text-red-400">
              <Power size={18} /> Terminate lab
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Close the environment for{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{terminateTarget.user?.name || 'this user'}</span>{' '}
              ({terminateTarget.task?.title || 'Unknown task'})? The container will be destroyed.
            </p>
            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Message to the student <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={terminateMessage}
              onChange={(e) => setTerminateMessage(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="e.g. Time is up — submit your answers and reach out to me for doubts."
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={cancelTerminate} className="btn-secondary" disabled={terminatingId === terminateTarget.id}>
                Cancel
              </button>
              <button
                onClick={confirmTerminate}
                disabled={terminatingId === terminateTarget.id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <Power size={15} />
                {terminatingId === terminateTarget.id ? 'Terminating…' : 'Terminate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
