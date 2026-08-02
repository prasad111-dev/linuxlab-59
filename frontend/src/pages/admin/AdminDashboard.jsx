import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  CheckCircle2,
  PlayCircle,
  FolderTree,
  Activity,
  Trophy,
  Server,
  Plus,
} from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { cn } from '../../lib/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [containers, setContainers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/admin/stats'),
      api('/admin/containers').catch(() => ({ containers: null })),
    ])
      .then(([s, c]) => {
        setStats(s);
        setContainers(c.containers);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner label="Loading admin stats…" />;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load admin stats.</div>;

  const c = stats.counts;
  const cards = [
    { label: 'Users', value: c.users, icon: Users, color: 'text-indigo-500', to: '/admin/users' },
    { label: 'Tasks', value: c.tasks, icon: FileText, color: 'text-violet-500', to: '/admin/tasks' },
    { label: 'Published', value: c.publishedTasks, icon: CheckCircle2, color: 'text-emerald-500', to: '/admin/tasks' },
    { label: 'Attempts', value: c.attempts, icon: Activity, color: 'text-amber-500', to: '/admin' },
    { label: 'Running labs', value: c.runningAttempts, icon: PlayCircle, color: 'text-sky-500', to: '/admin' },
    { label: 'Categories', value: c.categories, icon: FolderTree, color: 'text-pink-500', to: '/admin/categories' },
  ];

  const maxCat = Math.max(1, ...stats.attemptsByCategory.map((a) => a.count));
  const maxDay = Math.max(1, ...stats.activityLast7.map((a) => a.count));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Platform overview, live labs and performance.</p>
        </div>
        <Link to="/admin/tasks/new" className="btn-primary">
          <Plus size={16} /> New task
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return card.to ? (
            <Link key={card.label} to={card.to} className="card hover:border-indigo-300 dark:hover:border-indigo-500/40">
              <Icon size={20} className={card.color} />
              <p className="mt-2 text-2xl font-black">{card.value}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
            </Link>
          ) : (
            <div key={card.label} className="card">
              <Icon size={20} className={card.color} />
              <p className="mt-2 text-2xl font-black">{card.value}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Activity size={18} className="text-indigo-500" /> Attempts — last 7 days
          </h2>
          <div className="mt-4 flex h-32 items-end gap-2">
            {stats.activityLast7.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
            )}
            {stats.activityLast7.map((a) => (
              <div key={a._id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500"
                  style={{ height: `${Math.max(4, (a.count / maxDay) * 100)}%` }}
                  title={`${a.count} attempts`}
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{a._id.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <FolderTree size={18} className="text-violet-500" /> Attempts by category
          </h2>
          <div className="mt-4 space-y-2">
            {stats.attemptsByCategory.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No attempts recorded.</p>
            )}
            {stats.attemptsByCategory.map((a) => (
              <div key={a.category.name} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm font-medium">
                  {a.category.icon} {a.category.name}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${Math.max(4, (a.count / maxCat) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold">{a.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
            <span className="text-sm text-slate-500 dark:text-slate-400">Average score across all attempts</span>
            <span className="text-lg font-black">{stats.avgScore}%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Trophy size={18} className="text-amber-500" /> Top performers
          </h2>
          <div className="mt-3 space-y-2">
            {stats.topPerformers.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No leaderboard data yet.</p>
            )}
            {stats.topPerformers.map((e, i) => (
              <div key={e._id || i} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                <span className="w-6 font-black text-slate-400">#{e.rank}</span>
                <span className="flex-1 truncate font-semibold">{e.name}</span>
                <span className="text-sm font-bold text-indigo-500">{e.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Server size={18} className="text-emerald-500" /> Live containers
          </h2>
          {containers === null ? (
            <p className="mt-3 text-sm text-amber-500">Orchestrator unreachable — start the VPS container service.</p>
          ) : containers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No containers running right now.</p>
          ) : (
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {containers.map((ct) => (
                <div key={ct.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                  <span className={cn('h-2 w-2 rounded-full', ct.state === 'running' ? 'bg-emerald-500' : 'bg-slate-400')} />
                  <span className="flex-1 truncate font-mono text-xs">{ct.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{ct.uptime ?? ct.state}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
