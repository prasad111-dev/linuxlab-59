import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';
import { cn } from '../lib/format';

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/achievements')
      .then((data) => setAchievements(data.achievements || []))
      .finally(() => setLoading(false));
  }, []);

  const unlockedMap = new Map((user?.achievements || []).map((a) => [a.code, a]));
  const achieved = achievements.filter((a) => a.unlocked);

  const groups = [
    { label: 'Task master', items: achievements.filter((a) => a.code.includes('task')) },
    { label: 'Perfectionist', items: achievements.filter((a) => ['perfect_score', 'fast_learner'].includes(a.code)) },
    { label: 'Streaks & habits', items: achievements.filter((a) => a.code.startsWith('streak')) },
    { label: 'Milestones', items: achievements.filter((a) => !a.code.includes('task') && !['perfect_score', 'fast_learner'].includes(a.code) && !a.code.startsWith('streak')) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Achievements</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        <Trophy size={14} className="mr-1 inline text-brand-500" />
        {achieved.length} of {achievements.length} unlocked
      </p>

      {loading && <FullPageSpinner label="Loading achievements…" />}
      {!loading && (
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{group.label}</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((a) => {
                  const has = a.unlocked;
                  const unlockMeta = unlockedMap.get(a.code);
                  return (
                    <div
                      key={a.code}
                      className={cn(
                        'card flex flex-col items-center py-6 text-center transition',
                        has ? 'border-brand-300 bg-gradient-to-br from-brand-50 to-brand-50 dark:border-brand-500/30 dark:from-brand-500/10 dark:to-brand-500/5' : 'opacity-60 grayscale'
                      )}
                    >
                      <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-3xl', has ? 'bg-white shadow dark:bg-white/10' : 'bg-slate-100 dark:bg-white/5')}>
                        {has ? a.icon : <Lock size={22} className="text-slate-400" />}
                      </div>
                      <p className="mt-3 text-sm font-bold">{a.name}</p>
                      <p className="mt-1 text-xs leading-snug text-slate-500 dark:text-slate-400">{a.description}</p>
                      <p className="mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">+{a.points} pts</p>
                      {has && unlockMeta?.unlockedAt && (
                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          {new Date(unlockMeta.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {achievements.length === 0 && (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">No achievements yet.</div>
          )}
        </div>
      )}

      <div className="mt-10 card flex flex-col items-center bg-gradient-to-br from-purple-500 to-fuchsia-600 text-center text-white sm:flex-row sm:text-left">
        <div className="flex-1">
          <h3 className="text-xl font-extrabold">Want to unlock them all?</h3>
          <p className="mt-1 text-sm opacity-90">Solve tasks cleanly, on the first try, without hints — and keep your streak alive.</p>
        </div>
        <Link to="/practicals" className="btn-white mt-4 sm:mt-0 sm:ml-6">Start practicing</Link>
      </div>
    </div>
  );
}
