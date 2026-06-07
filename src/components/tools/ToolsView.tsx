"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ToolCard from "@/components/ToolCard";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import type { Tables } from "@/integrations/supabase/types";

type Tool = Tables<"tools"> & { categories?: { name: string } | null };
type Category = Tables<"categories">;

const PAGE_SIZE = 12;

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
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter view
  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    return tools.filter((t) => {
      const matchSearch =
        !term ||
        t.title?.toLowerCase().includes(term) ||
        t.short_description?.toLowerCase().includes(term);
      const matchCategory = !activeCategoryId || t.category_id === activeCategoryId;
      return matchSearch && matchCategory;
    });
  }, [tools, debouncedSearch, activeCategoryId]);

  // Load more
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          loadMore();
        }
      },
      { threshold: 0.1 }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-header">All Tools</h1>
        <p className="page-subtitle">
          Browse our curated collection of educational tools
        </p>
        {totalCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {tools.length} of {totalCount} tools
          </p>
        )}
      </motion.div>

      {categories.length > 0 && (
        <div className="relative mb-6 z-40">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 glass-card-static rounded-lg hover:shadow-md transition-all text-sm font-medium"
            aria-expanded={isFilterOpen}
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
            {activeCategoryId
              ? categories.find((c) => c.id === activeCategoryId)?.name
              : "All Categories"}
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsFilterOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-56 rounded-xl shadow-xl glass-card-static z-40 overflow-hidden"
                >
                  <div className="max-h-[50vh] overflow-y-auto py-1">
                    <button
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
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
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
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.03 } },
            }}
            className="flex flex-wrap gap-3"
          >
            {filtered.map((tool, i) => (
              <div
                key={tool.id}
                className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)]"
              >
                <ToolCard tool={tool} index={i} />
              </div>
            ))}
          </motion.div>

          {isFetching && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {hasMore && !isFetching && (
            <div ref={observerTarget} className="h-4" aria-hidden="true" />
          )}

          {!hasMore && filtered.length > 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              You&rsquo;ve reached the end of tools.
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="glass-card-static inline-flex p-4 rounded-2xl mb-4">
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>
          <p>No tools found.</p>
        </div>
      )}
    </div>
  );
}
