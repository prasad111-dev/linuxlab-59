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
  },
  {
    to: '/interview',
    title: 'Interview Prep',
    desc: 'Flashcards · Quest · Typing',
    icon: Brain,
    badge: 'AI',
  },
  {
    to: '/leaderboard',
    title: 'Leaderboard',
    desc: 'Climb ranks · earn points',
    icon: Medal,
  },
  {
    to: '/achievements',
    title: 'Achievements',
    desc: 'Unlock every badge',
    icon: Award,
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
    { icon: CheckCircle2, label: 'Completed', value: `${stats.completed}/${stats.totalTasks}` },
    { icon: Target, label: 'Pending', value: stats.pendingTasks },
    { icon: Trophy, label: 'Points', value: stats.points },
    { icon: TrendingUp, label: 'Avg score', value: `${stats.avgScore}%` },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Brand glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl dark:bg-brand-600/15" />
        <div className="animate-blob absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl [animation-delay:5s] dark:bg-brand-500/10" />
        <div className="animate-blob absolute bottom-16 left-0 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl [animation-delay:9s] dark:bg-brand-700/10" />
        <div className="animate-blob absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-slate-300/20 blur-3xl [animation-delay:12s] dark:bg-white/5" />
      </div>

      {/* Header */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl border border-slate-300 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-7 dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-14 w-14 rounded-full border-2 border-slate-200 object-cover dark:border-white/20" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-black text-white dark:bg-white dark:text-slate-900">
                {user?.name?.[0]}
              </div>
            )}
            <div>
              <p className="text-xs font-bold tracking-widest text-brand-600 uppercase dark:text-brand-400">
                {greeting()}, {user?.name?.split(' ')[0]}!
              </p>
              <h1 className="font-display mt-0.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Welcome back
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                What would you like to practice today?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              <Flame size={13} className="text-brand-500" /> {stats.streak?.current || 0}d
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-brand-500/25">
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
              <div key={s.label} className="flex items-center gap-2.5 rounded-2xl border border-slate-300 bg-slate-50/80 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/25">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg leading-tight font-black text-slate-900 dark:text-white">{s.value}</p>
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
              className="group animate-fade-up relative overflow-hidden rounded-2xl border border-slate-300 bg-white/90 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10 sm:p-5 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-500/40"
            >
              <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-500/20" />
              <div className="relative flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition group-hover:scale-110 group-hover:-rotate-3">
                  <Icon size={20} />
                </div>
                {a.badge && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black tracking-wider text-white uppercase dark:bg-white dark:text-slate-900">
                    {a.badge}
                  </span>
                )}
              </div>
              <div className="relative mt-3">
                <h3 className="text-sm font-extrabold text-slate-900 sm:text-base dark:text-white">{a.title}</h3>
                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block dark:text-slate-400">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Streak + badges */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="card flex items-center justify-between !p-4 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg', streakActive ? 'animate-wiggle bg-brand-500 shadow-brand-500/40' : 'bg-slate-300 dark:bg-white/10')}>
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
              className="h-full rounded-full bg-brand-500 transition-all duration-1000"
              style={{ width: `${streakPct}%` }}
            />
          </div>
        </div>

        <div className="card flex items-center justify-between !p-4 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/40">
              <Star size={22} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">{unlocked}/{stats.achievements.length} badges</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Achievements unlocked</p>
            </div>
          </div>
          <Link to="/achievements" className="text-sm font-bold text-brand-600 dark:text-brand-400">
            View
          </Link>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
            <GraduationCap size={18} className="text-brand-500" /> Recommended for you
          </h2>
          <Link to="/practicals" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {stats.recommended.length === 0 ? (
          <div className="card py-10 text-center dark:bg-white/5">
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
        <h2 className="font-display mb-3 text-sm font-extrabold text-slate-900 dark:text-white">Progress by category</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.categoryProgress
            .filter((c) => c.total > 0)
            .map((c) => (
              <div key={c.category.id} className="card !p-4 dark:bg-white/5">
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
                    className="h-full rounded-full bg-brand-500 transition-all duration-1000"
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent activity + achievements */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-3 text-sm font-extrabold text-slate-900 dark:text-white">Recent activity</h2>
          <div className="space-y-2.5">
            {stats.recentActivity.length === 0 && (
              <div className="card py-10 text-center dark:bg-white/5">
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
              <Link key={a.id} to={`/history/${a.id}`} className="card flex items-center gap-3 !p-3.5 transition hover:border-brand-200 dark:bg-white/5 dark:hover:border-brand-500/40">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md', a.passed ? 'bg-slate-900 shadow-slate-900/25 dark:bg-white dark:text-slate-900' : 'bg-brand-500 shadow-brand-500/25')}>
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
            <h2 className="font-display text-sm font-extrabold text-slate-900 dark:text-white">Recent achievements</h2>
            <Link to="/achievements" className="text-xs font-semibold text-brand-600 dark:text-brand-400">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {stats.achievements.map((a) => (
              <div key={a.code} className={cn('card flex items-center gap-3 !p-3.5 dark:bg-white/5', !a.unlocked && 'opacity-40 grayscale')}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.name}</p>
                  <p className={cn('text-[11px]', a.unlocked ? 'font-semibold text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400')}>
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
