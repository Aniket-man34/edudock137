"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SearchContextValue {
  searchQuery: string;
  debouncedSearch: string;
  setSearchQuery: (v: string) => void;
}

const SearchContext = createContext<SearchContextValue>({
  searchQuery: "",
  debouncedSearch: "",
  setSearchQuery: () => {},
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), delay);
    return () => clearTimeout(t);
  }, [searchQuery, delay]);

  return (
    <SearchContext.Provider value={{ searchQuery, debouncedSearch, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}
