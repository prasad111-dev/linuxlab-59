import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Sparkles,
  ShieldCheck,
  Terminal,
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { googleAuthUrl } from '../lib/api';

const FEATURES = [
  {
    icon: Terminal,
    title: 'Real Linux Terminal',
    desc: 'Every student gets their own isolated Ubuntu container with a full terminal in the browser. Real commands, real services, real learning.',
    color: 'text-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'AI-powered hints',
    desc: 'Stuck? Get a small clue or a concept explanation from Gemini — progressive hints that teach without giving away the answer.',
    color: 'text-violet-500',
  },
  {
    icon: CheckCircle2,
    title: 'Automatic evaluation',
    desc: 'Submit your work and get scored instantly on real checks: users, files, permissions, services, ports and configurations.',
    color: 'text-indigo-500',
  },
  {
    icon: Award,
    title: 'Achievements & streaks',
    desc: 'Earn badges, build learning streaks and climb the leaderboard as you master Linux Administration.',
    color: 'text-amber-500',
  },
  {
    icon: ShieldCheck,
    title: 'Isolated & safe',
    desc: 'Each lab is an isolated container with resource limits. No student can ever affect another environment.',
    color: 'text-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Full learning history',
    desc: 'Scores, mistakes, hints used and command history — everything saved so you can review and repeat anytime.',
    color: 'text-sky-500',
  },
];

const ROADMAP = [
  { step: '01', title: 'Linux Basics', desc: 'Navigation, commands, files and the terminal.' },
  { step: '02', title: 'System Administration', desc: 'Users, permissions, processes, packages and services.' },
  { step: '03', title: 'Networking & Servers', desc: 'SSH, firewalls, Nginx, Apache, DNS and file sharing.' },
  { step: '04', title: 'Automation & DevOps', desc: 'Cron, shell scripting, Docker and monitoring.' },
  { step: '05', title: 'Production & Interviews', desc: 'Real troubleshooting and production Linux scenarios.' },
];

const CATEGORIES = [
  { icon: '👤', name: 'User Management' },
  { icon: '🔑', name: 'SSH' },
  { icon: '🟢', name: 'Nginx' },
  { icon: '🐳', name: 'Docker' },
  { icon: '🧱', name: 'Firewall' },
  { icon: '⏰', name: 'Cron Jobs' },
  { icon: '🐧', name: 'Linux Basics' },
  { icon: '🔐', name: 'Permissions' },
  { icon: '🌐', name: 'Networking' },
  { icon: '📦', name: 'Package Management' },
  { icon: '🐚', name: 'Shell Scripting' },
  { icon: '🏭', name: 'Production Linux' },
];

const TESTIMONIALS = [
  {
    name: 'Ananya S.',
    role: 'CS Student',
    text: 'The scenarios feel like real tickets from my internship. I finally understand users, permissions and SSH for real.',
    avatar: 'AS',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Rohan K.',
    role: 'DevOps Trainee',
    text: 'Practice Again is a lifesaver. I re-did the Nginx task until I got it perfect, and the AI hints actually taught me.',
    avatar: 'RK',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    name: 'Sneha P.',
    role: 'Linux Admin Student',
    text: 'Real containers, real systemctl, real iptables. This is what every Linux course should look like.',
    avatar: 'SP',
    color: 'from-emerald-500 to-teal-500',
  },
];

const FAQS = [
  {
    q: 'Do I need to install anything?',
    a: 'No. Everything runs in your browser. Each practical spins up a real Linux container on the lab servers — you just type commands.',
  },
  {
    q: 'Is it really an isolated environment?',
    a: 'Yes. Every student gets their own container with resource limits, and it is automatically destroyed when the session ends.',
  },
  {
    q: 'How does the AI hint system work?',
    a: 'The Hint button reveals progressively more detailed clues. Explain teaches the underlying Linux concept without giving away the answer.',
  },
  {
    q: 'How is my work evaluated?',
    a: 'On submit, the platform runs real checks inside your container — verifying users, files, permissions, services and ports — and scores you instantly.',
  },
  {
    q: 'Can I repeat a practical?',
    a: 'Anytime. Practice Again spins up a completely fresh container so you start from a clean system, while your history and best score are preserved.',
  },
  {
    q: 'Is there an admin / task creation?',
    a: 'Admins can create, edit and publish practicals manually or generate a full draft from a single prompt using AI.',
  },
];

const STATS = [
  { value: '29+', label: 'Categories' },
  { value: '100%', label: 'Browser-based' },
  { value: '24/7', label: 'Available' },
  { value: '$0', label: 'To start learning' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]" />
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-24 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 text-center sm:px-6 lg:pt-28">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Sparkles size={14} /> Real Linux environments in your browser
          </div>

          <h1 className="animate-fade-up mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Master <span className="gradient-text">Linux Administration</span> the way real admins work
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Stop memorizing commands. Solve realistic IT support tickets on real, isolated Linux
            containers — with AI hints, automatic evaluation and a leaderboard that keeps you going.
          </p>

          <div className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link to="/dashboard" className="btn-primary !px-6 !py-3 !text-base">
                Continue learning <ArrowRight size={18} />
              </Link>
            ) : (
              <a href={googleAuthUrl()} className="btn-primary !px-6 !py-3 !text-base">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </a>
            )}
            <a href="#features" className="btn-ghost !px-6 !py-3 !text-base">
              <Play size={18} /> See how it works
            </a>
          </div>

          {/* terminal mockup */}
          <div className="animate-fade-up mx-auto mt-14 max-w-3xl text-left" style={{ animationDelay: '150ms' }}>
            <div className="glass overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-slate-200/60 px-4 py-3 dark:border-white/10">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-400">Prasad@linuxlab: ~/lab</span>
              </div>
              <div className="bg-slate-950 p-5 font-mono text-sm text-slate-300">
                <p><span className="text-emerald-400">Prasad@lab</span>:<span className="text-sky-400">~</span>$ <span className="text-white">groupadd devteam</span></p>
                <p><span className="text-emerald-400">Prasad@lab</span>:<span className="text-sky-400">~</span>$ <span className="text-white">useradd -m -s /bin/bash rahul</span></p>
                <p><span className="text-emerald-400">Prasad@lab</span>:<span className="text-sky-400">~</span>$ <span className="text-white">usermod -aG devteam rahul</span></p>
                <p><span className="text-emerald-400">Prasad@lab</span>:<span className="text-sky-400">~</span>$ <span className="text-white">chown rahul:devteam /home/rahul</span></p>
                <p className="mt-2 text-slate-400">✓ All validation checks passed — <span className="text-emerald-400">100 / 100 points</span></p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card !p-4 text-center">
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything you need to <span className="gradient-text">become a Linux admin</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Built like the tools professional teams use, tuned for students.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card group transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md dark:bg-white/5 ${f.color}`}>
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section id="roadmap" className="border-y border-slate-200/60 bg-white/50 py-20 dark:border-white/10 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your learning roadmap</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">From your first command to production Linux.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {ROADMAP.map((r, i) => (
              <div key={r.step} className="relative card !bg-white/60 dark:!bg-slate-900/50">
                <div className="text-3xl font-black text-indigo-200 dark:text-indigo-500/30">{r.step}</div>
                <h3 className="mt-3 font-bold">{r.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{r.desc}</p>
                {i < ROADMAP.length - 1 && (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-slate-300 md:block dark:text-slate-600" size={18} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="gradient-text">29 categories</span> of hands-on practicals
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Covering everything from Linux basics to DevOps and interviews.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/practicals"
              className="card flex items-center gap-3 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500/40"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-slate-200/60 bg-white/50 py-20 dark:border-white/10 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Loved by students</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Real practice, real progress.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${t.color}`}>
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} />
              </summary>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-slate-200/60 bg-white/50 py-20 dark:border-white/10 dark:bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="card grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Mail className="text-indigo-500" />
              <div>
                <p className="text-sm font-bold">Email</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">prasadghavghave0@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-indigo-500" />
              <div>
                <p className="text-sm font-bold">Contact</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">9322860752</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-indigo-500" />
              <div>
                <p className="text-sm font-bold">Location</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Anywhere the cloud runs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 text-center shadow-2xl shadow-indigo-600/30 sm:p-16">
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-3xl font-black text-white sm:text-4xl">Your first lab is one click away</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-indigo-100">
            Start with a real IT support ticket — onboard a developer, harden SSH, deploy with Nginx.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link to="/dashboard" className="btn-ghost !border-white/30 !bg-white !text-indigo-700 hover:!bg-indigo-50">
                Go to dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <a href={googleAuthUrl()} className="btn-ghost !border-white/30 !bg-white !text-indigo-700 hover:!bg-indigo-50">
                  Login with Google
                </a>
                <Link to="/practicals" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Clock size={16} /> Browse practicals
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
