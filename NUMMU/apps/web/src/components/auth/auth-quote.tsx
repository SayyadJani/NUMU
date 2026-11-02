import React from 'react';

interface AuthQuoteProps {
  quote: string;
  author: string;
  className?: string;
}

export function AuthQuote({ quote, author, className = '' }: AuthQuoteProps) {
  return (
    <div className={`relative pl-4 border-l-2 border-emerald-600 text-left ${className}`}>
      <p className="text-sm font-medium text-slate-700 italic leading-relaxed">
        “{quote}”
      </p>
      <p className="text-xs font-semibold text-slate-500 mt-1">
        — {author}
      </p>
    </div>
  );
}
