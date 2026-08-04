import { Loader2 } from 'lucide-react';

export function Spinner({ size = 22, className = '' }) {
  return <Loader2 className={`animate-spin ${className}`} size={size} />;
}

export function FullPageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="animate-float text-5xl">🐧</div>
      <Spinner size={26} className="text-brand-500" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
