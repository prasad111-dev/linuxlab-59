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
    chip: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  },
  {
    to: '/interview',
    title: 'Interview Prep',
    desc: 'Flashcards · Quest · Typing',
    icon: Brain,
    chip: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    badge: 'AI',
  },
  {
    to: '/leaderboard',
    title: 'Leaderboard',
    desc: 'Climb ranks · earn points',
    icon: Medal,
    chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  },
  {
    to: '/achievements',
    title: 'Achievements',
    desc: 'Unlock every badge',
    icon: Award,
    chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
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
    { icon: CheckCircle2, label: 'Completed', value: `${stats.completed}/${stats.totalTasks}`, chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    { icon: Target, label: 'Pending', value: stats.pendingTasks, chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
    { icon: Trophy, label: 'Points', value: stats.points, chip: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    { icon: TrendingUp, label: 'Avg score', value: `${stats.avgScore}%`, chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400' },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Soft background for glass cards */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/20" />
        <div className="animate-blob absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl [animation-delay:5s] dark:bg-violet-600/20" />
        <div className="animate-blob absolute bottom-10 left-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl [animation-delay:9s] dark:bg-emerald-600/10" />
        <div className="animate-blob absolute right-1/3 -bottom-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl [animation-delay:12s] dark:bg-amber-600/10" />
      </div>

      {/* Header */}
      <section className="animate-fade-up relative overflow-hidden rounded-2xl glass p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img src={user.picture} alt="" className="h-14 w-14 rounded-full border-2 border-indigo-100 dark:border-indigo-500/30" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-black text-white">
                {user?.name?.[0]}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                {greeting()}, {user?.name?.split(' ')[0]}!
              </p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Welcome back
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                What would you like to practice today?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <Flame size={13} className="text-amber-500" /> {stats.streak?.current || 0}d
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <Zap size={13} className="text-indigo-500" /> {stats.points} pts
            </span>
            {stats.runningAttempt && (
              <button
                onClick={resume}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                <Play size={13} /> Resume
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsRow.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              style={{ animationDelay: `${i * 70}ms` }}
              className="glass animate-fade-up flex items-center gap-3 !p-4"
            >
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', s.chip)}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              style={{ animationDelay: `${i * 70}ms` }}
              className="glass group animate-fade-up flex items-center gap-3 !p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-500/40"
            >
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-110', a.chip)}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{a.title}</h3>
                  {a.badge && (
                    <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {a.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Streak + badges */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="glass flex items-center justify-between !p-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', streakActive ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' : 'bg-slate-100 text-slate-400 dark:bg-slate-800')}>
              <Flame size={22} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">{stats.streak?.current || 0} day streak</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {streakActive ? 'Keep the momentum!' : 'Complete a practical to start a streak'}
              </p>
            </div>
          </div>
          <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-1000"
              style={{ width: `${streakPct}%` }}
            />
          </div>
        </div>

        <div className="glass flex items-center justify-between !p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Star size={22} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">{unlocked}/{stats.achievements.length} badges</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Achievements unlocked</p>
            </div>
          </div>
          <Link to="/achievements" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            View
          </Link>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
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
        <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Progress by category</h2>
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
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
          <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Recent activity</h2>
          <div className="space-y-2.5">
            {stats.recentActivity.length === 0 && (
              <div className="glass py-10 text-center">
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
              <Link key={a.id} to={`/history/${a.id}`} className="glass flex items-center gap-3 !p-3.5 transition hover:border-indigo-300 dark:hover:border-indigo-500/40">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', a.passed ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400')}>
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
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent achievements</h2>
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
