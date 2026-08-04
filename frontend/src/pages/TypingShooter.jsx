import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Keyboard, Crosshair } from 'lucide-react';
import { api } from '../lib/api';
import { Spinner } from '../components/Spinner';
import InterviewReport from '../components/InterviewReport';
import { TYPING_COMMANDS } from '../data/interviewData';
import { cn, formatDuration } from '../lib/format';

function charState(typed, target) {
  return target.split('').map((ch, i) => {
    if (i >= typed.length) return 'pending';
    return typed[i] === ch ? 'ok' : 'bad';
  });
}

export default function TypingShooter() {
  const commands = useMemo(() => TYPING_COMMANDS, []);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [done, setDone] = useState(false);
  const [log, setLog] = useState([]);
  const [report, setReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const startedAt = useRef(Date.now());
  const cmdStartedAt = useRef(Date.now());
  const errorsRef = useRef(0);

  const target = commands[index];
  const elapsed = (Date.now() - startedAt.current) / 1000;
  const wpm = elapsed > 0 ? Math.round((log.reduce((n, l) => n + l.cmd.length, 0) / 5) / (elapsed / 60)) : 0;
  const totalChars = log.reduce((n, l) => n + l.cmd.length, 0);
  const errors = log.reduce((n, l) => n + l.errors, 0) + (done ? errorsRef.current : 0);
  const accuracy = totalChars + errors > 0 ? Math.round((totalChars / (totalChars + errors)) * 100) : 100;

  const submit = async () => {
    setSaving(true);
    try {
      const answers = log.map((l) => ({
        prompt: `Type: ${l.cmd}`,
        answer: l.cmd,
        userAnswer: l.typed,
        correct: l.correct,
        topic: 'Typing',
      }));
      const session = await api('/interview/sessions', {
        method: 'POST',
        body: {
          mode: 'typing',
          answers,
          score: log.filter((l) => l.correct).length,
          maxScore: log.length,
          accuracy,
          wpm,
          timeTakenSeconds: Math.floor((Date.now() - startedAt.current) / 1000),
        },
      });
      setReport(session);
    } finally {
      setSaving(false);
    }
  };

  const finish = () => {
    setDone(true);
    submit();
  };

  const submitCommand = () => {
    if (done) return;
    const typed = value;
    const correct = typed === target;
    if (!correct) errorsRef.current += Math.max(1, typed.length - target.length);
    setLog((prev) => [...prev, { cmd: target, typed, correct, errors: errorsRef.current }]);
    setValue('');
    errorsRef.current = 0;
    cmdStartedAt.current = Date.now();
    if (index < commands.length - 1) setIndex(index + 1);
    else finish();
  };

  if (report) return <InterviewReport session={report} onRetry={() => window.location.reload()} />;

  const states = charState(value, target);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link to="/interview" className="btn-ghost !px-3 !py-2">
          <ArrowLeft size={16} /> Hub
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Crosshair size={15} /> Command {index + 1}/30 · {wpm} WPM · {accuracy}%
        </div>
      </div>

      <div className="mt-5 flex gap-1.5">
        {commands.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition',
              i < index ? 'bg-emerald-400' : i === index ? 'bg-rose-500' : 'bg-slate-200 dark:bg-white/10'
            )}
          />
        ))}
      </div>

      <div className="card mt-6 animate-fade-up !p-7" key={index}>
        <div className="flex items-center gap-2">
          <Keyboard size={16} className="text-rose-500" />
          <span className="badge bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
            Type the command
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-950 px-5 py-6 dark:border-white/10">
          <p className="font-mono text-xl leading-relaxed tracking-wide">
            {states.map((s, i) => (
              <span
                key={i}
                className={
                  s === 'ok'
                    ? 'text-emerald-400'
                    : s === 'bad'
                      ? 'bg-red-500/20 text-red-400 underline'
                      : 'text-slate-500'
                }
              >
                {target[i]}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2 font-mono text-sm text-rose-500">$</span>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitCommand()}
              placeholder="type it exactly…"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              className="input !font-mono !pl-9"
            />
          </div>
          <button onClick={submitCommand} disabled={!value.trim()} className="btn-primary">
            <ArrowRight size={16} />
          </button>
        </div>

        {log.length > 0 && (
          <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 dark:border-white/10">
            {log.slice(-3).reverse().map((l, i) => (
              <p key={i} className="flex items-center gap-2 font-mono text-xs">
                <span className={cn('font-bold', l.correct ? 'text-emerald-500' : 'text-red-500')}>
                  {l.correct ? '✓' : '✗'}
                </span>
                <span className="text-slate-600 dark:text-slate-300">{l.cmd}</span>
                {!l.correct && <span className="text-red-400">{l.typed}</span>}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={finish} disabled={saving || log.length === 0} className="btn-ghost">
          {saving ? <Spinner size={16} /> : <Sparkles size={16} />} Finish & get AI analysis
        </button>
      </div>
      <p className="mt-2 text-right text-xs text-slate-400">
        Time elapsed: {formatDuration(elapsed)}
      </p>
    </div>
  );
}
