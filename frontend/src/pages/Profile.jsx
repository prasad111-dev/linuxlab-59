import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Zap,
  Target,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';
import { cn, timeAgo } from '../lib/format';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [interviewSessions, setInterviewSessions] = useState(null);

  useEffect(() => {
    api('/users/me/stats')
      .then((p) => {
        setProfile(p);
        setName(p.user?.name || name);
      })
      .catch(() => setProfile(null));
    api('/interview/sessions')
      .then((s) => setInterviewSessions(Array.isArray(s) ? s : []))
      .catch(() => setInterviewSessions([]));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api('/users/me', { method: 'PATCH', body: { name } });
      setProfile((p) => ({ ...p, user: { ...p.user, ...updated } }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <FullPageSpinner label="Loading profile…" />;

  const u = profile.user || {};
  const streak = profile.streak?.current ?? u.streak?.current ?? 0;
  const points = profile.points ?? u.points ?? 0;
  const rank = profile.rank ?? '—';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Profile</h1>

      <div className="mt-6 card flex flex-col items-center gap-6 sm:flex-row">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-3xl font-black text-white shadow-lg">
          {u.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xl font-extrabold">{u.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{u.email}</p>
          <div className="mt-2 flex justify-center gap-3 sm:justify-start">
            <span className="badge bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Flame size={12} className="mr-1 inline" /> {streak} day streak
            </span>
            <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Zap size={12} className="mr-1 inline" /> {points} pts
            </span>
            <span className="badge bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              <TrendingUp size={12} className="mr-1 inline" /> rank #{rank}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <h2 className="text-lg font-extrabold">Display name</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input flex-1"
            placeholder="Your name"
          />
          <button onClick={save} disabled={saving || name.trim().length < 2} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {saved && <p className="mt-2 text-sm text-emerald-600">Saved!</p>}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Completed', value: profile.completed ?? 0, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Pending', value: profile.pendingTasks ?? 0, icon: Target, color: 'text-amber-500' },
          { label: 'Avg score', value: profile.avgScore != null ? `${profile.avgScore}%` : '—', icon: TrendingUp, color: 'text-brand-500' },
          { label: 'Rank', value: rank, icon: Trophy, color: 'text-amber-500' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card text-center">
              <Icon size={20} className={cn('mx-auto', s.color)} />
              <p className="mt-2 text-2xl font-black">{s.value}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 card flex flex-wrap items-center gap-4">
        <Sparkles size={20} className="text-brand-500" />
        <div className="flex-1">
          <p className="font-bold">Speed bonus active</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Finish a task under its suggested time to earn +20% points.</p>
        </div>
        <Link to="/history" className="btn-secondary">View history</Link>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Brain size={18} className="text-brand-500" /> Interview drills
          </h2>
          <Link to="/interview" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
            Open hub <ChevronRight size={15} />
          </Link>
        </div>
        {interviewSessions === null ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : interviewSessions.length === 0 ? (
          <div className="card flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="text-sm font-semibold">No interview drills yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try a Flashcard Duel or Quest Mode to get an AI analysis.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {interviewSessions.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                to={`/interview/session/${s.id}`}
                className="card flex items-center gap-3 !p-3.5 transition hover:border-brand-300 dark:hover:border-brand-500/40"
              >
                <span className="text-xl">{s.mode === 'flashcard' ? '🧠' : s.mode === 'quest' ? '🗺️' : '⌨️'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold capitalize">
                    {s.mode === 'flashcard' ? 'Flashcard Duel' : s.mode === 'quest' ? 'Quest Mode' : 'Typing Shooter'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {s.score}/{s.maxScore} · {s.accuracy}% · {timeAgo(s.createdAt)}
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
