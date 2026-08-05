import { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, Outlet, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Protected from './components/ProtectedRoute';
import { FullPageSpinner } from './components/Spinner';
import { api, API_URL } from './lib/api';

const Landing = lazy(() => import('./pages/Landing'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Practicals = lazy(() => import('./pages/Practicals'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));
const LabPage = lazy(() => import('./pages/LabPage'));
const History = lazy(() => import('./pages/History'));
const AttemptReview = lazy(() => import('./pages/AttemptReview'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Profile = lazy(() => import('./pages/Profile'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const FlashcardDuel = lazy(() => import('./pages/FlashcardDuel'));
const QuestMode = lazy(() => import('./pages/QuestMode'));
const TypingShooter = lazy(() => import('./pages/TypingShooter'));
const InterviewSessionDetail = lazy(() => import('./pages/InterviewSessionDetail'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTasks = lazy(() => import('./pages/admin/AdminTasks'));
const TaskEditor = lazy(() => import('./pages/admin/TaskEditor'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSuggestions = lazy(() => import('./pages/admin/AdminSuggestions'));
const AdminActivity = lazy(() => import('./pages/admin/AdminActivity'));
const AdminEngagement = lazy(() => import('./pages/admin/AdminEngagement'));
const AdminAttempts = lazy(() => import('./pages/admin/AdminAttempts'));

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<FullPageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const lastActivityAt = useRef(Date.now());

  useEffect(() => {
    const idle = typeof requestIdleCallback === 'function' ? requestIdleCallback : (fn) => setTimeout(fn, 1500);
    const t = idle(() => {
      import('./pages/Dashboard');
      import('./pages/Practicals');
      import('./pages/Leaderboard');
    });
    return () => (typeof t.cancel === 'function' ? t.cancel() : clearTimeout(t));
  }, []);

  useEffect(() => {
    const beat = () => {
      const active = Date.now() - lastActivityAt.current < 60_000;
      api('/auth/presence', { method: 'POST', body: { active } }).catch(() => {});
    };
    beat();
    const t = setInterval(beat, 10_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const bump = () => {
      lastActivityAt.current = Date.now();
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, bump));
  }, []);

  useEffect(() => {
    const keepWarm = () => fetch(`${API_URL}/health`).catch(() => {});
    keepWarm();
    const t = setInterval(keepWarm, 8 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/practicals" element={<Practicals />} />
        <Route path="/practical/:id" element={<TaskDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/history"
          element={
            <Protected>
              <History />
            </Protected>
          }
        />
        <Route
          path="/history/:id"
          element={
            <Protected>
              <AttemptReview />
            </Protected>
          }
        />
        <Route
          path="/achievements"
          element={
            <Protected>
              <Achievements />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/interview"
          element={
            <Protected>
              <InterviewPrep />
            </Protected>
          }
        />
        <Route
          path="/interview/flashcard"
          element={
            <Protected>
              <FlashcardDuel />
            </Protected>
          }
        />
        <Route
          path="/interview/quest"
          element={
            <Protected>
              <QuestMode />
            </Protected>
          }
        />
        <Route
          path="/interview/typing"
          element={
            <Protected>
              <TypingShooter />
            </Protected>
          }
        />
        <Route
          path="/interview/session/:id"
          element={
            <Protected>
              <InterviewSessionDetail />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected admin>
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <Protected admin>
              <AdminTasks />
            </Protected>
          }
        />
        <Route
          path="/admin/tasks/new"
          element={
            <Protected admin>
              <TaskEditor />
            </Protected>
          }
        />
        <Route
          path="/admin/tasks/:id/edit"
          element={
            <Protected admin>
              <TaskEditor />
            </Protected>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <Protected admin>
              <AdminCategories />
            </Protected>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Protected admin>
              <AdminUsers />
            </Protected>
          }
        />
        <Route
          path="/admin/suggestions"
          element={
            <Protected admin>
              <AdminSuggestions />
            </Protected>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <Protected admin>
              <AdminActivity />
            </Protected>
          }
        />
        <Route
          path="/admin/engagement"
          element={
            <Protected admin>
              <AdminEngagement />
            </Protected>
          }
        />
        <Route
          path="/admin/attempts"
          element={
            <Protected admin>
              <AdminAttempts />
            </Protected>
          }
        />
      </Route>

      <Route
        path="/lab/:attemptId"
        element={
          <Protected>
            <LabPage />
          </Protected>
        }
      />

      <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl">🛰️</div>
      <h1 className="text-2xl font-extrabold">404 — lost in space</h1>
      <p className="text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Go home
      </Link>
    </div>
  );
}
