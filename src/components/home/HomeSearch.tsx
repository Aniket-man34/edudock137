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
      <div className="group relative flex items-center">
        <div
          className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-1/40 via-brand-2/30 to-brand-3/40 opacity-0 blur-sm transition-opacity duration-base group-focus-within:opacity-100"
          aria-hidden="true"
        />
        <Search
          className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none z-10 transition-colors group-focus-within:text-primary"
          aria-hidden="true"
        />
        <input
          id="home-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search EduDock"
          className="relative w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border/60 text-base shadow-lg transition-[border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-transparent"
        />
      </div>

      {debouncedSearch.trim() && (
        <HomeSearchResults query={debouncedSearch.trim()} />
      )}
    </div>
  );
}
