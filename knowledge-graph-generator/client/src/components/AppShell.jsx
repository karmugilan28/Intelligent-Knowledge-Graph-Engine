import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Network, LogOut, LayoutDashboard, MessageSquare, Compass, Menu, X, Sun, Moon } from 'lucide-react';

const AppShell = ({ children, activeDocumentId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Synchronize and apply theme classes on mount and updates
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

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

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    const basePath = path.split('/')[1];
    return location.pathname.startsWith(`/${basePath}`);
  };

  // Dynamically extract documentId from URL if lost in state (e.g. after refresh)
  const urlMatch = location.pathname.match(/\/(?:graph|chat|learning-path)\/([^\/]+)/);
  const docId = activeDocumentId || (urlMatch ? urlMatch[1] : null);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, requiresDoc: false },
    { name: 'Graph Viewer', path: docId ? `/graph/${docId}` : '#', icon: Network, requiresDoc: true },
    { name: 'AI Chat', path: docId ? `/chat/${docId}` : '#', icon: MessageSquare, requiresDoc: true },
    { name: 'Roadmaps', path: docId ? `/learning-path/${docId}` : '#', icon: Compass, requiresDoc: true },
  ];

  const avatarChar = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased font-sans relative overflow-hidden w-full transition-colors duration-200">
      {/* Sidebar for Desktop (Persistent & Fixed) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] z-30 transition-colors duration-200 shadow-xl shadow-black/10">
        {/* Brand Logo & Header */}
        <div className="p-6 border-b border-[var(--border-primary)]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
              KnowledgeGraph.AI
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => {
            const showLink = !link.requiresDoc || docId;
            if (!showLink) return null;
            const active = isActive(link.path);
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-lg ${
                  active
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <link.icon className={`w-4 h-4`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: User Details, Theme Switcher & Logout */}
        <div className="p-5 border-t border-[var(--border-primary)] flex flex-col gap-3 bg-[var(--bg-sidebar)] transition-colors duration-200 mb-4">
          <div className="flex flex-col gap-3.5 bg-white/[0.03] dark:bg-white/[0.01] border border-[var(--border-primary)] p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full bg-foundational/10 border border-foundational/30 text-foundational font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                {avatarChar}
              </div>
              {/* User Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.name || 'bhuvanesh'}</span>
                <span className="text-[9px] text-[var(--text-secondary)] truncate">{user?.email}</span>
              </div>
            </div>
            
            {/* Theme Toggle row */}
            <div className="flex items-center justify-between border-t border-[var(--border-primary)] pt-3 mt-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">Theme Mode</span>
              <button
                onClick={toggleTheme}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--color-foundational)] text-[var(--text-secondary)] hover:text-[var(--color-foundational)] transition-all duration-300 cursor-pointer text-[10px] font-bold"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[var(--color-intermediate)] group-active:rotate-90 group-active:scale-90 transition-transform duration-300" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[var(--color-foundational)] group-active:-rotate-12 group-active:scale-90 transition-transform duration-300" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[var(--bg-card)] hover:bg-rose-500/10 hover:text-rose-500 border border-[var(--border-primary)] hover:border-rose-500/30 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Top Header */}
      <div className="md:hidden w-full h-16 fixed top-0 left-0 bg-[var(--bg-sidebar)] border-b border-[var(--border-primary)] px-6 flex items-center justify-between z-40 transition-colors duration-200">
        <Link to="/" className="flex items-center gap-2.5">
          <Network className="w-5 h-5 text-foundational" />
          <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">
            KnowledgeGraph.AI
          </span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] cursor-pointer"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation (Slide-in) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          
          <aside className="relative flex flex-col w-64 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)] z-40 p-6 pt-20 transition-colors duration-200">
            <nav className="flex-1 flex flex-col gap-2">
              {navLinks.map((link) => {
                const showLink = !link.requiresDoc || docId;
                if (!showLink) return null;
                const active = isActive(link.path);
                
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all duration-300 ease-out border-l-2 rounded-r-lg ${
                      active
                        ? 'border-[var(--color-foundational)] text-[var(--color-foundational)] bg-[var(--color-foundational)]/5'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] border-transparent'
                    }`}
                  >
                    <link.icon className={`w-4.5 h-4.5 transition-colors duration-300 ${active ? 'text-[var(--color-foundational)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--color-foundational)]'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col gap-3 border-t border-[var(--border-primary)] pt-6 mb-4">
              <div className="flex flex-col gap-3.5 bg-white/[0.03] dark:bg-white/[0.01] border border-[var(--border-primary)] p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-foundational/10 border border-foundational/30 text-foundational font-extrabold flex items-center justify-center shrink-0">
                    {avatarChar}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.name || 'bhuvanesh'}</span>
                    <span className="text-[9px] text-[var(--text-secondary)] truncate">{user?.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-[var(--border-primary)] pt-3 mt-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">Theme Mode</span>
                  <button
                    onClick={toggleTheme}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--color-foundational)] text-[var(--text-secondary)] hover:text-[var(--color-foundational)] transition-all duration-300 cursor-pointer text-[10px] font-bold"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--color-intermediate)] group-active:rotate-90 group-active:scale-90 transition-transform duration-300" /> : <Moon className="w-4 h-4 text-[var(--color-foundational)] group-active:-rotate-12 group-active:scale-90 transition-transform duration-300" />}
                    <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-[var(--bg-card)] hover:bg-rose-500/10 hover:text-rose-500 border border-[var(--border-primary)] py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main View Container */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-64 overflow-x-hidden w-full bg-[var(--bg-primary)] transition-colors duration-200">
        {children}
      </div>
    </div>
  );
};

export default AppShell;
