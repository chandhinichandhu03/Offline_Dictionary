import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-300 group shadow-sm focus:outline-none"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun Icon */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-amber-500 transform transition-transform duration-500 ease-out ${
            isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 6.364A9 9 0 1111 3v1a8 8 0 000 16v1z"
          />
        </svg>
        {/* Moon Icon */}
        <svg
          className={`absolute inset-0 w-5 h-5 text-indigo-600 dark:text-indigo-400 transform transition-transform duration-500 ease-out ${
            isDark ? '-rotate-90 scale-0' : 'rotate-0 scale-100'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle;
