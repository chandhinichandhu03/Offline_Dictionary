import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/search', label: 'Search' },
    { path: '/analyze-sentence', label: 'Sentence' },
    { path: '/analyze-grammar', label: 'Grammar' },
    { path: '/practice', label: 'Practice' },
  ];

  if (isAuthenticated) {
    navLinks.push({ path: '/favorites', label: 'Favorites' });
    navLinks.push({ path: '/dashboard', label: 'Dashboard' });
    if (isAdmin) {
      navLinks.push({ path: '/admin', label: 'Admin' });
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/75 backdrop-blur-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                L
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 group-hover:from-indigo-500 group-hover:to-purple-500 transition-colors duration-300">
                LexiLearn
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {user?.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors duration-200"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4.5 py-2 text-sm font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/10 active:scale-98 transition-all"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <hr className="border-slate-100 dark:border-slate-800/80 my-2" />
          {isAuthenticated ? (
            <div className="space-y-1 pt-1">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold">{user?.full_name}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-base font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/10"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
