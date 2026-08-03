import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { googleAuthUrl } from '../lib/api';
import { Spinner } from '../components/Spinner';

export default function AuthPage() {
  const { user, loading, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      login(token).then(() => {
        navigate(location.state?.from || '/dashboard', { replace: true });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const processing = loading || Boolean(params.get('token'));

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Terminal size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">
            Welcome to <span className="gradient-text">LinuxLab-59</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Sign in to start solving real Linux Administration practicals.
          </p>

          <div className="mt-7">
            {processing ? (
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                <Spinner size={18} /> Finishing sign in…
              </div>
            ) : (
              <a href={googleAuthUrl()} className="btn-primary w-full !py-3">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </a>
            )}
          </div>

          <p className="mt-5 text-xs text-slate-400">
            First time here? Your account is created automatically.
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-500">
            <ArrowLeft size={15} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
