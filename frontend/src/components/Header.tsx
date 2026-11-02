import React, { useState } from 'react';
import { Code2, Menu, Moon, Plus, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onNavigateHome?: () => void;
  onNavigateCreate?: () => void;
  onNavigateAbout?: () => void;
  onNewPaste?: () => void;
  showNewButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
  onNavigateCreate,
  onNavigateAbout,
  onNewPaste,
  showNewButton = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const create = onNavigateCreate ?? onNewPaste;

  const navigate = (callback?: () => void) => {
    setMenuOpen(false);
    callback?.();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="page-container flex h-16 items-center justify-between">
        <button type="button" onClick={() => navigate(onNavigateHome ?? onNewPaste)} className="flex items-center gap-3 text-left" aria-label="Go to CodeShare home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20"><Code2 className="h-5 w-5" /></span>
          <span>
            <span className="block text-base font-bold tracking-tight text-slate-950 dark:text-white">CodeShare</span>
            <span className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">Share text. Share code. Keep it temporary.</span>
          </span>
        </button>

        <nav className={`${menuOpen ? 'absolute left-0 right-0 top-16 border-b border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-950' : 'hidden'} md:static md:block md:border-0 md:bg-transparent md:p-0 md:shadow-none`} aria-label="Main navigation">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
            <button type="button" onClick={() => navigate(onNavigateHome)} className="nav-link">Home</button>
            <button type="button" onClick={() => navigate(create)} className="nav-link">Create Paste</button>
            <button type="button" onClick={() => navigate(onNavigateAbout)} className="nav-link">About</button>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden lg:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <span className="hidden rounded-lg bg-amber-500/10 px-2.5 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 lg:inline">24h Expiry</span>
          {showNewButton && create && <button type="button" onClick={() => navigate(create)} className="button-primary hidden px-3 py-2 text-xs sm:flex"><Plus className="h-4 w-4" /> New Paste</button>}
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="icon-button md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
