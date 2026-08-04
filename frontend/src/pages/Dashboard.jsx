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
import { fireConfetti } from '../lib/confetti';
import { timeAgo, cn } from '../lib/format';

const QUICK_ACTIONS = [
  {
    to: '/practicals',
    title: 'Linux Practicals',
    desc: 'Real IT tickets · live containers',
    icon: ListChecks,
    gradient: 'from-indigo-500 to-blue-600',
    glow: 'shadow-indigo-500/30',
  },
  {
    to: '/interview',
    title: 'Interview Prep',
    desc: 'Flashcards · Quest · Typing',
    icon: Brain,
    gradient: 'from-fuchsia-500 to-purple-600',
    glow: 'shadow-fuchsia-500/30',
    badge: 'AI',
  },
  {
    to: '/leaderboard',
    title: 'Leaderboard',
    desc: 'Climb ranks · earn points',
    icon: Medal,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
  },
  {
    to: '/achievements',
    title: 'Achievements',
    desc: 'Unlock every badge',
    icon: Award,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
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
          fireConfetti({ count: 50, y: 0.2 });
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
  const unlockedPct = stats.achievements.length ? Math.round((unlocked / stats.achievements.length) * 100) : 0;
  const streakPct = Math.min(100, (stats.streak?.current || 0) * 4);
  const streakActive = (stats.streak?.current || 0) > 0;

  const statsRow = [
    { icon: CheckCircle2, label: 'Done', value: `${stats.completed}/${stats.totalTasks}`, chip: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Target, label: 'Todo', value: stats.pendingTasks, chip: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    { icon: Trophy, label: 'Points', value: stats.points, chip: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
    { icon: TrendingUp, label: 'Avg', value: `${stats.avgScore}%`, chip: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Compact hero */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 shadow-2xl shadow-indigo-600/30 sm:p-7">
        <div className="animate-blob pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="animate-blob pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl [animation-delay:4s]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-14 w-14 rounded-2xl border-2 border-white/30 shadow-lg" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-white backdrop-blur">
                {user?.name?.[0]}
              </div>
            )}
            <div>
              <p className="text-xs font-bold tracking-widest text-indigo-100 uppercase">
                {greeting()}, {user?.name?.split(' ')[0]}!
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Ready for today's mission?
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              <Flame size={13} className="text-amber-300" /> {stats.streak?.current || 0}d
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              <Zap size={13} className="text-amber-300" /> {stats.points} pts
            </span>
            {stats.runningAttempt && (
              <button
                onClick={resume}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
              >
                <Play size={13} /> Resume
              </button>
            )}
          </div>
        </div>

        {/* Slim stat strip inside hero */}
        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {statsRow.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md', s.chip)}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className={cn('truncate text-lg leading-tight font-black', s.text)}>{s.value}</p>
                  <p className="text-[11px] leading-tight font-semibold text-white/70">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions — compact 2x2 grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              style={{ animationDelay: `${i * 70}ms` }}
              className={cn(
                'group animate-fade-up relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl sm:p-5',
                a.gradient,
                a.glow
              )}
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <span className="animate-shine pointer-events-none absolute top-0 left-0 h-full w-1/3 bg-white/10 blur-md" />
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition group-hover:scale-110 sm:h-10 sm:w-10">
                  <Icon size={20} />
                </div>
                {a.badge && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase backdrop-blur">
                    {a.badge}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-extrabold text-white sm:text-base">{a.title}</h3>
                <p className="mt-0.5 hidden text-xs text-white/75 sm:block">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Streak + badges mini row */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="card flex items-center justify-between !p-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg shadow-amber-500/25', streakActive ? 'animate-wiggle bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-slate-300 to-slate-400')}>
              <Flame size={22} />
            </div>
            <div>
              <p className="text-lg font-black">{stats.streak?.current || 0} day streak</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {streakActive ? 'Keep the momentum! 🔥' : 'Complete a practical to start 🔥'}
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

        <div className="card flex items-center justify-between !p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
              <Star size={22} />
            </div>
            <div>
              <p className="text-lg font-black">{unlocked}/{stats.achievements.length} badges</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Achievements unlocked</p>
            </div>
          </div>
          <Link to="/achievements" className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            View
          </Link>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <GraduationCap size={18} className="text-indigo-500" /> Recommended for you
          </h2>
          <Link to="/practicals" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {stats.recommended.length === 0 ? (
          <div className="card py-10 text-center">
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
        <h2 className="mb-3 text-base font-extrabold">Progress by category</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.categoryProgress
            .filter((c) => c.total > 0)
            .map((c) => (
              <div key={c.category.id} className="card !p-4 transition hover:border-indigo-200 dark:hover:border-indigo-500/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {c.category.icon} {c.category.name}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {c.completed}/{c.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
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
          <h2 className="mb-3 text-base font-extrabold">Recent activity</h2>
          <div className="space-y-2.5">
            {stats.recentActivity.length === 0 && (
              <div className="card py-10 text-center">
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
              <Link key={a.id} to={`/history/${a.id}`} className="card flex items-center gap-3 !p-3.5 transition hover:border-indigo-300 dark:hover:border-indigo-500/40">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md', a.passed ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/25')}>
                  {a.passed ? <CheckCircle2 size={18} /> : <Clock size={18} />}
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold">Recent achievements</h2>
            <Link to="/achievements" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {stats.achievements.map((a) => (
              <div key={a.code} className={cn('card flex items-center gap-3 !p-3.5 transition hover:border-indigo-200 dark:hover:border-indigo-500/30', !a.unlocked && 'opacity-40 grayscale')}>
                <span className="animate-float text-2xl" style={{ animationDelay: `${(a.code.length % 5) * 0.3}s` }}>{a.icon}</span>
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
