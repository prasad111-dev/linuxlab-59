import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Trophy,
  Target,
  CheckCircle2,
  Clock,
  Play,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRight,
  Brain,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';
import TaskCard from '../components/TaskCard';
import { timeAgo, difficultyMeta, cn } from '../lib/format';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/users/me/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (!stats) return <FullPageSpinner label="Loading your dashboard…" />;

  const resume = () => {
    if (stats.runningAttempt) navigate(`/lab/${stats.runningAttempt.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img src={user.picture} alt="" className="h-14 w-14 rounded-2xl" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
              {user?.name?.[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        {stats.runningAttempt && (
          <button onClick={resume} className="btn-secondary">
            <Play size={16} /> Resume lab
          </button>
        )}
        <Link to="/practicals" className="btn-primary sm:hidden">
          Browse practicals
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Completed" value={`${stats.completed}/${stats.totalTasks}`} color="text-emerald-500" />
        <StatCard icon={Target} label="Pending" value={stats.pendingTasks} color="text-amber-500" />
        <StatCard icon={Trophy} label="Points" value={stats.points} color="text-violet-500" />
        <StatCard icon={TrendingUp} label="Avg score" value={`${stats.avgScore}%`} color="text-sky-500" />
      </div>

      {/* Interview prep banner */}
      <Link
        to="/interview"
        className="group mt-6 flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 shadow-lg shadow-indigo-600/25 transition hover:shadow-xl hover:shadow-indigo-600/40"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
          <Brain size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-white">
            <h2 className="text-base font-extrabold sm:text-lg">Interview Preparation</h2>
            <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold sm:inline-flex">
              <Sparkles size={11} className="mr-1" /> AI analysis
            </span>
          </div>
          <p className="mt-0.5 text-sm text-indigo-100">
            Flashcard Duel · Quest Mode · Typing Shooter — get ready for Linux interviews.
          </p>
        </div>
        <ChevronRight size={20} className="shrink-0 text-white/70 transition group-hover:translate-x-1" />
      </Link>

      {/* Streak + rank */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/15">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.streak?.current || 0} day{stats.streak?.current === 1 ? '' : 's'}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Learning streak</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-500 dark:bg-amber-500/15">
            <Award size={24} />
          </div>
          <div>
            <p className="text-2xl font-black">#{stats.rank || '—'}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall rank</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500 dark:bg-indigo-500/15">
            <Award size={24} />
          </div>
          <div>
            <p className="text-2xl font-black">
              {stats.achievements.filter((a) => a.unlocked).length}/{stats.achievements.length}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Achievements</p>
          </div>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Recommended practicals</h2>
          <Link to="/practicals" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {stats.recommended.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You've attempted every published practical. New ones will appear here. 🎉
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recommended.map((t) => (
              <TaskCard key={t.id} task={{ ...t, category: t.category }} />
            ))}
          </div>
        )}
      </div>

      {/* Category progress */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-extrabold">Progress by category</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.categoryProgress
            .filter((c) => c.total > 0)
            .map((c) => (
              <div key={c.category.id} className="card">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {c.category.icon} {c.category.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {c.completed}/{c.total}
                  </span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${c.percent}%`, backgroundColor: c.category.color || '#6366f1' }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-extrabold">Recent activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet. Start your first practical!</p>
            )}
            {stats.recentActivity.map((a) => (
              <Link key={a.id} to={`/history/${a.id}`} className="card flex items-center gap-3 !p-4 transition hover:border-indigo-300 dark:hover:border-indigo-500/40">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', a.passed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15')}>
                  {a.passed ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{a.taskTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {a.score}/{a.maxScore} pts · {timeAgo(a.createdAt)}
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Achievements preview */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Recent achievements</h2>
            <Link to="/achievements" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.achievements.map((a) => (
              <div key={a.code} className={cn('card flex items-center gap-3 !p-4', !a.unlocked && 'opacity-40 grayscale')}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-bold">{a.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{a.unlocked ? 'Unlocked' : 'Locked'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/5', color)}>
        <Icon size={20} />
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
