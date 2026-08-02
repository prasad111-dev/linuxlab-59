import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { difficultyMeta, cn } from '../../lib/format';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [genPrompt, setGenPrompt] = useState('');
  const [genning, setGenning] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    api('/tasks')
      .then(setTasks)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = status === 'all' ? tasks : tasks.filter((t) => t.status === status);

  const togglePublish = async (t) => {
    const updated = await api(`/tasks/${t.id}/publish`, { method: 'POST' });
    setTasks((ts) => ts.map((x) => (x.id === t.id ? updated : x)));
  };

  const remove = async (t) => {
    if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    await api(`/tasks/${t.id}`, { method: 'DELETE' });
    setTasks((ts) => ts.filter((x) => x.id !== t.id));
  };

  const generate = async () => {
    setGenning(true);
    setNotice('');
    try {
      const { draft } = await api('/tasks/ai-generate', { method: 'POST', body: { prompt: genPrompt } });
      setGenerated(draft);
    } catch (e) {
      setNotice(e.message);
    } finally {
      setGenning(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tasks</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Create, edit, publish and generate practicals.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin" className="btn-ghost">Dashboard</Link>
          <Link to="/admin/tasks/new" className="btn-primary">
            <Plus size={16} /> New task
          </Link>
        </div>
      </div>

      <div className="mt-6 card">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Sparkles size={18} className="text-violet-500" /> Generate with AI
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Describe a scenario and Gemini drafts the full task — then fine-tune it in the editor.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            className="input flex-1"
            placeholder="e.g. A user can't SSH in after a failed upgrade — debug and fix it"
          />
          <button onClick={generate} disabled={genning || genPrompt.trim().length < 5} className="btn-secondary disabled:opacity-50">
            {genning ? 'Generating…' : 'Generate draft'}
          </button>
        </div>
        {notice && <p className="mt-2 text-sm text-red-500">{notice}</p>}
        {generated && (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={15} /> Draft ready — “{generated.title}”
            </p>
            <Link
              to="/admin/tasks/new"
              state={{ draft: generated }}
              className="mt-2 inline-block text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Open in editor →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {['all', 'published', 'draft'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'badge !px-3 !py-1.5 transition',
              status === s
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            )}
          >
            {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading && <FullPageSpinner label="Loading tasks…" />}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">No tasks here. Create one!</div>
        )}
        {filtered.map((t) => {
          const d = difficultyMeta(t.difficulty);
          return (
            <div key={t.id} className="card flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-bold">{t.title}</span>
                  <span className={d.cls + ' badge'}>{d.label}</span>
                  {t.status === 'published' ? (
                    <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">published</span>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">draft</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t.category?.icon} {t.category?.name} · ~{t.estimatedMinutes} min · {t.points} pts · {t.validationRules?.length} checks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(t)}
                  title={t.status === 'published' ? 'Unpublish' : 'Publish'}
                  className={cn(
                    'icon-btn',
                    t.status === 'published' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  )}
                >
                  {t.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <Link to={`/admin/tasks/${t.id}/edit`} className="icon-btn text-indigo-500">
                  <Pencil size={18} />
                </Link>
                <button onClick={() => remove(t)} className="icon-btn text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
