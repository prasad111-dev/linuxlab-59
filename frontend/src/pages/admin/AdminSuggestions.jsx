import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { difficultyMeta, timeAgo, cn } from '../../lib/format';

const STATUS_META = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
};

export default function AdminSuggestions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api('/admin/suggestions')
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = async (s, next) => {
    setSavingId(s.id);
    setError('');
    try {
      const updated = await api(`/admin/suggestions/${s.id}`, { method: 'PATCH', body: { status: next } });
      setItems((xs) => xs.map((x) => (x.id === s.id ? { ...x, status: updated.status, adminNote: updated.adminNote } : x)));
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = status === 'all' ? items : items.filter((s) => s.status === status);
  const countFor = (st) => (st === 'all' ? items.length : items.filter((s) => s.status === st).length);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Suggestions</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Task scenarios pitched by students — approve or reject them.
          </p>
        </div>
        <Link to="/admin" className="btn-ghost">Dashboard</Link>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">{error}</p>}

      <div className="mt-6 flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'badge !px-3 !py-1.5 transition',
              status === s
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            )}
          >
            {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)} · {countFor(s)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading && <FullPageSpinner label="Loading suggestions…" />}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">No suggestions here yet.</div>
        )}
        {filtered.map((s) => {
          const st = STATUS_META[s.status] || STATUS_META.pending;
          const d = s.difficulty ? difficultyMeta(s.difficulty) : null;
          const busy = savingId === s.id;
          return (
            <div key={s.id} className="card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-bold">{s.title}</span>
                <span className={cn('badge shrink-0', st.cls)}>{st.label}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{s.scenario}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{s.user?.name || 'Unknown user'}</span>
                {s.user?.email && <span>{s.user.email}</span>}
                {s.category && (
                  <span className="badge">
                    {s.category.icon} {s.category.name}
                  </span>
                )}
                {d && <span className={cn('badge', d.cls)}>{d.label}</span>}
                <span>{timeAgo(s.createdAt)}</span>
              </div>
              {s.adminNote && (
                <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  Note: {s.adminNote}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                {s.status !== 'approved' && (
                  <button
                    onClick={() => update(s, 'approved')}
                    disabled={busy}
                    className="btn-secondary !py-1.5 text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                {s.status !== 'rejected' && (
                  <button
                    onClick={() => update(s, 'rejected')}
                    disabled={busy}
                    className="btn-secondary !py-1.5 text-red-500 disabled:opacity-50"
                  >
                    <X size={14} /> Reject
                  </button>
                )}
                {s.status !== 'pending' && (
                  <button
                    onClick={() => update(s, 'pending')}
                    disabled={busy}
                    title="Move back to pending"
                    className="icon-btn text-slate-400"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
