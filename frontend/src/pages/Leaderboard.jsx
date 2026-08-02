import { useEffect, useState } from 'react';
import { Trophy, Medal, TrendingUp, Crown, Flame } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';
import { cn } from '../lib/format';

const PERIODS = [
  { key: 'week', label: 'This week', icon: TrendingUp },
  { key: 'month', label: 'This month', icon: Flame },
  { key: 'all', label: 'All time', icon: Trophy },
];

const MEDAL = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/leaderboard?period=${period}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  const rows = data?.rows || [];
  const myId = user?.id;
  const me = rows.find((r) => r.user && r.user._id === myId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Earn points by solving practicals — climb the ranks.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {PERIODS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition',
                  period === p.key
                    ? 'bg-white text-slate-900 shadow dark:bg-white/10 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                <Icon size={14} /> {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {me && (
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={20} />
              <p className="font-bold">You are <span className="font-black">#{me.rank}</span> this period</p>
            </div>
            <p className="text-sm font-semibold opacity-90">{me.points} pts</p>
          </div>
        </div>
      )}

      <div className="mt-6 card overflow-hidden p-0">
        {loading && <FullPageSpinner label="Loading ranks…" />}
        {!loading && rows.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">No submissions yet — be the first to earn points!</div>
        )}
        {!loading && rows.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">User</th>
                <th className="hidden px-4 py-3 sm:table-cell">Practicals</th>
                <th className="hidden px-4 py-3 sm:table-cell">Passed</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => {
                const isMe = e.user && e.user._id === myId;
                return (
                  <tr key={e.user?._id || i} className={cn('border-b border-slate-100 last:border-0 dark:border-white/5', isMe && 'bg-indigo-50 dark:bg-indigo-500/10')}>
                    <td className="px-4 py-3">
                      {i < 3 ? <Medal size={18} className={MEDAL[i]} /> : <span className="font-bold text-slate-500">{e.rank}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-semibold">
                        {e.user?.name || 'Unknown user'}
                        {isMe && <span className="badge bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">you</span>}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 sm:table-cell">{e.tasks}</td>
                    <td className="hidden px-4 py-3 text-emerald-600 dark:text-emerald-400 sm:table-cell">{e.passedTasks}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">{e.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Points come from task completions plus bonuses for speed, using no hints, and daily streaks.
      </p>
    </div>
  );
}
