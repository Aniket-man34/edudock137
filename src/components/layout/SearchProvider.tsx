"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * SearchProvider
 * --------------
 * Two INDEPENDENT pieces of state:
 *   1. `searchQuery` / `debouncedSearch` — free-text typed by the user.
 *   2. `activeCategoryId` / `activeCategoryName` — a category chip the user
 *      selected.
 *
 * These are deliberately decoupled: selecting a category NEVER populates the
 * search input, and typing a search query NEVER clears the active category.
 * Both filters are AND-combined by the consuming views.
 *
 * Both states are mirrored to URL search params (`?category=…&q=…`) so that
 * filters are shareable, bookmarkable, and survive a page refresh.
 */

const RECENT_SEARCHES_KEY = "edudock:recent-searches";
const MAX_RECENT = 6;

interface SearchContextValue {
  searchQuery: string;
  debouncedSearch: string;
  setSearchQuery: (v: string) => void;

  activeCategoryId: string | null;
  activeCategoryName: string | null;
  setActiveCategory: (id: string | null, name: string | null) => void;
  clearActiveCategory: () => void;

  /** Clear both the search query and the active category. */
  clearAllFilters: () => void;

  /** Recently typed search terms, persisted to localStorage. */
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextValue>({
  searchQuery: "",
  debouncedSearch: "",
  setSearchQuery: () => {},
  activeCategoryId: null,
  activeCategoryName: null,
  setActiveCategory: () => {},
  clearActiveCategory: () => {},
  clearAllFilters: () => {},
  recentSearches: [],
  addRecentSearch: () => {},
  clearRecentSearches: () => {},
});

export function useSiteSearch() {
  return useContext(SearchContext);
}

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function SearchProvider({
  children,
  delay = 300,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialise from URL params so a refresh / shared link restores filters.
  const [searchQuery, setSearchQueryState] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => searchParams.get("category") ?? null,
  );
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(
    null,
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Hydrate recent searches on mount (client-only).
  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  // Debounce the search query.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), delay);
    return () => clearTimeout(t);
  }, [searchQuery, delay]);

  // Keep the URL in sync with the current filters without triggering a full
  // navigation. We use `router.replace` so the history isn't polluted.
  const urlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    urlSyncTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) params.set("q", searchQuery);
      else params.delete("q");
      if (activeCategoryId) params.set("category", activeCategoryId);
      else params.delete("category");
      const qs = params.toString();
      const next = qs ? `${pathname}?${qs}` : pathname;
      router.replace(next, { scroll: false });
    }, 150);
    return () => {
      if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeCategoryId, pathname]);

  /**
   * Set the free-text search query.
   * NOTE: This does NOT touch the active category — the two are independent.
   */
  const setSearchQuery = useCallback((v: string) => {
    setSearchQueryState(v);
  }, []);

  /**
   * Set the active category filter.
   * NOTE: This does NOT populate the search input — the two are independent.
   */
  const setActiveCategory = useCallback(
    (id: string | null, name: string | null) => {
      setActiveCategoryId(id);
      setActiveCategoryName(name);
    },
    [],
  );

  const clearActiveCategory = useCallback(() => {
    setActiveCategoryId(null);
    setActiveCategoryName(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQueryState("");
    setDebouncedSearch("");
    setActiveCategoryId(null);
    setActiveCategoryName(null);
  }, []);

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(
        0,
        MAX_RECENT,
      );
      writeRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    writeRecentSearches([]);
    setRecentSearches([]);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        debouncedSearch,
        setSearchQuery,
        activeCategoryId,
        activeCategoryName,
        setActiveCategory,
        clearActiveCategory,
        clearAllFilters,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
