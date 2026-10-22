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
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs ${padding} ${
        hover
          ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5'
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
    <div className={`flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
