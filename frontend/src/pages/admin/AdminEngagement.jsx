import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  RefreshCw,
  Users,
  Flame,
  CalendarDays,
  ArrowLeft,
  X,
  Timer,
} from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { cn } from '../../lib/format';

const fmtDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function fmtDuration(ms) {
  if (!ms) return '0m';
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function sortableHeader({ label, col, sort, setSort }) {
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => setSort((s) => (s.key === col && s.dir === 'desc' ? { key: col, dir: 'asc' } : { key: col, dir: 'desc' }))}
        className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-800 dark:hover:text-slate-200"
      >
        {label}
        <span className="text-[10px] text-slate-400">{sort.key === col ? (sort.dir === 'desc' ? '▼' : '▲') : '↕'}</span>
      </button>
    </th>
  );
}

export default function AdminEngagement() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sort, setSort] = useState({ key: 'totalMs', dir: 'desc' });

  const load = () => {
    api('/admin/engagement')
      .then(setUsers)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    load();
    let t = setInterval(() => {
      setRefreshing(true);
      load();
    }, 5000);
    const onVis = () => {
      if (document.hidden) {
        clearInterval(t);
        t = null;
      } else if (!t) {
        setRefreshing(true);
        load();
        t = setInterval(() => {
          setRefreshing(true);
          load();
        }, 5000);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const selectUser = async (u) => {
    setSelected(u);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await api(`/admin/engagement/users/${u.id}`);
      setDetail(d);
    } catch (e) {
      window.alert(e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const sorted = useMemo(() => {
    if (!users) return [];
    return [...users].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === 'desc' ? -cmp : cmp;
    });
  }, [users, sort]);

  const todayTotal = useMemo(() => (users || []).reduce((s, u) => s + u.todayMs, 0), [users]);
  const weekTotal = useMemo(() => (users || []).reduce((s, u) => s + u.weekMs, 0), [users]);
  const topToday = useMemo(() => (users || []).reduce((a, b) => (b.todayMs > (a?.todayMs || 0) ? b : a), null), [users]);

  const maxDayMs = useMemo(
    () => Math.max(1, ...(detail?.daily || []).map((d) => d.ms)),
    [detail]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Time analytics</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            How much time each student spends on the platform — today, this week, and overall.
          </p>
        </div>
        <button onClick={() => { setRefreshing(true); load(); }} className="btn-secondary" disabled={refreshing}>
          <RefreshCw size={15} className={cn(refreshing && 'animate-spin')} /> Refresh
        </button>
      </div>

      {loading ? (
        <FullPageSpinner label="Loading time analytics…" />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Clock size={22} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Time today (all)</p>
                <p className="text-2xl font-extrabold">{fmtDuration(todayTotal)}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CalendarDays size={22} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Last 7 days (all)</p>
                <p className="text-2xl font-extrabold">{fmtDuration(weekTotal)}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Flame size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Most active today</p>
                <p className="truncate text-lg font-extrabold">{topToday ? topToday.name : '—'}</p>
                <p className="text-xs text-slate-400">{topToday ? fmtDuration(topToday.todayMs) : 'no activity yet'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Users size={18} className="text-brand-500" /> Student time
              </h2>
              <span className="text-xs text-slate-400">{users?.length ?? 0} students</span>
            </div>
            {sorted.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No activity recorded yet.</p>
            ) : (
              <div className="max-h-[30rem] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
                      <th className="px-4 py-3">Student</th>
                      {sortableHeader({ label: 'Total', col: 'totalMs', sort, setSort })}
                      {sortableHeader({ label: 'Today', col: 'todayMs', sort, setSort })}
                      {sortableHeader({ label: '7 days', col: 'weekMs', sort, setSort })}
                      {sortableHeader({ label: 'Sessions', col: 'sessionCount', sort, setSort })}
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => selectUser(u)}
                        className={cn(
                          'cursor-pointer border-b border-slate-100 align-middle transition last:border-0 dark:border-white/5',
                          selected?.id === u.id && 'bg-brand-50/60 dark:bg-brand-500/10'
                        )}
                      >
                        <td className="px-4 py-3">
                          <span className="flex min-w-0 items-center gap-3">
                            {u.picture ? (
                              <img src={u.picture} alt="" className="h-9 w-9 shrink-0 rounded-full" />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-sm font-black text-white">
                                {u.name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">{u.name}</span>
                              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-brand-600 dark:text-brand-400">{fmtDuration(u.totalMs)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{fmtDuration(u.todayMs)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDuration(u.weekMs)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.sessionCount}</td>
                        <td className="px-4 py-3 text-right">
                          {u.online ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
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

          {selected && (
            <div className="mt-6 card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                    {selected.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold">{selected.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lifetime {fmtDuration(detail?.user?.totalMs ?? selected.totalMs)} · {selected.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected && (
                    <button onClick={() => setSelected(null)} className="btn-secondary !px-3 !py-1.5 text-xs">
                      <X size={13} /> Close
                    </button>
                  )}
                </div>
              </div>

              {detailLoading ? (
                <p className="py-10 text-center text-sm text-slate-400">Loading details…</p>
              ) : detail ? (
                <>
                  <div className="px-4 pt-5 pb-2">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <CalendarDays size={15} className="text-brand-500" /> Last 14 days
                    </h4>
                  </div>
                  <div className="flex items-end gap-1.5 px-4 pb-6" style={{ height: 150 }}>
                    {detail.daily.map((d) => (
                      <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                        <span className="text-[9px] font-semibold text-slate-400">{d.ms ? fmtDuration(d.ms) : ''}</span>
                        <div
                          className={cn('w-full max-w-7 rounded-t-md', d.ms ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10')}
                          style={{ height: d.ms ? Math.max(6, Math.round((d.ms / maxDayMs) * 100)) : 3 }}
                          title={`${d.date}: ${fmtDuration(d.ms)}`}
                        />
                        <span className="text-[9px] text-slate-400">{d.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/5">
                    <h4 className="flex items-center gap-2 px-4 pt-4 pb-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <Timer size={15} className="text-brand-500" /> Session history
                    </h4>
                    {detail.sessions.length === 0 ? (
                      <p className="px-4 pb-5 text-sm text-slate-400">No sessions recorded yet.</p>
                    ) : (
                      <div className="max-h-72 overflow-auto px-2 pb-4">
                        <table className="w-full text-left text-sm">
                          <thead className="sticky top-0 bg-white dark:bg-slate-900">
                            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                              <th className="px-2 py-2">Started</th>
                              <th className="px-2 py-2">Ended</th>
                              <th className="px-2 py-2 text-right">Active time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.sessions.map((s, i) => (
                              <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                                <td className="px-2 py-2 text-slate-700 dark:text-slate-200">{fmtDateTime(s.loginAt)}</td>
                                <td className="px-2 py-2">
                                  {s.logoutAt ? (
                                    <span className="text-slate-700 dark:text-slate-200">{fmtDateTime(s.logoutAt)}</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Open{s.stale ? ' (ended)' : ''}
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">{fmtDuration(s.ms)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <ArrowLeft size={13} /> Time counts only while a student is actively using the site (idle open tabs are not counted).
          </p>
        </>
      )}
    </div>
  );
}
