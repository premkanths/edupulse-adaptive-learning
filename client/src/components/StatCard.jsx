import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: {
      bg: 'bg-gradient-to-br from-indigo-500/15 to-sky-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800/80',
      glow: 'group-hover:border-indigo-400 dark:group-hover:border-indigo-500/50',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/20'
    },
    teal: {
      bg: 'bg-gradient-to-br from-teal-500/15 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-200/80 dark:border-teal-800/80',
      glow: 'group-hover:border-teal-400 dark:group-hover:border-teal-500/50',
      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20'
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80',
      glow: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-500/50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/80',
      glow: 'group-hover:border-amber-400 dark:group-hover:border-amber-500/50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-500/15 to-red-500/10 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/80',
      glow: 'group-hover:border-rose-400 dark:group-hover:border-rose-500/50',
      iconBg: 'bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-md shadow-rose-500/20'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-500/15 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800/80',
      glow: 'group-hover:border-indigo-400 dark:group-hover:border-indigo-500/50',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`group relative bg-white/95 dark:bg-[#0F1626]/95 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 ${scheme.glow}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
        {trend && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};
