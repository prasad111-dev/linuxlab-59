import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Lightbulb, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { timeAgo, cn } from '../lib/format';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

const STATUS_META = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
};

export default function SuggestTaskModal({ onClose }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [mine, setMine] = useState([]);
  const [title, setTitle] = useState('');
  const [scenario, setScenario] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    api('/categories').then(setCategories).catch(() => {});
    if (user) api('/suggestions/mine').then(setMine).catch(() => {});
  }, [user]);

  const submit = async () => {
    setError('');
    if (!title.trim()) {
      setError('Give your scenario a short title.');
      return;
    }
    if (!scenario.trim()) {
      setError('Describe the task scenario.');
      return;
    }
    setSaving(true);
    try {
      await api('/suggestions', {
        method: 'POST',
        body: {
          title: title.trim(),
          scenario: scenario.trim(),
          category: category || null,
          difficulty,
        },
      });
      setTitle('');
      setScenario('');
      setCategory('');
      setDifficulty('');
      setDone(true);
      setMine(await api('/suggestions/mine'));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold">
              <Lightbulb size={22} className="text-amber-500" /> Suggest a task scenario
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Got a real-world Linux problem in mind? Pitch it — an admin will review it.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="icon-btn">
            <X size={18} />
          </button>
        </div>

        {!user ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center dark:bg-white/5">
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              You need to be logged in to suggest a scenario.
            </p>
            <Link to="/auth" onClick={onClose} className="btn-primary mt-4 inline-flex">
              Login with Google
            </Link>
          </div>
        ) : (
          <>
            {done && (
              <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                Thanks! Your suggestion is now pending review.
              </p>
            )}

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="label">Title</span>
                <input
                  className="input"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apache won't start after a config change"
                />
              </label>
              <label className="block">
                <span className="label">Scenario</span>
                <textarea
                  rows={4}
                  className="input"
                  value={scenario}
                  maxLength={5000}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Describe the IT support ticket / problem a student should debug…"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Category (optional)</span>
                  <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Any / not sure</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="label">Difficulty (optional)</span>
                  <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="">Not sure</option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d[0].toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button onClick={submit} disabled={saving} className="btn-primary w-full disabled:opacity-50">
                <Send size={16} /> {saving ? 'Submitting…' : 'Submit suggestion'}
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">My suggestions</h3>
              {mine.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">You haven't suggested anything yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {mine.map((s) => {
                    const st = STATUS_META[s.status] || STATUS_META.pending;
                    return (
                      <li key={s.id} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{s.title}</p>
                          <span className={cn('badge shrink-0', st.cls)}>{st.label}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{s.scenario}</p>
                        {s.adminNote && (
                          <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">Admin: {s.adminNote}</p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">{timeAgo(s.createdAt)}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
