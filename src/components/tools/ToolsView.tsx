"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Filter, Loader2, ArrowDownAZ, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ToolCard from "@/components/ToolCard";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import type { Tables } from "@/integrations/supabase/types";

type Tool = Tables<"tools"> & { categories?: { name: string } | null };
type Category = Tables<"categories">;

const PAGE_SIZE = 24;

type SortKey = "newest" | "popular" | "az";

const SORTS: Array<{ key: SortKey; label: string; icon: any }> = [
  { key: "popular", label: "Popular", icon: TrendingUp },
  { key: "newest", label: "Newest", icon: Sparkles },
  { key: "az", label: "A–Z", icon: ArrowDownAZ },
];

interface ToolsViewProps {
  initialTools: Tool[];
  totalCount: number;
  categories: Category[];
}

export default function ToolsView({
  initialTools,
  totalCount,
  categories,
}: ToolsViewProps) {
  const { debouncedSearch } = useSiteSearch();
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(initialTools.length < totalCount);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("popular");
  const observerTarget = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    const list = tools.filter((t) => {
      const matchSearch =
        !term ||
        t.title?.toLowerCase().includes(term) ||
        t.short_description?.toLowerCase().includes(term);
      const matchCategory =
        !activeCategoryId || t.category_id === activeCategoryId;
      return matchSearch && matchCategory;
    });
    const sorted = [...list];
    if (sort === "az") {
      sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    } else if (sort === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      );
    } else {
      sorted.sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
    }
    return sorted;
  }, [tools, debouncedSearch, activeCategoryId, sort]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.unobserve(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isFetching, page]);

  async function loadMore() {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    const nextPage = page + 1;
    const from = (nextPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("tools")
      .select("*, categories(name)")
      .order("title")
      .range(from, to);

    if (!error && data) {
      setTools((prev) => [...prev, ...(data as Tool[])]);
      setPage(nextPage);
      if (data.length < PAGE_SIZE || tools.length + data.length >= totalCount) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    setIsFetching(false);
  }

  const activeCategoryName = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)?.name
    : null;

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <span className="section-eyebrow mb-2">
          <Wrench className="h-3 w-3" aria-hidden="true" /> Directory
        </span>
        <h1 className="page-header">Study Tools</h1>
        <p className="page-subtitle">
          Hand-picked web tools that help you learn faster.
        </p>
        {totalCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length} of {totalCount}
            {activeCategoryName ? ` · ${activeCategoryName}` : ""}
          </p>
        )}
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Sort tablist */}
        <div role="tablist" aria-label="Sort tools" className="inline-flex p-1 glass-card-static rounded-xl">
          {SORTS.map(({ key, label, icon: Icon }) => {
            const isActive = sort === key;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setSort(key)}
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="tools-sort-pill"
                    className="absolute inset-0 rounded-lg gradient-brand shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {categories.length > 0 && (
          <div className="relative z-40">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 min-h-[40px] glass-card-static rounded-lg hover:shadow-md transition-all duration-fast text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-expanded={isFilterOpen}
              aria-haspopup="listbox"
            >
              <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              {activeCategoryName ?? "All Categories"}
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close filter"
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <motion.ul
                    role="listbox"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-56 rounded-xl shadow-xl glass-card-static z-40 overflow-hidden"
                  >
                    <li>
                      <button
                        type="button"
                        role="option"
                        aria-selected={activeCategoryId === null}
                        onClick={() => {
                          setActiveCategoryId(null);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                          activeCategoryId === null
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeCategoryId === cat.id}
                          onClick={() => {
                            setActiveCategoryId(cat.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                            activeCategoryId === cat.id
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.03 } },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            {filtered.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} showDescription />
            ))}
          </motion.div>

          {isFetching && (
            <div className="flex justify-center py-8" role="status" aria-live="polite">
              <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
              <span className="sr-only">Loading more tools…</span>
            </div>
          )}

          {hasMore && !isFetching && (
            <div ref={observerTarget} className="h-4" aria-hidden="true" />
          )}

          {!hasMore && filtered.length > 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              That&rsquo;s every tool in the directory.
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="glass-card-static inline-flex p-4 rounded-2xl mb-4">
            <Wrench className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mb-4">No tools match those filters.</p>
          {(activeCategoryId || debouncedSearch) && (
            <button
              type="button"
              onClick={() => setActiveCategoryId(null)}
              className="btn-secondary"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
