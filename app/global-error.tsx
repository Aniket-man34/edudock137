"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-extrabold mb-4">Application error</h1>
          <p className="text-muted-foreground mb-8">
            A critical error occurred. Please reload the page.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
