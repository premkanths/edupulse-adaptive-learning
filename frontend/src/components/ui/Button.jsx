import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, destructive, ghost, teal
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:ring-indigo-500',
    secondary: 'bg-white/90 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-800 dark:text-gray-50 border border-gray-200 dark:border-gray-700/80 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 focus:ring-indigo-400',
    outline: 'border border-indigo-200 dark:border-indigo-800/80 bg-transparent hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 focus:ring-indigo-400',
    destructive: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800/80 text-gray-600 dark:text-gray-300 focus:ring-indigo-400',
    teal: 'bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:ring-teal-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
    </button>
  );
};
