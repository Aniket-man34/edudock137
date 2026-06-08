"use client";

import { useSiteSearch } from "@/components/layout/SearchProvider";

const CHIPS = ["Class 10", "Class 12", "JEE", "NEET", "UPSC", "GATE"];

export default function AudienceChips({ className = "" }: { className?: string }) {
  const { setSearchQuery } = useSiteSearch();
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground" aria-hidden="true">
        Preparing for:
      </span>
      {CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => setSearchQuery(chip)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border/60 bg-card hover:border-primary/30 hover:text-primary transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
