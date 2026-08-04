import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Info, Loader2, MonitorPlay } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from '../components/Spinner';

export default function PreviewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/tasks/${id}/killercoda`, { auth: Boolean(user) })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <FullPageSpinner label="Preparing preview…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-500">{error}</p>
        <Link to={`/practical/${id}`} className="btn-ghost mt-4">Back to practical</Link>
      </div>
    );
  }

  const proxyUrl = data?.proxyUrl || data?.embedUrl;

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900">
        <Link to={`/practical/${id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">Free preview</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ungraded sandbox — no points, no AI tutor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span className="hidden sm:inline">
              Ungraded sandbox.
              {user ? (
                <Link to={`/practical/${id}`} className="ml-1 font-semibold underline">Start graded lab</Link>
              ) : (
                <span> Sign in for scored lab.</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {proxyUrl && (
        <iframe
          key={proxyUrl}
          src={proxyUrl}
          title="Killercoda Preview"
          className="flex-1 border-0"
          allow="clipboard-write; clipboard-read"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
