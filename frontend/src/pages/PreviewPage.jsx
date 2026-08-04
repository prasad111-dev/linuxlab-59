import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Info, Loader2, MonitorPlay, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { FullPageSpinner } from '../components/Spinner';

export default function PreviewPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/tasks/${id}/killercoda`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullPageSpinner label="Preparing preview…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <Link to={`/practical/${id}`} className="btn-ghost mt-4">Back to practical</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-slate-900">
        <Link to={`/practical/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-500">
          <ArrowLeft size={15} /> Back
        </Link>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <MonitorPlay size={16} className="text-violet-500" /> Free preview — ungraded sandbox
        </span>
        <a
          href={data.embedUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-sm text-indigo-500 hover:underline"
        >
          Open in new tab <ExternalLink size={14} />
        </a>
      </div>
      <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>
          This preview runs on Killercoda's free infrastructure. It does <strong>not</strong> award points, update the
          leaderboard, or use the AI tutor. Sessions last up to 1 hour and reset after 30 minutes of inactivity. Use the
          graded practical for scoring.
        </p>
      </div>
      <iframe
        title="Killercoda free preview"
        src={data.embedUrl}
        className="min-h-0 flex-1 border-0 bg-white"
        allow="clipboard-write"
      />
      {loading && <Loader2 size={16} className="m-4 animate-spin text-slate-400" />}
    </div>
  );
}
