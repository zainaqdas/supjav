'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600/20 to-blue-600/20 mx-auto flex items-center justify-center mb-6 border border-white/5">
        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-white/40 mb-8 max-w-md mx-auto">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-red-600/20 transition-all duration-300 hover:-translate-y-0.5"
      >
        Try Again
      </button>
    </div>
  );
}
