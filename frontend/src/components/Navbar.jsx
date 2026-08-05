import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Terminal,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  LogOut,
  LayoutDashboard,
  ListChecks,
  Trophy,
  User,
  History,
  Award,
  Shield,
  Lightbulb,
  ChevronDown,
  Brain,
  Activity,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { api } from '../lib/api';
import { timeAgo, initials } from '../lib/format';
import { cn } from '../lib/format';

const NAV = [
  { to: '/practicals', label: 'Practicals', icon: ListChecks },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/interview', label: 'Interview Prep', icon: Brain },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState({ items: [], unread: 0 });
  const menuRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    if (user) {
      api('/notifications?limit=8').then(setNotifs).catch(() => {});
    } else {
      setNotifs({ items: [], unread: 0 });
    }
  }, [user]);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = async () => {
    await api('/notifications/read-all', { method: 'POST' }).catch(() => {});
    setNotifs((n) => ({ items: n.items.map((i) => ({ ...i, read: true })), unread: 0 }));
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkCls = ({ isActive }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-brand-500/30">
            <Terminal size={20} />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            Linux<span className="gradient-text">Lab</span>-59
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <NavLink to="/dashboard" className={linkCls} end>
              Dashboard
            </NavLink>
          )}
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkCls} end={to === '/practicals'}>
              {label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/history" className={linkCls}>
              History
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setBellOpen((v) => !v)}
                  aria-label="Notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <Bell size={18} />
                  {notifs.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {notifs.unread > 9 ? '9+' : notifs.unread}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-900">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-sm font-bold">Notifications</span>
                      {notifs.unread > 0 && (
                        <button onClick={markAllRead} className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {notifs.items.length === 0 && (
                        <p className="px-2 py-6 text-center text-sm text-slate-400">No notifications yet</p>
                      )}
                      {notifs.items.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            'rounded-xl px-3 py-2.5',
                            !n.read && 'bg-brand-50/70 dark:bg-brand-500/10'
                          )}
                        >
                          <p className="text-sm font-semibold">{n.title}</p>
                          {n.body && <p className="text-xs text-slate-500 dark:text-slate-400">{n.body}</p>}
                          <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pr-2 pl-1 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
                >
                  {user.picture ? (
                    <img src={user.picture} alt="" className="h-7 w-7 rounded-full" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {initials(user.name)}
                    </span>
                  )}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-3 py-2 dark:border-white/10">
                      <p className="truncate text-sm font-bold">{user.name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <MenuItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" onClick={() => setMenuOpen(false)} />
                      <MenuItem icon={User} label="Profile" to="/profile" onClick={() => setMenuOpen(false)} />
                      <MenuItem icon={History} label="Practice history" to="/history" onClick={() => setMenuOpen(false)} />
                      <MenuItem icon={Award} label="Achievements" to="/achievements" onClick={() => setMenuOpen(false)} />
                      {user.role === 'admin' && (
                        <>
                          <MenuItem icon={Shield} label="Admin panel" to="/admin" onClick={() => setMenuOpen(false)} />
                          <MenuItem icon={Activity} label="Live activity" to="/admin/activity" onClick={() => setMenuOpen(false)} />
                          <MenuItem icon={Lightbulb} label="Suggestions" to="/admin/suggestions" onClick={() => setMenuOpen(false)} />
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="btn-primary">
              Login with Google
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-white/5"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden dark:border-white/10 dark:bg-slate-950">
          <div className="flex flex-col gap-1">
            {user && (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5">
                Dashboard
              </Link>
            )}
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5">
                {label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/history" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5">
                  History
                </Link>
                <Link to="/achievements" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5">
                  Achievements
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuItem({ icon: Icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
    >
      <Icon size={16} className="text-slate-400" /> {label}
    </Link>
  );
}
