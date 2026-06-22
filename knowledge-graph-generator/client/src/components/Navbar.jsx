import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Network, LogOut, LayoutDashboard, MessageSquare, Compass, ShieldAlert, Sun, Moon } from 'lucide-react';

const Navbar = ({ activeDocumentId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-500/20 group-hover:border-indigo-500/50 transition-colors">
          <Network className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform" />
        </div>
        <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
          KnowledgeGraph.AI
        </span>
      </Link>

      {/* Nav Menu */}
      {user && (
        <div className="flex items-center gap-1 md:gap-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isActive('/dashboard')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {activeDocumentId && (
            <>
              <Link
                to={`/graph/${activeDocumentId}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(`/graph/${activeDocumentId}`)
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>Graph Viewer</span>
              </Link>

              <Link
                to={`/chat/${activeDocumentId}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(`/chat/${activeDocumentId}`)
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI Chat</span>
              </Link>

              <Link
                to={`/learning-path/${activeDocumentId}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(`/learning-path/${activeDocumentId}`)
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Roadmaps</span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* User settings / Action */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-300">{user.name}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700/60 hover:border-red-900/50 px-3.5 py-1.8 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-400 hover:text-slate-100 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg border border-indigo-500/40 shadow-lg shadow-indigo-600/10 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
