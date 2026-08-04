import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lightbulb,
  BookOpen,
  Send,
  LogOut,
  Timer,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Eye,
  Loader2,
  PanelRight,
  ListChecks,
  MessageCircle,
  ExternalLink,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';
import { formatClock, formatDuration, cn } from '../lib/format';

export default function LabPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [task, setTask] = useState(null);
  const [status, setStatus] = useState('loading');
  const [panelOpen, setPanelOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [kcUrl, setKcUrl] = useState('');
  const [terminalOpened, setTerminalOpened] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api(`/sessions/${attemptId}`);
        setAttempt(data.attempt);
        setStatus(data.status);

        if (data.attempt?.task?.id) {
          const t = await api(`/tasks/${data.attempt.task.id}`);
          setTask(t);
          const kdata = await api(`/tasks/${data.attempt.task.id}/killercoda?attemptId=${attemptId}`);
          setKcUrl(kdata.embedUrl);
        }
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    })();
  }, [attemptId]);

  useEffect(() => {
    if (!task || !attempt) return;
    const tick = () => {
      const elapsed = (Date.now() - new Date(attempt.startedAt).getTime()) / 1000;
      setRemaining(Math.max(0, task.estimatedMinutes * 60 - elapsed));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [task, attempt]);

  useEffect(() => {
    if (status !== 'running') return;
    let cancelled = false;
    const iv = setInterval(async () => {
      try {
        const data = await api(`/sessions/${attemptId}`);
        if (data.status === 'evaluated' && !cancelled) {
          setStatus('evaluated');
          const full = await api(`/attempts/${attemptId}`);
          setResult({ result: full.evaluation || {}, attempt: full });
        } else if (data.status === 'terminated' && !cancelled) {
          setStatus('terminated');
        }
      } catch {
        /* ignore polling errors */
      }
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [status, attemptId]);

  const [chat, setChat] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatBusy, setChatBusy] = useState(false);

  const sendChat = async (text) => {
    const msg = String(text || chatText).trim();
    if (!msg || chatBusy) return;
    setChatText('');
    setChatBusy(true);
    setChat((c) => [...c, { role: 'user', text: msg }]);
    try {
      const data = await api(`/attempts/${attemptId}/chat`, { method: 'POST', body: { message: msg } });
      setChat((data.history || []).map((m) => ({ role: m.role === 'assistant' ? 'ai' : 'user', text: m.text })));
    } catch (e) {
      setChat((c) => [...c, { role: 'ai', text: `⚠️ ${e.message}` }]);
    } finally {
      setChatBusy(false);
    }
  };

  const getHint = () => {
    setPanelOpen(true);
    sendChat('Give me a small hint to guide me toward the next step, without revealing the full solution or exact commands.');
  };

  const getExplain = () => {
    setPanelOpen(true);
    sendChat('Explain the core concept of this task and what I need to do. Tell me which commands to run to inspect the current server state.');
  };

  const openTerminal = () => {
    if (kcUrl) {
      window.open(kcUrl, '_blank', 'noopener,noreferrer');
      setTerminalOpened(true);
    }
  };

  const exitLab = async () => {
    if (!window.confirm('Exit this lab? You can resume later.')) return;
    setBusy('exit');
    try {
      await api(`/attempts/${attemptId}/exit`, { method: 'POST' });
      navigate('/history');
    } finally {
      setBusy('');
    }
  };

  const practiceAgain = async () => {
    if (!task) return;
    setBusy('again');
    try {
      const data = await api(`/attempts/${task.id}/practice-again`, { method: 'POST' });
      navigate(`/lab/${data.attempt.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  if (status === 'loading') return <FullPageSpinner label="Preparing your lab environment…" />;

  if (status === 'error' || !attempt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="text-5xl">💥</div>
        <p className="font-semibold text-red-500">{error || 'Failed to load the lab'}</p>
        <Link to="/history" className="btn-primary">Back to history</Link>
      </div>
    );
  }

  if (status !== 'running' && status !== 'evaluated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-5xl">🕐</div>
        <h1 className="text-2xl font-extrabold">Session {status}</h1>
        <p className="max-w-md text-slate-500 dark:text-slate-400">
          {status === 'terminated'
            ? 'This lab session has ended. You can start a fresh one anytime.'
            : 'This attempt has already been submitted.'}
        </p>
        <div className="flex gap-3">
          <Link to="/history" className="btn-ghost">View history</Link>
          {task && (
            <button onClick={practiceAgain} className="btn-primary">
              <RefreshCcw size={16} /> Practice again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900">
        <Link to="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{task?.title || 'Lab session'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {terminalOpened ? 'Terminal open in new tab' : 'Open the terminal to start working'}
          </p>
        </div>

        {remaining !== null && (
          <span
            className={cn(
              'badge font-mono',
              remaining < 120
                ? 'animate-pulse-slow bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
            )}
          >
            <Timer size={14} /> {formatClock(remaining)}
          </span>
        )}

        <button onClick={() => setPanelOpen((v) => !v)} className="btn-ghost !px-3 lg:hidden" aria-label="Task panel">
          <PanelRight size={18} />
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <button onClick={getHint} disabled={chatBusy} className="btn-ghost">
            {chatBusy ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} className="text-amber-500" />}
            Hint
          </button>
          <button onClick={getExplain} disabled={chatBusy} className="btn-ghost">
            {chatBusy ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} className="text-violet-500" />}
            Explain
          </button>
          <button onClick={exitLab} disabled={busy === 'exit'} className="btn-danger">
            <LogOut size={16} /> Exit
          </button>
        </div>
      </div>

      {/* Mobile action row */}
      <div className="flex gap-2 border-b border-slate-200 bg-white px-3 py-2 md:hidden dark:border-white/10 dark:bg-slate-900">
        <button onClick={getHint} disabled={chatBusy} className="btn-ghost flex-1">
          <Lightbulb size={15} className="text-amber-500" /> Hint
        </button>
        <button onClick={getExplain} disabled={chatBusy} className="btn-ghost flex-1">
          <BookOpen size={15} className="text-violet-500" /> Explain
        </button>
        <button onClick={exitLab} className="btn-danger !px-3">
          <LogOut size={15} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
          <button className="ml-2 underline" onClick={() => setError('')}>dismiss</button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 lg:p-10">
          {/* Open Terminal CTA */}
          {!terminalOpened ? (
            <div className="card mb-6 border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-center dark:border-indigo-500/30 dark:bg-indigo-500/5">
              <TerminalIcon size={48} className="mx-auto text-indigo-400" />
              <h2 className="mt-4 text-xl font-extrabold">Ready to start?</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Open the Linux terminal in a new tab. Complete the tasks, then the final step will submit your work for grading.
              </p>
              <button onClick={openTerminal} className="btn-primary mt-4 !py-3 !px-6 text-base">
                <TerminalIcon size={18} /> Open Terminal
                <ExternalLink size={14} className="ml-1" />
              </button>
              <p className="mt-2 text-xs text-slate-400">Opens in a new tab · 1-hour session · free</p>
            </div>
          ) : (
            <div className="card mb-6 border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">Terminal is open</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complete all steps in the terminal. The final step auto-submits your work.
                  </p>
                </div>
                <button onClick={openTerminal} className="btn-ghost text-sm">
                  <ExternalLink size={14} /> Re-open
                </button>
              </div>
            </div>
          )}

          {/* Task checklist */}
          <div className="card">
            <h3 className="flex items-center gap-2 font-extrabold">
              <ListChecks size={17} className="text-emerald-500" /> Task checklist
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Complete each step in the Killercoda terminal. The final step submits your results for grading.
            </p>
            {task?.validationRules?.length > 0 && (
              <ul className="mt-4 space-y-2">
                {task.validationRules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Objectives + Requirements */}
          {task && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="card">
                <h4 className="font-bold">Objectives</h4>
                <ul className="mt-2 space-y-1.5">
                  {task.objectives?.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h4 className="font-bold">Requirements</h4>
                <ul className="mt-2 space-y-1.5">
                  {task.requirements?.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* AI tutor sidebar */}
        <aside
          className={cn(
            'w-full overflow-y-auto border-l border-slate-200 bg-white p-4 lg:block lg:w-96 dark:border-white/10 dark:bg-slate-900',
            panelOpen ? 'block' : 'hidden'
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-extrabold">
              <MessageCircle size={17} className="text-violet-500" /> AI tutor chat
            </h3>
            {chat.length > 0 && (
              <button onClick={() => setChat([])} className="text-sm text-slate-400">
                Clear chat
              </button>
            )}
          </div>

          <div className="mt-3 max-h-[50vh] space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            {chat.length === 0 && (
              <p className="text-xs leading-relaxed text-slate-400">
                Ask me anything about this task. Try{' '}
                <button
                  onClick={() => sendChat('What should I check first with cat or ls?')}
                  className="font-semibold text-indigo-500 underline"
                >
                  "What should I check first?"
                </button>
              </p>
            )}
            {chat.map((m, i) => (
              <div key={i} className={cn('text-sm', m.role === 'user' ? 'text-right' : 'text-left')}>
                <div
                  className={cn(
                    'inline-block max-w-full rounded-2xl px-3 py-2 text-left whitespace-pre-line',
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {chatBusy && (
              <p className="text-xs text-slate-400">
                <Loader2 size={12} className="mr-1 inline animate-spin" /> thinking…
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendChat(); }}
            className="mt-2 flex items-center gap-2"
          >
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Ask about this task…"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800"
            />
            <button type="submit" disabled={chatBusy} className="btn-primary !px-3" aria-label="Send">
              {chatBusy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
        </aside>
      </div>

      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                style={{ backgroundColor: result.result?.passed ? '#d1fae5' : '#fee2e2' }}>
                {result.result?.passed ? '🎉' : '💪'}
              </div>
              <h2 className="mt-4 text-2xl font-extrabold">
                {result.result?.passed ? 'Task completed!' : 'Almost there!'}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task?.title}</p>
              <div className="mt-4 text-5xl font-black gradient-text">
                {result.result?.score ?? result.attempt?.score ?? 0}
                <span className="text-2xl text-slate-400">/{result.result?.maxScore ?? result.attempt?.maxScore ?? task?.points}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Time taken: {formatDuration(result.result?.timeTakenSeconds || result.attempt?.timeTakenSeconds)}
              </p>
            </div>

            {result.result?.mistakes?.length > 0 ? (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-bold">
                  <XCircle size={18} className="text-red-500" /> Missed checks
                </h3>
                <ul className="mt-2 space-y-2">
                  {result.result.mistakes.map((m, i) => (
                    <li key={i} className="rounded-xl bg-red-50 p-3 text-sm dark:bg-red-500/10">
                      <p className="font-semibold text-red-700 dark:text-red-400">{m.label}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                Every check passed — production-ready configuration. 🏆
              </div>
            )}

            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
              <p className="font-bold">Feedback</p>
              <p className="mt-1 whitespace-pre-line text-slate-600 dark:text-slate-300">{result.result?.feedback || result.attempt?.feedback}</p>
            </div>

            {(result.result?.optimization || result.attempt?.optimization) && (
              <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm dark:bg-indigo-500/10">
                <p className="font-bold text-indigo-700 dark:text-indigo-400">Improvements</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{result.result?.optimization || result.attempt?.optimization}</p>
              </div>
            )}

            {(result.result?.correctSolution || result.attempt?.correctSolution) && (
              <div className="mt-4 rounded-xl bg-slate-950 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-300">
                  <Eye size={15} /> Reference solution
                </p>
                <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-300">
                  {result.result?.correctSolution || result.attempt?.correctSolution}
                </pre>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link to={`/history/${attemptId}`} className="btn-ghost flex-1">Full review</Link>
              <button onClick={practiceAgain} className="btn-primary flex-1">
                <RefreshCcw size={16} /> Practice again
              </button>
              <Link to="/practicals" className="btn-secondary flex-1">More practicals</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
