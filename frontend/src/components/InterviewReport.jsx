import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, RotateCcw, ArrowLeft, XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/format';
import { Spinner } from './Spinner';

export function renderMarkdownish(text) {
  const lines = String(text || '').split('\n');
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('## ')) {
      out.push(<h2 key={out.length} className="mt-5 mb-1 text-lg font-extrabold">{t.slice(3)}</h2>);
    } else if (t.startsWith('### ')) {
      out.push(<h3 key={out.length} className="mt-4 mb-1 text-base font-bold">{t.slice(4)}</h3>);
    } else if (t.startsWith('- ') || t.startsWith('* ')) {
      out.push(
        <p key={out.length} className="flex gap-2 py-0.5 text-sm text-slate-600 dark:text-slate-300">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
          <span>{t.slice(2)}</span>
        </p>
      );
    } else {
      out.push(<p key={out.length} className="py-0.5 text-sm text-slate-600 dark:text-slate-300">{t}</p>);
    }
  }
  return out;
}

export function ModeMeta({ mode }) {
  const meta = {
    flashcard: { label: 'Flashcard Duel', cls: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400' },
    quest: { label: 'Quest Mode', cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
    typing: { label: 'Typing Shooter', cls: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
  }[mode];
  return <span className={cn('badge', meta.cls)}>{meta.label}</span>;
}

export default function InterviewReport({ session, onRetry }) {
  const [open, setOpen] = useState(false);
  const correct = session.answers.filter((a) => a.correct).length;
  const total = session.answers.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up">
        <div className="flex items-center justify-between">
          <ModeMeta mode={session.mode} />
          <span className="text-xs text-slate-400">{new Date(session.createdAt).toLocaleString()}</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
          Session complete <span className="gradient-text">🎉</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your AI analysis is ready below — it is saved to your interview history.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-black">{correct}/{total}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Correct</p>
          </div>
          <div className="card text-center">
            <p className={cn('text-2xl font-black', session.accuracy >= 70 ? 'text-emerald-500' : session.accuracy >= 50 ? 'text-amber-500' : 'text-red-500')}>
              {session.accuracy}%
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Accuracy</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-black">{session.wpm || '—'}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">WPM</p>
          </div>
        </div>

        <div className="card mt-5 !p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" />
            <h2 className="text-base font-extrabold">AI coach analysis</h2>
          </div>
          <div className="mt-3 space-y-1">
            {session.aiReport ? renderMarkdownish(session.aiReport) : <Spinner size={20} className="text-indigo-500" />}
          </div>
        </div>

        {session.weakTopics.length > 0 && (
          <div className="card mt-4">
            <h3 className="text-sm font-bold">Topics flagged for review</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {session.weakTopics.map((t) => (
                <span key={t} className="badge bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">{t}</span>
              ))}
            </div>
          </div>
        )}

        <div className="card mt-4">
          <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-sm font-bold">
            Review every answer ({total})
            <span className="text-slate-400">{open ? '▲' : '▼'}</span>
          </button>
          {open && (
            <div className="mt-4 space-y-3">
              {session.answers.map((a, i) => (
                <div key={i} className={cn('rounded-xl border p-3.5 text-sm', a.correct ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5' : 'border-red-200 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/5')}>
                  <div className="flex items-start gap-2">
                    {a.correct ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{a.prompt}</p>
                      {a.topic && <p className="mt-0.5 text-xs text-slate-400">{a.topic}</p>}
                      <p className="mt-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <span className="text-emerald-600 dark:text-emerald-400">Correct:</span> {a.answer}
                      </p>
                      {!a.correct && (
                        <p className="mt-0.5 font-mono text-xs text-red-500">
                          Yours: {a.userAnswer || '(blank)'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {onRetry && (
            <button onClick={onRetry} className="btn-primary">
              <RotateCcw size={16} /> Try again
            </button>
          )}
          <Link to="/interview" className="btn-ghost">
            <ArrowLeft size={16} /> Back to interview hub
          </Link>
        </div>
      </div>
    </div>
  );
}
