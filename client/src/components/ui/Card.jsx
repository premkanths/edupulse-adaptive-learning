import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-academic-darkCard border border-slate-200/90 dark:border-academic-darkBorder rounded-2xl shadow-sm ${padding} ${
        hover
          ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-indigo-500/50 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-[#23324D] pb-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
