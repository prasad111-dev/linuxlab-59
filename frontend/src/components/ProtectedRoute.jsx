import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from './Spinner';

export default function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner label="Checking session…" />;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
