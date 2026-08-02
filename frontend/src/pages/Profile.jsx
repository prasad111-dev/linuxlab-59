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
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';
import { cn } from '../lib/format';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api('/users/me/stats')
      .then((p) => {
        setProfile(p);
        setName(p.user?.name || name);
      })
      .catch(() => setProfile(null));
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
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-black text-white shadow-lg">
          {u.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xl font-extrabold">{u.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{u.email}</p>
          <div className="mt-2 flex justify-center gap-3 sm:justify-start">
            <span className="badge bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <Flame size={12} className="mr-1 inline" /> {streak} day streak
            </span>
            <span className="badge bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Zap size={12} className="mr-1 inline" /> {points} pts
            </span>
            <span className="badge bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
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
          { label: 'Avg score', value: profile.avgScore != null ? `${profile.avgScore}%` : '—', icon: TrendingUp, color: 'text-sky-500' },
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
        <Sparkles size={20} className="text-violet-500" />
        <div className="flex-1">
          <p className="font-bold">Speed bonus active</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Finish a task under its suggested time to earn +20% points.</p>
        </div>
        <Link to="/history" className="btn-secondary">View history</Link>
      </div>
    </div>
  );
}
