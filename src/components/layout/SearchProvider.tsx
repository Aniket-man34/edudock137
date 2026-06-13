"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface SearchContextValue {
  searchQuery: string;
  debouncedSearch: string;
  setSearchQuery: (v: string) => void;

  // Hybrid category filter: direct id-match + keyword fallback against
  // titles / snippets / body text (used by the marquee → updates feed).
  activeCategoryId: string | null;
  activeCategoryName: string | null;
  setActiveCategory: (id: string | null, name: string | null) => void;
  clearActiveCategory: () => void;
}

const SearchContext = createContext<SearchContextValue>({
  searchQuery: "",
  debouncedSearch: "",
  setSearchQuery: () => {},
  activeCategoryId: null,
  activeCategoryName: null,
  setActiveCategory: () => {},
  clearActiveCategory: () => {},
});

export function useSiteSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({
  children,
  delay = 300,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const [searchQuery, setSearchQueryState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), delay);
    return () => clearTimeout(t);
  }, [searchQuery, delay]);

  const setSearchQuery = useCallback((v: string) => {
    setSearchQueryState(v);
    // Free-text typing detaches the active category pin so the user
    // isn't filtered down to an unrelated bucket.
    setActiveCategoryId(null);
    setActiveCategoryName(null);
  }, []);

  const setActiveCategory = useCallback(
    (id: string | null, name: string | null) => {
      setActiveCategoryId(id);
      setActiveCategoryName(name);
      // Mirror the chip text into the search box so the navbar input
      // and home search dropdown reflect what's filtered.
      setSearchQueryState(name ?? "");
    },
    [],
  );

  const clearActiveCategory = useCallback(() => {
    setActiveCategoryId(null);
    setActiveCategoryName(null);
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
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
