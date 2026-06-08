"use client";

import { useEffect } from "react";
import { Search } from "lucide-react";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import HomeSearchResults from "./HomeSearchResults";

export default function HomeSearch({
  totals,
}: {
  totals: { tools: number; pdfs: number; updates: number };
}) {
  const { searchQuery, setSearchQuery, debouncedSearch } = useSiteSearch();

  // Sync the navbar (it shares the same SearchProvider) — read query string once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    if (q && !searchQuery) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeholder = totals.pdfs
    ? `Search ${totals.pdfs.toLocaleString()} PDFs, ${totals.tools.toLocaleString()} tools…`
    : "Search tools, PDFs, updates…";

  return (
    <div className="max-w-xl mx-auto">
      <label htmlFor="home-search" className="sr-only">
        Search EduDock
      </label>
      <div className="relative flex items-center">
        <Search
          className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="home-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search EduDock"
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border/60 text-base shadow-md transition-[box-shadow,border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
        />
      </div>

      {debouncedSearch.trim() && (
        <HomeSearchResults query={debouncedSearch.trim()} />
      )}
    </div>
  );
}
