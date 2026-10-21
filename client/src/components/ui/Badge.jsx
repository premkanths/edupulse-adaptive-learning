import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default, success, warning, danger, info, teal, indigo, purple
  size = 'md', // sm, md
  className = '',
  icon: Icon,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80 shadow-xs',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80 shadow-xs',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80 shadow-xs',
    info: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80 shadow-xs',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80 shadow-xs',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80 shadow-xs',
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/80 shadow-xs',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-colors ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 text-current shrink-0" />}
      {children}
    </span>
  );
};
