import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

const RULE_TYPES = [
  { value: 'file_exists', fields: ['path'] },
  { value: 'dir_exists', fields: ['path'] },
  { value: 'user_exists', fields: ['username'] },
  { value: 'group_exists', fields: ['group'] },
  { value: 'package_installed', fields: ['package'] },
  { value: 'service_active', fields: ['service'] },
  { value: 'service_enabled', fields: ['service'] },
  { value: 'port_open', fields: ['port'] },
  { value: 'file_contains', fields: ['path', 'needle'] },
  { value: 'file_permissions', fields: ['path', 'expected'] },
  { value: 'file_owner', fields: ['path', 'expected'] },
  { value: 'command_contains', fields: ['command'] },
];

const FIELD_LABELS = {
  path: 'Path',
  username: 'Username',
  group: 'Group',
  package: 'Package',
  service: 'Service',
  port: 'Port',
  needle: 'Expected text',
  expected: 'Expected value',
  command: 'Command',
};

function listToState(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
  if (typeof raw === 'string') return raw.split('\n').filter((s) => s.trim());
  return [];
}

function rulesToState(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    type: r.type || 'file_exists',
    label: r.label || '',
    params: { ...(r.params || {}) },
  }));
}

function ListEditor({ value, onChange, placeholder }) {
  const update = (i, v) => onChange(value.map((x, j) => (j === i ? v : x)));
  const remove = (i) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            className="input flex-1"
            placeholder={placeholder}
          />
          <button type="button" onClick={() => remove(i)} className="icon-btn text-red-500">
            <X size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        <Plus size={14} /> Add item
      </button>
    </div>
  );
}

const EMPTY = {
  title: '',
  category: '',
  difficulty: 'beginner',
  estimatedMinutes: 15,
  points: 10,
  scenario: '',
  objectives: [],
  requirements: [],
  instructions: [],
  expectedOutcome: '',
  learningOutcomes: [],
  hints: [],
  solution: '',
  validationRules: [],
};

export default function TaskEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/categories').then(setCategories);
  }, []);

  useEffect(() => {
    const draft = location.state?.draft;
    if (draft && !isEdit) {
      setForm({
        ...EMPTY,
        ...draft,
        objectives: listToState(draft.objectives),
        requirements: listToState(draft.requirements),
        instructions: listToState(draft.instructions),
        learningOutcomes: listToState(draft.learningOutcomes),
        hints: listToState(draft.hints),
        validationRules: rulesToState(draft.validationRules),
      });
      return;
    }
    if (!id) return;
    api(`/tasks/${id}`)
      .then((t) => {
        setForm({
          ...EMPTY,
          ...t,
          category: t.category?._id || t.category?.id || '',
          objectives: listToState(t.objectives),
          requirements: listToState(t.requirements),
          instructions: listToState(t.instructions),
          learningOutcomes: listToState(t.learningOutcomes),
          hints: listToState(t.hints),
          validationRules: rulesToState(t.validationRules),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setRule = (i, patch) =>
    setForm((f) => ({
      ...f,
      validationRules: f.validationRules.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    }));

  const setRuleParam = (i, key, v) =>
    setRule(i, { params: { ...form.validationRules[i].params, [key]: v } });

  const addRule = () =>
    setForm((f) => ({
      ...f,
      validationRules: [...f.validationRules, { type: 'file_exists', label: '', params: {} }],
    }));

  const removeRule = (i) =>
    setForm((f) => ({
      ...f,
      validationRules: f.validationRules.filter((_, j) => j !== i),
    }));

  const save = async () => {
    setSaving(true);
    setError('');
    const body = {
      title: form.title.trim(),
      category: form.category,
      difficulty: form.difficulty,
      estimatedMinutes: Number(form.estimatedMinutes),
      points: Number(form.points),
      scenario: form.scenario.trim(),
      objectives: form.objectives.map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.map((s) => s.trim()).filter(Boolean),
      instructions: form.instructions.map((s) => s.trim()).filter(Boolean),
      expectedOutcome: form.expectedOutcome.trim(),
      learningOutcomes: form.learningOutcomes.map((s) => s.trim()).filter(Boolean),
      hints: form.hints.map((s) => s.trim()).filter(Boolean),
      solution: form.solution.trim(),
      validationRules: form.validationRules
        .filter((r) => r.label.trim())
        .map((r) => {
          const meta = RULE_TYPES.find((x) => x.value === r.type) || { fields: [] };
          const params = {};
          for (const f of meta.fields) {
            const v = r.params[f];
            params[f] = f === 'port' ? Number(v) : typeof v === 'string' ? v.trim() : v;
          }
          return { type: r.type, label: r.label.trim(), params };
        }),
    };
    try {
      if (isEdit) {
        await api(`/tasks/${id}`, { method: 'PUT', body });
        navigate('/admin/tasks');
      } else {
        const created = await api('/tasks', { method: 'POST', body });
        navigate(`/admin/tasks/${created.id}/edit`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FullPageSpinner label="Loading task…" />;

  const input = 'input';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/admin/tasks" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-500">
        <ArrowLeft size={15} /> Tasks
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{isEdit ? 'Edit task' : 'New task'}</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">Draft tasks are invisible to students until published.</p>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10">{error}</p>}

      <div className="mt-6 space-y-6">
        <section className="card space-y-4">
          <h2 className="text-lg font-extrabold">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="label">Title</span>
              <input className={input} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Troubleshoot a broken SSH service" />
            </label>
            <label className="block">
              <span className="label">Category</span>
              <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Difficulty</span>
              <select className={input} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Estimated minutes</span>
              <input type="number" min="1" className={input} value={form.estimatedMinutes} onChange={(e) => set('estimatedMinutes', e.target.value)} />
            </label>
            <label className="block">
              <span className="label">Points</span>
              <input type="number" min="0" className={input} value={form.points} onChange={(e) => set('points', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-extrabold">Scenario</h2>
          <label className="block">
            <span className="label">Story / ticket</span>
            <textarea rows={4} className={input} value={form.scenario} onChange={(e) => set('scenario', e.target.value)} placeholder="A support ticket describing the real-world problem…" />
          </label>
          <div>
            <span className="label">Objectives</span>
            <ListEditor value={form.objectives} onChange={(v) => set('objectives', v)} placeholder="Restore SSH access" />
          </div>
          <div>
            <span className="label">Requirements (allowed tools / setup)</span>
            <ListEditor value={form.requirements} onChange={(v) => set('requirements', v)} placeholder="User student is already created" />
          </div>
          <div>
            <span className="label">Instructions</span>
            <ListEditor value={form.instructions} onChange={(v) => set('instructions', v)} placeholder="Connect over SSH and inspect the journal…" />
          </div>
          <label className="block">
            <span className="label">Expected outcome</span>
            <textarea rows={2} className={input} value={form.expectedOutcome} onChange={(e) => set('expectedOutcome', e.target.value)} placeholder="What a correct fix looks like" />
          </label>
          <div>
            <span className="label">Learning outcomes</span>
            <ListEditor value={form.learningOutcomes} onChange={(v) => set('learningOutcomes', v)} placeholder="Reading systemd journal" />
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-extrabold">Hints & solution</h2>
          <div>
            <span className="label">Hints (3, escalating — first is smallest)</span>
            <ListEditor value={form.hints} onChange={(v) => set('hints', v)} placeholder="Hint 1" />
          </div>
          <label className="block">
            <span className="label">Reference solution (shown after a successful attempt)</span>
            <textarea rows={5} className={input + ' font-mono'} value={form.solution} onChange={(e) => set('solution', e.target.value)} placeholder="systemctl status ssh&#10;journalctl -u ssh -n 50&#10;…" />
          </label>
        </section>

        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Validation rules</h2>
            <button type="button" onClick={addRule} className="btn-secondary !py-1.5">
              <Plus size={14} /> Add rule
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Each rule is checked inside the lab container when the user submits. Every rule needs a label; leave rules empty to delete.
          </p>
          {form.validationRules.length === 0 && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/5">No rules yet — add at least one so attempts can be scored.</p>
          )}
          {form.validationRules.map((rule, i) => {
            const meta = RULE_TYPES.find((x) => x.value === rule.type) || { fields: [] };
            return (
              <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <select className={input + ' sm:w-64'} value={rule.type} onChange={(e) => setRule(i, { type: e.target.value })}>
                    {RULE_TYPES.map((r) => (
                      <option key={r.value} value={r.value}>{r.value.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <input
                    className={input + ' flex-1'}
                    value={rule.label}
                    onChange={(e) => setRule(i, { label: e.target.value })}
                    placeholder="Rule label shown to students"
                  />
                  <button type="button" onClick={() => removeRule(i)} className="icon-btn text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                {meta.fields.length > 0 && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {meta.fields.map((f) => (
                      <input
                        key={f}
                        className={input}
                        value={rule.params[f] ?? ''}
                        onChange={(e) => setRuleParam(i, f, e.target.value)}
                        placeholder={FIELD_LABELS[f]}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
          <Link to="/admin/tasks" className="btn-ghost">Cancel</Link>
          <button onClick={save} disabled={saving || !form.title.trim()} className="btn-primary ml-auto disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
}
