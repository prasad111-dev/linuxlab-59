import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Trophy,
  Target,
  ListChecks,
  Lightbulb,
  GraduationCap,
  CheckCircle2,
  Play,
  Loader2,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';
import { difficultyMeta, cn } from '../lib/format';
import { MonitorPlay } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/tasks/${id}`, { auth: Boolean(user) })
      .then(setTask)
      .catch((e) => setError(e.message));
  }, [id, user]);

  const start = async () => {
    setStarting(true);
    setError('');
    try {
      const { attempt } = await api('/sessions/start', { method: 'POST', body: { taskId: id } });
      navigate(`/lab/${attempt.id}`);
    } catch (e) {
      setError(e.message);
      if (e.status === 401) navigate('/auth');
    } finally {
      setStarting(false);
    }
  };

  const preview = async () => {
    setError('');
    try {
      await api(`/tasks/${id}/killercoda`, { auth: Boolean(user) });
      navigate(`/preview/${id}`);
    } catch (e) {
      setError(e.status === 503 ? 'Free preview is not configured yet. Please try the graded lab instead.' : e.message);
    }
  };

  if (error && !task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <Link to="/practicals" className="btn-ghost mt-4">Back to practicals</Link>
      </div>
    );
  }
  if (!task) return <FullPageSpinner label="Loading practical…" />;

  const diff = difficultyMeta(task.difficulty);
  const cat = task.category;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/practicals" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-500">
        <ArrowLeft size={15} /> All practicals
      </Link>

      {/* Header */}
      <div className="mt-4 card relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: cat?.color || '#6366f1' }} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge" style={{ backgroundColor: `${cat?.color || '#6366f1'}18`, color: cat?.color || '#6366f1' }}>
            {cat?.icon} {cat?.name}
          </span>
          <span className={`badge ${diff.cls}`}>{diff.label}</span>
          {task.myBest?.score > 0 && (
            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              Best score: {task.myBest.score}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{task.title}</h1>
        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <Clock size={16} className="text-slate-400" /> {task.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <Trophy size={16} className="text-emerald-500" /> {task.points} points
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <Target size={16} className="text-indigo-500" /> {task.validationRules?.length || 0} checks
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={start} disabled={starting} className="btn-primary w-full !py-3 sm:w-auto">
            {starting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            {user ? (task.myBest?.status === 'running' ? 'Resume lab' : 'Start practical') : 'Login to start'}
          </button>
          <button onClick={preview} className="btn-ghost w-full !py-3 sm:w-auto">
            <MonitorPlay size={18} className="text-violet-500" /> Free preview
          </button>
        </div>
        {!user && (
          <p className="mt-2 text-xs text-slate-400">You'll need to sign in with Google to start a graded lab. Free preview works without login.</p>
        )}
      </div>

      {/* Scenario */}
      <div className="mt-6 card">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <span className="text-xl">🎫</span> Scenario
        </h2>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-200">{task.scenario}</p>
      </div>

      {/* Objectives */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Target size={20} className="text-indigo-500" /> Objectives
          </h2>
          <ul className="mt-3 space-y-2">
            {task.objectives?.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {o}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <ListChecks size={20} className="text-violet-500" /> Requirements
          </h2>
          <ul className="mt-3 space-y-2">
            {task.requirements?.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 card">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <GraduationCap size={20} className="text-amber-500" /> Instructions
        </h2>
        <ol className="mt-3 space-y-2">
          {task.instructions?.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      {/* Expected outcome + learning */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {task.expectedOutcome && (
          <div className="card">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <CheckCircle2 size={20} className="text-emerald-500" /> Expected outcome
            </h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{task.expectedOutcome}</p>
          </div>
        )}
        {task.learningOutcomes?.length > 0 && (
          <div className="card">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <Lightbulb size={20} className="text-amber-500" /> You'll learn
            </h2>
            <ul className="mt-3 space-y-2">
              {task.learningOutcomes.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400')} /> {l}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Hint preview */}
      {task.hints?.length > 0 && (
        <div className="mt-6 card border-dashed">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Lightbulb size={20} className="text-violet-500" /> Hints
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {task.hints.length} progressive hints are available in the lab. They get more detailed the more you ask. {user ? '' : <Lock size={12} className="inline" />}
          </p>
        </div>
      )}
    </div>
  );
}
