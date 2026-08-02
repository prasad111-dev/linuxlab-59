export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

const DIFFICULTY = {
  beginner: { label: 'Beginner', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  intermediate: { label: 'Intermediate', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  advanced: { label: 'Advanced', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400' },
  expert: { label: 'Expert', cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
};

export function difficultyMeta(d) {
  return DIFFICULTY[d] || DIFFICULTY.beginner;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function scoreColor(score, max) {
  const pct = max ? (score / max) * 100 : 0;
  if (pct >= 85) return 'text-emerald-500';
  if (pct >= 60) return 'text-amber-500';
  return 'text-red-500';
}
