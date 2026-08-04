import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Palette } from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';

const COLORS = ['#ee0000', '#d60000', '#b30000', '#ff6666', '#ff9e9e', '#8e0000', '#6e0000', '#111827'];
const ICONS = ['🐧', '📘', '🔒', '🌐', '📦', '👥', '🧰', '🛠️', '⚙️', '🖧', '🗄️', '🔑', '📊', '☁️'];

const EMPTY = { name: '', description: '', icon: '🐧', color: '#ee0000', order: 0, isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    api('/categories')
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return;
    try {
      if (editing.id) {
        await api(`/categories/${editing.id}`, { method: 'PUT', body: editing });
      } else {
        await api('/categories', { method: 'POST', body: editing });
      }
      setEditing(null);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api(`/categories/${c.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Group practicals into topics students can browse.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary">
          <Plus size={16} /> New category
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <FullPageSpinner label="Loading categories…" />}
        {!loading && categories.length === 0 && <div className="py-16 text-center text-slate-500 dark:text-slate-400">No categories yet.</div>}
        {categories.map((c) => (
          <div key={c.id} className="card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${c.color}1a` }}>
              {c.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{c.name} {!c.isActive && <span className="badge bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">inactive</span>}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.description || 'No description'}</p>
            </div>
            <button onClick={() => setEditing({ ...c })} className="icon-btn text-brand-500">
              <Pencil size={18} />
            </button>
            <button onClick={() => remove(c)} className="icon-btn text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="card w-full max-w-lg space-y-4 !rounded-2xl">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-brand-500" />
              <h2 className="text-lg font-extrabold">{editing.id ? 'Edit category' : 'New category'}</h2>
            </div>
            <label className="block">
              <span className="label">Name</span>
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Networking" />
            </label>
            <label className="block">
              <span className="label">Description</span>
              <input className="input" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Icon</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditing({ ...editing, icon: ic })}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg ${editing.icon === ic ? 'bg-brand-100 ring-2 ring-brand-500 dark:bg-brand-500/20' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </label>
              <label className="block">
                <span className="label">Color</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEditing({ ...editing, color: col })}
                      className={`h-8 w-8 rounded-lg ${editing.color === col ? 'ring-2 ring-slate-900 ring-offset-2 dark:ring-white' : ''}`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Order</span>
                <input type="number" className="input" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
              </label>
              <label className="flex items-end gap-2 pb-1">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={Boolean(editing.isActive)}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              <button onClick={save} disabled={!editing.name.trim()} className="btn-primary disabled:opacity-50">
                <SaveIcon /> {editing.id ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link to="/admin" className="btn-ghost">Back to dashboard</Link>
      </div>
    </div>
  );
}

function SaveIcon() {
  return <Plus size={16} className="mr-1 inline" />;
}
