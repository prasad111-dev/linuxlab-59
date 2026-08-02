import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Eye,
  Lightbulb,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Terminal as TerminalIcon,
  Sparkles,
  Target,
} from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';
import { formatDuration, cn } from '../lib/format';

export default function AttemptReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/attempts/${id}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  const practiceAgain = async () => {
    if (!data?.task?.id) return;
    try {
      const { attempt } = await api(`/attempts/${data.task.id}/practice-again`, { method: 'POST' });
      navigate(`/lab/${attempt.id}`);
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <Link to="/history" className="btn-ghost mt-4">Back to history</Link>
      </div>
    );
  }
  if (!data) return <FullPageSpinner label="Loading review…" />;

  const { task, category } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-500">
        <ArrowLeft size={15} /> History
      </Link>

      <div className="mt-4 card relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: category?.color || '#6366f1' }} />
        <div className="flex flex-wrap items-center gap-2">
          {category && <span className="badge" style={{ backgroundColor: `${category.color}18`, color: category.color }}>{category.icon} {category.name}</span>}
          {data.status === 'evaluated' && (
            <span className={cn('badge', data.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400')}>
              {data.passed ? 'Passed' : 'Not passed'}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{task?.title || 'Attempt'}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-3xl font-black gradient-text">{data.score}<span className="text-lg text-slate-400">/{data.maxScore}</span></p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Score</p>
          </div>
          <div>
            <p className="text-2xl font-black">{formatDuration(data.timeTakenSeconds)}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Time taken</p>
          </div>
          <div>
            <p className="text-2xl font-black">{data.hintsUsed}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hints used</p>
          </div>
          <div className="ml-auto">
            <button onClick={practiceAgain} className="btn-primary">
              <RefreshCcw size={16} /> Practice again
            </button>
          </div>
        </div>
      </div>

      {task?.scenario && (
        <div className="mt-6 card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Target size={18} className="text-indigo-500" /> Scenario
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{task.scenario}</p>
        </div>
      )}

      {/* Mistakes */}
      <div className="mt-6 card">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          {data.mistakes.length === 0 ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-red-500" />}
          Evaluation {data.mistakes.length === 0 ? '— all checks passed' : `— ${data.mistakes.length} missed`}
        </h2>
        <div className="mt-3 space-y-2">
          {data.mistakes.length === 0 && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Perfect run. Everything was configured correctly. 🎉</p>
          )}
          {data.mistakes.map((m, i) => (
            <div key={i} className="rounded-xl bg-red-50 p-3 text-sm dark:bg-red-500/10">
              <p className="font-semibold text-red-700 dark:text-red-400">{m.label}</p>
              {m.actual && m.actual !== 'OK' && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Observed: {m.actual}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {data.feedback && (
        <div className="mt-6 card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Sparkles size={20} className="text-violet-500" /> AI feedback
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{data.feedback}</p>
        </div>
      )}

      {data.optimization && (
        <div className="mt-6 card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Sparkles size={20} className="text-amber-500" /> Improvements
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{data.optimization}</p>
        </div>
      )}

      {/* Solution */}
      {data.showSolution && data.correctSolution && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-slate-950">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Eye size={15} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-300">Reference solution</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-emerald-300">{data.correctSolution}</pre>
        </div>
      )}

      {/* Command history */}
      {data.commandHistory?.length > 0 && (
        <div className="mt-6 card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <TerminalIcon size={20} className="text-emerald-500" /> Commands executed
          </h2>
          <div className="mt-3 max-h-72 overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
            {data.commandHistory.map((c, i) => (
              <p key={i}>
                <span className="text-slate-600">{String(i + 1).padStart(2, '0')} </span>
                <span className="text-emerald-400">$</span> {c}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Hints used */}
      {data.hintsUsed > 0 && (
        <div className="mt-6 card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Lightbulb size={20} className="text-amber-500" /> Hints used
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {data.hintsUsed} hint{data.hintsUsed > 1 ? 's' : ''} used during this attempt. Fewer hints = more points in real interviews!
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Link to="/history" className="btn-ghost">Back to history</Link>
        <Link to="/practicals" className="btn-secondary">More practicals</Link>
      </div>
    </div>
  );
}
