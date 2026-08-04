import { Link } from 'react-router-dom';
import { Clock, Trophy, BookOpen } from 'lucide-react';
import { difficultyMeta } from '../lib/format';

export default function TaskCard({ task }) {
  const diff = difficultyMeta(task.difficulty);
  const cat = task.category;
  return (
    <Link
      to={`/practical/${task.id}`}
      className="card group relative flex flex-col gap-3 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-10 blur-2xl transition group-hover:opacity-20"
        style={{ backgroundColor: cat?.color || '#a855f7' }}
      />
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${cat?.color || '#a855f7'}20` }}
        >
          {cat?.icon || '📘'}
        </div>
        <span className={`badge ${diff.cls}`}>{diff.label}</span>
      </div>

      <div>
        <h3 className="line-clamp-2 text-base font-bold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400">
          {task.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {cat?.name || 'Linux'}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Clock size={13} /> {task.estimatedMinutes} min
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
          <Trophy size={13} /> {task.points} pts
        </span>
        {task.myBest?.score > 0 && (
          <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400">
            <BookOpen size={13} /> Best {task.myBest.score}
          </span>
        )}
      </div>
    </Link>
  );
}
