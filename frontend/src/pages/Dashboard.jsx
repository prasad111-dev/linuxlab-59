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
  ListChecks,
  Medal,
  GraduationCap,
  Zap,
  Star,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';
import TaskCard from '../components/TaskCard';
import { timeAgo, cn } from '../lib/format';

const STATS = [
  {
    label: 'Completed',
    get: (s) => `${s.completed}/${s.totalTasks}`,
    icon: CheckCircle2,
    chip: 'bg-emerald-500',
    tint: 'from-emerald-500/15 to-emerald-500/5',
    ring: 'border-emerald-200/70 dark:border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Pending',
    get: (s) => s.pendingTasks,
    icon: Target,
    chip: 'bg-amber-500',
    tint: 'from-amber-500/15 to-amber-500/5',
    ring: 'border-amber-200/70 dark:border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Points',
    get: (s) => s.points,
    icon: Trophy,
    chip: 'bg-violet-500',
    tint: 'from-violet-500/15 to-violet-500/5',
    ring: 'border-violet-200/70 dark:border-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
  },
  {
    label: 'Avg score',
    get: (s) => `${s.avgScore}%`,
    icon: TrendingUp,
    chip: 'bg-sky-500',
    tint: 'from-sky-500/15 to-sky-500/5',
    ring: 'border-sky-200/70 dark:border-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
  },
];

const QUICK_ACTIONS = [
  {
    to: '/practicals',
    title: 'Linux Practicals',
    desc: 'Real IT tickets in isolated containers',
    icon: ListChecks,
    gradient: 'from-indigo-500 to-blue-600',
    glow: 'shadow-indigo-500/30',
    iconCls: 'text-indigo-200',
  },
  {
    to: '/interview',
    title: 'Interview Prep',
    desc: 'Flashcard Duel · Quest Mode · Typing',
    icon: Brain,
    gradient: 'from-fuchsia-500 to-purple-600',
    glow: 'shadow-fuchsia-500/30',
    iconCls: 'text-fuchsia-200',
    badge: 'AI',
  },
  {
    to: '/leaderboard',
    title: 'Leaderboard',
    desc: 'Climb the ranks and earn points',
    icon: Medal,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
    iconCls: 'text-amber-200',
  },
  {
    to: '/achievements',
    title: 'Achievements',
    desc: 'Unlock every badge on your journey',
    icon: Award,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
    iconCls: 'text-emerald-200',
  },
];

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

  const unlocked = stats.achievements.filter((a) => a.unlocked).length;
  const unlockedPct = stats.achievements.length ? Math.round((unlocked / stats.achievements.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 shadow-2xl shadow-indigo-600/30 sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-4 right-24 hidden text-5xl opacity-20 sm:block">🐧</div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-16 w-16 rounded-2xl border-2 border-white/30 shadow-lg" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black text-white backdrop-blur">
                {user?.name?.[0]}
              </div>
            )}
            <div>
              <p className="text-xs font-bold tracking-widest text-indigo-100 uppercase">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  <Flame size={13} className="text-amber-300" /> {stats.streak?.current || 0} day streak
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  <Zap size={13} className="text-amber-300" /> {stats.points} pts
                </span>
                {stats.runningAttempt && (
                  <button
                    onClick={resume}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <Play size={13} /> Resume lab
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
            <p className="text-4xl font-black text-white">#{stats.rank || '—'}</p>
            <p className="text-[11px] font-bold tracking-widest text-indigo-200 uppercase">Your rank</p>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={cn('card bg-gradient-to-br !p-5', s.tint, s.ring)}>
              <div className="flex items-center justify-between">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg', s.chip)}>
                  <Icon size={22} />
                </div>
                <Sparkles size={16} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className={cn('mt-4 text-3xl font-black', s.text)}>{s.get(stats)}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl',
                a.gradient,
                a.glow
              )}
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <div className="flex items-start justify-between">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur', a.iconCls)}>
                  <Icon size={22} />
                </div>
                {a.badge && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase backdrop-blur">
                    {a.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-base font-extrabold text-white">{a.title}</h3>
              <p className="mt-0.5 text-xs text-white/75">{a.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white/90">
                Open <ArrowRight size={13} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Progress ring + achievements */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card flex items-center gap-5 !p-6">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" className="stroke-slate-100 dark:stroke-white/10" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(unlockedPct / 100) * 213.6} 213.6`}
                className="stroke-emerald-500"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-sm font-black">{unlockedPct}%</p>
            </div>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-extrabold">
              <Star size={15} className="text-amber-500" /> {unlocked} badges unlocked
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              of {stats.achievements.length} total. Keep going, you're doing great!
            </p>
            <Link to="/achievements" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              View badges <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="card flex items-center justify-between !p-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
              <Flame size={26} />
            </div>
            <div>
              <p className="text-2xl font-black">
                {stats.streak?.current || 0} day{stats.streak?.current === 1 ? '' : 's'}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Learning streak — keep the momentum 🔥</p>
            </div>
          </div>
          <div className="hidden h-2 w-1/3 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
              style={{ width: `${Math.min(100, (stats.streak?.current || 0) * 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={19} className="text-indigo-500" />
            <h2 className="text-lg font-extrabold">Recommended for you</h2>
          </div>
          <Link to="/practicals" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {stats.recommended.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="text-5xl">🎉</div>
            <p className="mt-3 font-semibold text-slate-500 dark:text-slate-400">
              You've attempted every published practical. New ones will appear here!
            </p>
          </div>
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
              <div key={c.category.id} className="card group transition hover:border-indigo-200 dark:hover:border-indigo-500/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {c.category.icon} {c.category.name}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {c.completed}/{c.total}
                  </span>
                </div>
                <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all group-hover:brightness-110"
                    style={{ width: `${c.percent}%`, backgroundColor: c.category.color || '#6366f1' }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">{c.percent}% complete</p>
              </div>
            ))}
        </div>
      </div>

      {/* Recent activity + achievements */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-extrabold">Recent activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 && (
              <div className="card py-10 text-center">
                <div className="text-4xl">🚀</div>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No activity yet. Start your first practical!
                </p>
                <Link to="/practicals" className="btn-primary mt-4">
                  <Play size={15} /> Start now
                </Link>
              </div>
            )}
            {stats.recentActivity.map((a) => (
              <Link key={a.id} to={`/history/${a.id}`} className="card flex items-center gap-3 !p-4 transition hover:border-indigo-300 dark:hover:border-indigo-500/40">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', a.passed ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25' : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/25')}>
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
              <div key={a.code} className={cn('card flex items-center gap-3 !p-4 transition hover:border-indigo-200 dark:hover:border-indigo-500/30', !a.unlocked && 'opacity-40 grayscale')}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-bold">{a.name}</p>
                  <p className={cn('text-[11px]', a.unlocked ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400')}>
                    {a.unlocked ? '✓ Unlocked' : 'Locked'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
