import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: {
      border: 'hover:border-indigo-500/50',
      iconBg: 'bg-indigo-600 text-white shadow-xs'
    },
    teal: {
      border: 'hover:border-teal-500/50',
      iconBg: 'bg-teal-600 text-white shadow-xs'
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-600 text-white shadow-xs'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500 text-white shadow-xs'
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-600 text-white shadow-xs'
    },
    indigo: {
      border: 'hover:border-indigo-500/50',
      iconBg: 'bg-indigo-600 text-white shadow-xs'
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${scheme.border}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-50">{value}</span>
        {trend && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};
