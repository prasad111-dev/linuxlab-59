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
import { fireConfetti } from '../lib/confetti';
import { timeAgo, cn } from '../lib/format';

const QUICK_ACTIONS = [
  {
    to: '/practicals',
    title: 'Linux Practicals',
    desc: 'Real IT tickets · live containers',
    icon: ListChecks,
    tint: 'from-indigo-500/20 to-blue-500/20 hover:shadow-indigo-500/40',
    chip: 'from-indigo-500 to-blue-600',
    text: 'text-indigo-600 dark:text-indigo-300',
  },
  {
    to: '/interview',
    title: 'Interview Prep',
    desc: 'Flashcards · Quest · Typing',
    icon: Brain,
    tint: 'from-fuchsia-500/20 to-violet-500/20 hover:shadow-fuchsia-500/40',
    chip: 'from-fuchsia-500 to-violet-600',
    text: 'text-fuchsia-600 dark:text-fuchsia-300',
    badge: 'AI',
  },
  {
    to: '/leaderboard',
    title: 'Leaderboard',
    desc: 'Climb ranks · earn points',
    icon: Medal,
    tint: 'from-amber-500/20 to-orange-500/20 hover:shadow-amber-500/40',
    chip: 'from-amber-400 to-orange-500',
    text: 'text-amber-600 dark:text-amber-300',
  },
  {
    to: '/achievements',
    title: 'Achievements',
    desc: 'Unlock every badge',
    icon: Award,
    tint: 'from-emerald-500/20 to-teal-500/20 hover:shadow-emerald-500/40',
    chip: 'from-emerald-400 to-teal-500',
    text: 'text-emerald-600 dark:text-emerald-300',
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Burning the midnight oil 🌙';
  if (h < 12) return 'Good morning 🌅';
  if (h < 17) return 'Good afternoon ☀️';
  if (h < 21) return 'Good evening 🌆';
  return 'Good night 🌙';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    api('/users/me/stats')
      .then((s) => {
        setStats(s);
        if (!celebrated && (s.completed > 0 || s.points > 0)) {
          fireConfetti({ count: 40, y: 0.2 });
          setCelebrated(true);
        }
      })
      .catch((e) => setError(e.message));
  }, [celebrated]);

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
  const streakPct = Math.min(100, (stats.streak?.current || 0) * 4);
  const streakActive = (stats.streak?.current || 0) > 0;

  const statsRow = [
    { icon: CheckCircle2, label: 'Completed', value: `${stats.completed}/${stats.totalTasks}`, tint: 'from-emerald-500/25 to-teal-500/20', chip: 'from-emerald-400 to-teal-500', valueText: 'text-emerald-600 dark:text-emerald-300' },
    { icon: Target, label: 'Pending', value: stats.pendingTasks, tint: 'from-amber-500/25 to-orange-500/20', chip: 'from-amber-400 to-orange-500', valueText: 'text-amber-600 dark:text-amber-300' },
    { icon: Trophy, label: 'Points', value: stats.points, tint: 'from-violet-500/25 to-indigo-500/20', chip: 'from-violet-500 to-indigo-600', valueText: 'text-violet-600 dark:text-violet-300' },
    { icon: TrendingUp, label: 'Avg score', value: `${stats.avgScore}%`, tint: 'from-sky-500/25 to-cyan-500/20', chip: 'from-sky-400 to-cyan-500', valueText: 'text-sky-600 dark:text-sky-300' },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-indigo-100/80 via-fuchsia-50/70 to-cyan-100/80 dark:bg-transparent">
        <div className="animate-blob absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-indigo-400/50 blur-3xl dark:bg-indigo-600/25" />
        <div className="animate-blob absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-fuchsia-400/45 blur-3xl [animation-delay:5s] dark:bg-fuchsia-600/20" />
        <div className="animate-blob absolute bottom-16 left-0 h-80 w-80 rounded-full bg-cyan-300/50 blur-3xl [animation-delay:9s] dark:bg-cyan-500/15" />
        <div className="animate-blob absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-amber-300/50 blur-3xl [animation-delay:12s] dark:bg-amber-500/15" />
        <div className="absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-300/50 blur-3xl dark:bg-violet-600/20" />
      </div>

      {/* Header */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl border border-white/70 bg-white/40 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-7 dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gradient-to-br from-indigo-400/40 to-fuchsia-400/40 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-amber-400 blur-sm" />
              {user?.picture ? (
                <img src={user.picture} alt="" className="relative h-14 w-14 rounded-full border-2 border-white object-cover dark:border-white/20" />
              ) : (
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-black text-white backdrop-blur">
                  {user?.name?.[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-300">
                {greeting()}, {user?.name?.split(' ')[0]}!
              </p>
              <h1 className="mt-0.5 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl dark:from-indigo-400 dark:via-fuchsia-400 dark:to-amber-300">
                Welcome back!
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                What would you like to practice today?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
              <Flame size={13} /> {stats.streak?.current || 0}d
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30">
              <Zap size={13} /> {stats.points} pts
            </span>
            {stats.runningAttempt && (
              <button
                onClick={resume}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Play size={13} /> Resume
              </button>
            )}
          </div>
        </div>

        {/* Slim stat strip inside the header card */}
        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {statsRow.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={cn('flex items-center gap-2.5 rounded-2xl border border-white/60 bg-gradient-to-br px-3.5 py-2.5 backdrop-blur dark:border-white/10', s.tint)}>
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', s.chip)}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className={cn('truncate text-lg leading-tight font-black', s.valueText)}>{s.value}</p>
                  <p className="text-[11px] leading-tight font-semibold text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              style={{ animationDelay: `${i * 70}ms` }}
              className={cn(
                'group animate-fade-up relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10',
                a.tint
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition group-hover:scale-110 group-hover:rotate-3', a.chip)}>
                  <Icon size={20} />
                </div>
                {a.badge && (
                  <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-lg shadow-fuchsia-500/30">
                    {a.badge}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <h3 className={cn('text-sm font-extrabold sm:text-base', a.text)}>{a.title}</h3>
                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block dark:text-slate-400">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Streak + badges */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="glass flex items-center justify-between !p-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl shadow-lg', streakActive ? 'animate-wiggle bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/40' : 'bg-slate-200 text-slate-400 dark:bg-white/10')}>
              <Flame size={22} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">{stats.streak?.current || 0} day streak</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {streakActive ? 'Keep the momentum!' : 'Complete a practical to start a streak'}
              </p>
            </div>
          </div>
          <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${streakPct}%` }}
            />
          </div>
        </div>

        <div className="glass flex items-center justify-between !p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/40">
              <Star size={22} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">{unlocked}/{stats.achievements.length} badges</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Achievements unlocked</p>
            </div>
          </div>
          <Link to="/achievements" className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            View
          </Link>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
            <GraduationCap size={18} className="text-indigo-500" /> Recommended for you
          </h2>
          <Link to="/practicals" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {stats.recommended.length === 0 ? (
          <div className="glass py-10 text-center">
            <div className="text-4xl">🎉</div>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              You've attempted every published practical. New ones will appear here!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recommended.map((t) => (
              <TaskCard key={t.id} task={{ ...t, category: t.category }} />
            ))}
          </div>
        )}
      </div>

      {/* Category progress */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">Progress by category</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.categoryProgress
            .filter((c) => c.total > 0)
            .map((c) => (
              <div key={c.category.id} className="glass !p-4 transition hover:border-indigo-200 dark:hover:border-indigo-500/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {c.category.icon} {c.category.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {c.completed}/{c.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r transition-all duration-1000"
                    style={{ width: `${c.percent}%`, backgroundColor: c.category.color || '#6366f1' }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent activity + achievements */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">Recent activity</h2>
          <div className="space-y-2.5">
            {stats.recentActivity.length === 0 && (
              <div className="glass py-10 text-center">
                <div className="animate-float text-4xl">🚀</div>
                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No activity yet. Start your first practical!
                </p>
                <Link to="/practicals" className="btn-primary mt-4">
                  <Play size={15} /> Start now
                </Link>
              </div>
            )}
            {stats.recentActivity.map((a) => (
              <Link key={a.id} to={`/history/${a.id}`} className="glass flex items-center gap-3 !p-3.5 transition hover:border-indigo-300 dark:hover:border-indigo-500/40">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', a.passed ? 'from-emerald-400 to-teal-500 shadow-emerald-500/30' : 'from-amber-400 to-orange-500 shadow-amber-500/30')}>
                  {a.passed ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{a.taskTitle}</p>
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent achievements</h2>
            <Link to="/achievements" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {stats.achievements.map((a) => (
              <div key={a.code} className={cn('glass flex items-center gap-3 !p-3.5 transition hover:border-indigo-200 dark:hover:border-indigo-500/30', !a.unlocked && 'opacity-40 grayscale')}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.name}</p>
                  <p className={cn('text-[11px]', a.unlocked ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400')}>
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
