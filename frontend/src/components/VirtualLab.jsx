import { useMemo, useRef, useState } from 'react';
import { TerminalIcon, Lock, Flag, HelpCircle } from 'lucide-react';
import { cn } from '../lib/format';

const HELP = [
  'pwd                  print current directory',
  'ls  /  ls -a  /  ls -l',
  'cd <dir> | .. | /',
  'cat <file>',
  'head <file>   tail <file>   wc -l <file>',
  'grep <pattern> <file>',
  'find -name <pattern>',
  'ps aux               process table (simulated)',
  'clear                clear screen',
  'help                 this list',
];

function norm(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function cloneNode(node) {
  if (!node || node.type !== 'dir') return { ...(node || {}) };
  const children = {};
  for (const [k, v] of Object.entries(node.children || {})) children[k] = cloneNode(v);
  return { type: 'dir', children };
}

function globMatch(name, pattern) {
  const re = new RegExp('^' + String(pattern).split('*').map(escapeRe).join('.*') + '$');
  return re.test(name);
}
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function VirtualLab({ config, onFinish }) {
  const fs = useRef(cloneNode(config.fs));
  const [cwd, setCwd] = useState([]);
  const [lines, setLines] = useState(['# Welcome to the simulated filesystem', '# Type `help` for supported commands.', '']);
  const [input, setInput] = useState('');
  const [roomsDone, setRoomsDone] = useState([]);
  const [goalsDone, setGoalsDone] = useState([]);
  const finished = useRef(false);

  const pathStr = (p) => '/' + p.join('/');

  const getDir = (p) => {
    let node = fs.current;
    for (const seg of p) {
      if (!node || node.type !== 'dir' || !node.children[seg]) return null;
      node = node.children[seg];
    }
    return node && node.type === 'dir' ? node : null;
  };

  const resolvePath = (p) => {
    const segs = String(p || '').split('/').filter(Boolean);
    const base = p && p.startsWith('/') ? [] : cwd;
    const parts = [...base, ...segs];
    let node = fs.current;
    for (let i = 0; i < parts.length; i++) {
      if (!node || node.type !== 'dir' || !node.children[parts[i]]) return null;
      node = node.children[parts[i]];
    }
    return node;
  };

  const push = (...l) => setLines((prev) => [...prev, ...l]);

  const promptLine = (p) => `student@sim:${pathStr(p)}$`;

  const listDir = (node, flags) => {
    const names = Object.keys(node.children || {}).sort();
    const showHidden = flags.includes('a');
    const long = flags.includes('l');
    return names
      .filter((n) => showHidden || !n.startsWith('.'))
      .map((n) => {
        const child = node.children[n];
        const isDir = child && child.type === 'dir';
        return long
          ? `${isDir ? 'drwxr-xr-x' : '-rw-r--r--'}  root root  ${isDir ? '4096' : String(child.content || '').length}  ${n}${isDir ? '/' : ''}`
          : `${n}${isDir ? '/' : ''}`;
      });
  };

  const findFiles = (node, base, pattern, out) => {
    for (const [name, child] of Object.entries(node.children || {})) {
      const full = base ? `${base}/${name}` : name;
      if (child.type !== 'dir' && globMatch(name, pattern)) out.push(full);
      if (child.type === 'dir') findFiles(child, full, pattern, out);
    }
    return out;
  };

  const exec = (raw) => {
    const cmd = norm(raw);
    const out = [];
    const parts = cmd.split(' ');
    const [prog, ...rest] = parts;
    const node = getDir(cwd);

    const markDone = (step) => {
      if (config.rooms && step) {
        setRoomsDone((prev) => {
          const next = prev.includes(step.id) ? prev : [...prev, step.id];
          const all = next.length === (config.rooms || []).length;
          if (all && !finished.current) {
            finished.current = true;
            const answers = (config.rooms || []).map((r) => ({
              prompt: `Room ${r.id}: ${r.title}`,
              answer: r.require,
              userAnswer: r.require,
              correct: true,
              topic: 'Escape Room',
            }));
            onFinish?.(answers);
          }
          return next;
        });
      } else if (config.goals && step) {
        setGoalsDone((prev) => {
          const next = prev.includes(step.text) ? prev : [...prev, step.text];
          const all = next.length === (config.goals || []).length;
          if (all && !finished.current) {
            finished.current = true;
            const answers = (config.goals || []).map((g) => ({
              prompt: g.text,
              answer: '(found via exploration)',
              userAnswer: g.text,
              correct: true,
              topic: 'Virtual Lab',
            }));
            onFinish?.(answers);
          }
          return next;
        });
      }
    };

    const checkGoals = (output) => {
      const joined = output.join('\n');
      for (const g of config.goals || []) {
        if (g.check && g.check(joined) && !goalsDone.includes(g.text)) {
          push(`\u2705 Goal complete: ${g.text}`);
          markDone({ text: g.text });
        }
      }
    };

    if (!cmd) return;
    if (prog === 'clear') {
      setLines([]);
      return;
    }
    if (prog === 'help') {
      push(...HELP);
      return;
    }
    if (prog === 'pwd') {
      out.push(pathStr(cwd));
    } else if (prog === 'ls') {
      const flags = rest.filter((a) => a.startsWith('-')).join('');
      const targets = rest.filter((a) => !a.startsWith('-'));
      const dir = targets.length ? resolvePath(targets[0]) : node;
      if (!dir || dir.type !== 'dir') out.push('ls: cannot access: not a directory');
      else {
        const entries = listDir(dir, flags);
        out.push(entries.length ? entries.join('  ') : '(empty)');
      }
    } else if (prog === 'cd') {
      const target = rest[0] || '~';
      if (target === '..') {
        if (cwd.length) setCwd(cwd.slice(0, -1));
      } else if (target === '/') {
        setCwd([]);
      } else if (target === '~') {
        setCwd(['home', 'student']);
      } else {
        const segs = target.split('/').filter(Boolean);
        const base = target.startsWith('/') ? [] : cwd;
        const next = [...base, ...segs];
        if (getDir(next)) setCwd(next);
        else out.push(`cd: no such directory: ${target}`);
      }
    } else if (prog === 'cat') {
      const f = resolvePath(rest[0]);
      if (!f || f.type !== 'dir') out.push('cat: no such file');
      else out.push(String(f.content || '').split('\n').join(''));
    } else if (prog === 'head' || prog === 'tail') {
      const isHead = prog === 'head';
      let fileArg = rest[rest.length - 1];
      let n = 10;
      const numIdx = rest.findIndex((a) => a === '-n');
      if (numIdx !== -1) {
        n = parseInt(rest[numIdx + 1], 10) || 10;
        fileArg = rest.find((a) => !a.startsWith('-'));
      }
      const f = resolvePath(fileArg);
      const content = f && f.type !== 'dir' ? String(f.content || '') : '';
      const linesArr = content.split('\n');
      const slice = isHead ? linesArr.slice(0, n) : linesArr.slice(-n);
      out.push(slice.join('\n') || '(empty)');
    } else if (prog === 'wc') {
      const fileArg = rest.find((a) => !a.startsWith('-'));
      const f = resolvePath(fileArg);
      if (!f || f.type === 'dir') out.push('wc: no such file');
      else {
        const text = String(f.content || '');
        out.push(`${text.split('\n').filter((l) => l !== '').length}  ${fileArg}`);
      }
    } else if (prog === 'grep') {
      const pat = rest[0];
      const f = resolvePath(rest[1]);
      if (!f || f.type === 'dir') out.push('grep: no such file');
      else {
        const matched = String(f.content || '').split('\n').filter((l) => l.includes(pat));
        out.push(matched.join('\n') || '(no matches)');
      }
    } else if (prog === 'find') {
      const pat = rest.find((a, i) => rest[i - 1] === '-name');
      if (!pat) out.push('usage: find -name <pattern>');
      else {
        const found = findFiles(node, '', pat, []);
        out.push(found.length ? found.join('\n') : '(no matches)');
      }
    } else if (prog === 'ps') {
      out.push('PID  USER   %CPU  COMMAND');
      out.push('  1  root    0.1  /sbin/init');
      out.push(' 42  student 0.5  bash');
      out.push('1337  guard   1.2  /usr/sbin/guard (the vault guard)');
    } else {
      out.push(`-sim: command not found: ${prog} (try \`help\`)`);
    }

    if (out.length) {
      push(...out);
      checkGoals(out);
      if (config.rooms) {
        const room = (config.rooms || []).find((r) => !roomsDone.includes(r.id) && norm(r.require) === norm(cmd));
        if (room) {
          push(`\u2705 Room ${room.id} cleared: ${room.title}`);
          markDone(room);
        }
      }
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    push(promptLine(cwd) + ' ' + input);
    exec(input);
    setInput('');
  };

  const rooms = config.rooms || [];
  const goals = config.goals || [];
  const allRooms = rooms.length > 0 && roomsDone.length === rooms.length;
  const allGoals = goals.length > 0 && goalsDone.length === goals.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TerminalIcon size={20} className="text-brand-500" />
          <h1 className="text-xl font-extrabold">{config.title || 'Virtual Linux Lab'}</h1>
        </div>
        <div className="flex gap-2">
          {rooms.length > 0 && (
            <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              <Lock size={12} /> Rooms {roomsDone.length}/{rooms.length}
            </span>
          )}
          {goals.length > 0 && (
            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <Flag size={12} /> Goals {goalsDone.length}/{goals.length}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{config.intro}</p>

      {(rooms.length > 0 || goals.length > 0) && (
        <div className="mt-4 space-y-2">
          {rooms.map((r) => (
            <div
              key={r.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-sm',
                roomsDone.includes(r.id)
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                  : 'border-slate-200 dark:border-white/10'
              )}
            >
              <span className={cn('mt-0.5 shrink-0', roomsDone.includes(r.id) ? 'text-emerald-500' : 'text-slate-400')}>
                {roomsDone.includes(r.id) ? '✅' : '🔒'}
              </span>
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.hint}</p>
              </div>
            </div>
          ))}
          {goals.map((g) => (
            <div
              key={g.text}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-sm',
                goalsDone.includes(g.text)
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                  : 'border-slate-200 dark:border-white/10'
              )}
            >
              <span className={cn('mt-0.5 shrink-0', goalsDone.includes(g.text) ? 'text-emerald-500' : 'text-slate-400')}>
                <Flag size={14} />
              </span>
              <p className="font-semibold">{g.text}</p>
            </div>
          ))}
        </div>
      )}

      {(allRooms || allGoals) && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          🎉 {allRooms ? 'You escaped! Every room is cleared.' : 'All goals complete!'} Saving your session…
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-xl dark:border-white/10">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-xs text-slate-400">simulated-fs · {config.title || 'virtual-lab'}</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4 font-mono text-sm leading-relaxed">
          {lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap text-slate-200">
              {l}
            </div>
          ))}
          <form onSubmit={submit} className="flex items-center gap-2">
            <span className="shrink-0 text-emerald-400">{promptLine(cwd)}</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 bg-transparent font-mono text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="type a command…"
            />
          </form>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <HelpCircle size={13} /> Type <code className="rounded bg-slate-100 px-1 dark:bg-white/10">help</code> for supported commands.
      </p>
    </div>
  );
}
