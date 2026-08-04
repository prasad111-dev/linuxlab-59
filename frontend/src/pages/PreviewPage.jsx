import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Info, Loader2, MonitorPlay, ExternalLink, Terminal as TerminalIcon } from 'lucide-react';
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

  const openPreview = () => {
    if (data?.embedUrl) {
      window.open(data.embedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <Link to={`/practical/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-500">
        <ArrowLeft size={15} /> Back to practical
      </Link>

      <div className="mt-8 card">
        <MonitorPlay size={48} className="mx-auto text-violet-400" />
        <h1 className="mt-4 text-2xl font-extrabold">Free preview</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Try this lab in a Killercoda terminal — no login required, unlimited time.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>
            This is an ungraded sandbox. It does <strong>not</strong> award points, update the leaderboard, or use the AI tutor.{' '}
            {user ? (
              <Link to={`/practical/${id}`} className="font-semibold underline">Start the graded lab instead</Link>
            ) : (
              'Sign in to start the graded lab for scoring.'
            )}
          </p>
        </div>

        <button onClick={openPreview} className="btn-primary mt-6 !py-3 !px-6 text-base">
          <TerminalIcon size={18} /> Open in Killercoda
          <ExternalLink size={14} className="ml-1" />
        </button>
        <p className="mt-2 text-xs text-slate-400">Opens in a new tab · free · no account needed</p>
      </div>
    </div>
  );
}
