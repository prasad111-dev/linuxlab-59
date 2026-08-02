import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/50 dark:border-white/10 dark:bg-slate-950/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Terminal size={16} />
              </div>
              <span className="font-extrabold">
                Linux<span className="gradient-text">Lab</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Practice real Linux Administration and DevOps on real, isolated Linux containers — right in your browser.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/practicals" className="hover:text-indigo-500">Practicals</Link></li>
              <li><Link to="/leaderboard" className="hover:text-indigo-500">Leaderboard</Link></li>
              <li><Link to="/achievements" className="hover:text-indigo-500">Achievements</Link></li>
              <li><Link to="/history" className="hover:text-indigo-500">History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#features" className="hover:text-indigo-500">Features</a></li>
              <li><a href="#roadmap" className="hover:text-indigo-500">Roadmap</a></li>
              <li><a href="#faq" className="hover:text-indigo-500">FAQ</a></li>
              <li><a href="#contact" className="hover:text-indigo-500">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200/70 pt-6 text-center text-xs text-slate-400 dark:border-white/10">
          © {new Date().getFullYear()} LinuxLab. Built for students of Linux Administration & DevOps.
        </div>
      </div>
    </footer>
  );
}
