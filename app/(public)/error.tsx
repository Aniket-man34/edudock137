"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({
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
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="glass-card-static inline-flex p-8 rounded-3xl mb-6">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold gradient-text">
          Something broke
        </h1>
      </div>
      <p className="mb-8 text-muted-foreground max-w-md">
        We hit a snag rendering this page. Try again, or head home and we'll
        sort ourselves out.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back home
        </Link>
      </div>
    </div>
  );
}
