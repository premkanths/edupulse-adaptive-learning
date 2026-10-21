import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950/70 transition-colors relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/95 dark:bg-gray-900 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-gray-800 text-center space-y-5 shadow-2xl relative z-10">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">Page Not Found (404)</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The requested page does not exist in EduPulse.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Home
        </Link>
      </div>
    </div>
  );
};
