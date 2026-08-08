import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, RotateCcw, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { cn } from '../../lib/format';

const EMPTY = { prompt: '', topic: 'General', model: '', isActive: true };

export default function AdminInterviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [topicFilter, setTopicFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (topicFilter) params.set('topic', topicFilter);
    if (showInactive) params.set('includeInactive', 'true');
    api(`/interview/bank?${params.toString()}`)
      .then((res) => {
        setQuestions(res.questions || []);
        setTopics(res.topics || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [topicFilter, showInactive]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (x) => x.prompt.toLowerCase().includes(q) || x.topic.toLowerCase().includes(q)
    );
  }, [questions, search]);

  const save = async () => {
    if (!editing) return;
    if (!editing.prompt.trim()) return;
    try {
      if (editing.id) {
        await api(`/interview/bank/${editing.id}`, { method: 'PUT', body: editing });
      } else {
        await api('/interview/bank', { method: 'POST', body: editing });
      }
      setEditing(null);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const remove = async (q) => {
    if (!confirm(`Delete "${q.prompt}"? Built-in questions are disabled instead.`)) return;
    try {
      await api(`/interview/bank/${q.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleActive = async (q) => {
    try {
      await api(`/interview/bank/${q.id}`, {
        method: 'PUT',
        body: { isActive: !q.isActive },
      });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Interview question bank</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            The “Top 145 Interview Questions” drill — free-text answers are graded by the AI interviewer.
          </p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary">
          <Plus size={16} /> New question
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTopicFilter('')}
          className={cn('rounded-full px-3 py-1 text-xs font-bold', topicFilter === '' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400')}
        >
          All topics
        </button>
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopicFilter(t)}
            className={cn('rounded-full px-3 py-1 text-xs font-bold', topicFilter === t ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400')}
          >
            {t}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
      </div>

      <div className="relative mt-4 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts or topics…"
        />
      </div>

      <div className="mt-4">
        {loading && <FullPageSpinner label="Loading question bank…" />}
        {!loading && filtered.length === 0 && (
          <div className="card py-16 text-center text-slate-500 dark:text-slate-400">
            No questions found.
          </div>
        )}
        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id} className={cn('card flex items-start gap-3 !p-4', !q.isActive && 'opacity-60')}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug">{q.prompt}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">{q.topic}</span>
                  {q.isBuiltIn ? (
                    <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">built-in</span>
                  ) : (
                    <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">custom</span>
                  )}
                  {!q.isActive && <span className="badge bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">disabled</span>}
                </div>
                {q.model && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{q.model}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => toggleActive(q)} className="icon-btn text-slate-400 hover:text-amber-500" title={q.isActive ? 'Disable' : 'Enable'}>
                  {q.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => setEditing({ ...q })} className="icon-btn text-brand-500">
                  <Pencil size={18} />
                </button>
                <button onClick={() => remove(q)} className="icon-btn text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="card w-full max-w-2xl space-y-4 !rounded-2xl">
            <div className="flex items-center gap-2">
              {editing.isBuiltIn ? <RotateCcw size={18} className="text-emerald-500" /> : <Plus size={18} className="text-brand-500" />}
              <h2 className="text-lg font-extrabold">{editing.id ? 'Edit question' : 'New question'}</h2>
              {editing.isBuiltIn && (
                <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">built-in — edits apply from now on</span>
              )}
            </div>
            <label className="block">
              <span className="label">Question</span>
              <textarea
                className="input min-h-[72px] resize-y"
                value={editing.prompt}
                onChange={(e) => setEditing({ ...editing, prompt: e.target.value })}
                placeholder="How to check kernel routing information?"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Topic</span>
                <input
                  className="input"
                  list="bank-topics"
                  value={editing.topic}
                  onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                  placeholder="Network"
                />
                <datalist id="bank-topics">
                  {topics.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
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
            <label className="block">
              <span className="label">Model answer / grading rubric (optional — shown to admins, guides the AI grader)</span>
              <textarea
                className="input min-h-[96px] resize-y"
                value={editing.model}
                onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                placeholder="ip route show (modern), route -n or netstat -rn (legacy), ip rule for policy routing. /proc/net/route holds the raw table."
              />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              <button onClick={save} disabled={!editing.prompt.trim()} className="btn-primary disabled:opacity-50">
                {editing.id ? 'Save' : 'Create'}
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
