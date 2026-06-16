import React from 'react';

const StatsCard = ({ title, value, icon, description, gradientClasses = "from-indigo-500 to-purple-600" }) => {
  return (
    <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/0 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-tr ${gradientClasses} text-white shadow-md shadow-indigo-500/10`}>
          {icon}
        </div>
      </div>
      
      {description && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-1">
          {description}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
