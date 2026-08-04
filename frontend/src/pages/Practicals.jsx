import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, Lightbulb } from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';
import TaskCard from '../components/TaskCard';
import SuggestTaskModal from '../components/SuggestTaskModal';
import { cn } from '../lib/format';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function Practicals() {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('');
  const [diff, setDiff] = useState('');
  const [q, setQ] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat) params.set('category', cat);
      if (diff) params.set('difficulty', diff);
      if (q.trim()) params.set('q', q.trim());
      const [catData, taskData] = await Promise.all([
        api('/categories'),
        api(`/tasks?${params.toString()}`),
      ]);
      setCategories(catData);
      setTasks(taskData);
    } finally {
      setLoading(false);
    }
  }, [cat, diff, q]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Linux practicals</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Real IT support tickets. Each one spins up an isolated Linux container.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tasks…"
              className="input !w-64 !pl-9"
            />
          </div>
          <button onClick={() => setSuggestOpen(true)} className="btn-ghost whitespace-nowrap">
            <Lightbulb size={16} /> Suggest
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCat('')}
          className={cn(
            'badge !px-3 !py-1.5 transition',
            !cat
              ? 'bg-brand-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat((v) => (v === c.id ? '' : c.id))}
            className={cn(
              'badge !px-3 !py-1.5 transition',
              cat === c.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            )}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Difficulty */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={15} className="text-slate-400" />
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDiff((v) => (v === d ? '' : d))}
            className={cn(
              'badge !px-3 !py-1.5 capitalize transition',
              diff === d
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <FullPageSpinner label="Loading practicals…" />
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl">🔎</div>
            <p className="mt-4 font-semibold text-slate-500 dark:text-slate-400">No practicals match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

      {suggestOpen && <SuggestTaskModal onClose={() => setSuggestOpen(false)} />}
    </div>
  );
}
