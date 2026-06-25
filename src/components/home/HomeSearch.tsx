"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import HomeSearchResults from "./HomeSearchResults";

export default function HomeSearch({
  totals,
}: {
  totals: { tools: number; pdfs: number; updates: number };
}) {
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    addRecentSearch,
    recentSearches,
    clearRecentSearches,
  } = useSiteSearch();

  const [isFocused, setIsFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The SearchProvider now initialises from URL params directly, so the
  // previous manual `q` read here is no longer needed.

  const placeholder = totals.pdfs
    ? `Search ${totals.pdfs.toLocaleString()} PDFs, ${totals.tools.toLocaleString()} tools…`
    : "Search tools, PDFs, updates…";

  const showRecents =
    isFocused && !debouncedSearch.trim() && recentSearches.length > 0;

  const commitSearch = (term: string) => {
    const trimmed = term.trim();
    if (trimmed) addRecentSearch(trimmed);
  };

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
          onBlur={() => {
            // Delay hiding recents so a click on a suggestion registers.
            blurTimer.current = setTimeout(() => setIsFocused(false), 150);
            commitSearch(searchQuery);
          }}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setIsFocused(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitSearch(searchQuery);
          }}
          placeholder={placeholder}
          aria-label="Search EduDock"
          aria-expanded={showRecents}
          aria-controls="home-search-recents"
          className="relative w-full h-14 pl-12 pr-10 rounded-2xl bg-card border border-border/60 text-base shadow-lg transition-[border-color] duration-fast ease-out focus-visible:outline-none focus-visible:border-transparent"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-3 z-10 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showRecents && (
        <div
          id="home-search-recents"
          className="mt-2 rounded-xl glass-card-static p-2 shadow-lg"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" /> Recent searches
            </span>
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
          <ul className="mt-1">
            {recentSearches.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    addRecentSearch(term);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="truncate">{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {debouncedSearch.trim() && (
        <HomeSearchResults query={debouncedSearch.trim()} />
      )}
    </div>
  );
}
