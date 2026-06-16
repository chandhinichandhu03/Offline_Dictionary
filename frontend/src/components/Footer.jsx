import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md transition-colors duration-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs">
            L
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            LexiLearn
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          &copy; {new Date().getFullYear()} LexiLearn. All rights reserved. Made for Offline Language Learning.
        </p>
        <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Offline Mode Active
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
