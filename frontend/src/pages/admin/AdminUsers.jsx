import { useEffect, useState } from 'react';
import { Search, Shield, User as UserIcon, Crown } from 'lucide-react';
import { api } from '../../lib/api';
import { FullPageSpinner } from '../../components/Spinner';
import { cn, timeAgo } from '../../lib/format';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const load = (query) => {
    setLoading(true);
    api(`/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const toggleRole = async (u) => {
    const role = u.role === 'admin' ? 'student' : 'admin';
    if (role === 'student' && !confirm(`Remove admin rights from ${u.email}?`)) return;
    const updated = await api(`/admin/users/${u.id}`, { method: 'PATCH', body: { role } });
    setUsers((us) => us.map((x) => (x.id === updated.id ? updated : x)));
    setNotice(`Updated ${updated.email} → ${updated.role}`);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Users</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{users.length} shown · manage roles.</p>
        </div>
        <label className="relative">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search email or name…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      {notice && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{notice}</p>}

      <div className="mt-6 card overflow-hidden p-0">
        {loading && <FullPageSpinner label="Loading users…" />}
        {!loading && users.length === 0 && <div className="py-16 text-center text-slate-500 dark:text-slate-400">No users found.</div>}
        {!loading && users.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                <th className="px-4 py-3">User</th>
                <th className="hidden px-4 py-3 md:table-cell">Signed up</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3 text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-sm font-black text-white">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{u.name}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 md:table-cell">{timeAgo(u.createdAt)}</td>
                  <td className="px-4 py-3 font-bold">{u.points}</td>
                  <td className="px-4 py-3">{u.streak?.current ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleRole(u)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition',
                        u.role === 'admin'
                          ? 'bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-500/15 dark:text-brand-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300'
                      )}
                    >
                      {u.role === 'admin' ? <Crown size={13} /> : <UserIcon size={13} />}
                      {u.role === 'admin' ? 'Admin' : 'Student'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Shield size={13} /> Click a role badge to toggle between student and admin.
      </p>
    </div>
  );
}
