"use client";

// ============================================================
// apps/web/app/error.tsx
// ============================================================
// Next.js App Router error boundary.
// Catches unhandled errors in page/layout components and shows
// a friendly recovery UI instead of a white screen.
//
// WHY 'use client'?
// Error boundaries in React must be class components OR use
// the special Next.js error.tsx pattern which requires 'use client'
// to access the reset() function provided by Next.js.
// ============================================================

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service in production (e.g. Sentry)
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          An unexpected error occurred. You can try refreshing or go back to the
          dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Error details (dev only)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
