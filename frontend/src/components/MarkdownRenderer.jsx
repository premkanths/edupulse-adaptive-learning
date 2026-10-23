import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`markdown-content text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-50 mt-4 mb-2 pb-1 border-b border-gray-100 dark:border-gray-800" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mt-3.5 mb-2 flex items-center gap-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-3 mb-1.5" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-200" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-950 dark:text-gray-100" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-700 dark:text-gray-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 mb-2.5 text-gray-800 dark:text-gray-200" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 mb-2.5 text-gray-800 dark:text-gray-200" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-2.5 my-3 rounded-r-xl text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 font-medium italic shadow-xs" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl overflow-x-auto font-mono text-xs my-3 border border-slate-800 shadow-sm leading-normal">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-gray-200/80 dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border border-gray-300/60 dark:border-gray-700" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }) => (
            <div className="overflow-hidden my-3 rounded-xl border border-slate-800 shadow-md">
              <div className="bg-slate-950 px-3 py-1.5 text-[10px] font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Code Example / Syntax</span>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-3.5 overflow-x-auto font-mono text-xs leading-normal" {...props}>
                {children}
              </pre>
            </div>
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-t border-gray-200 dark:border-gray-800 my-4" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <table className="w-full text-xs text-left border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-gray-100 dark:bg-gray-800/90 font-bold p-2.5 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="p-2.5 border-t border-gray-100 dark:border-gray-800/60 text-gray-700 dark:text-gray-300" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
