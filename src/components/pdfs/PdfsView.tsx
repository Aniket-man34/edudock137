"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Filter, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import type { Tables } from "@/integrations/supabase/types";

type Pdf = Tables<"pdfs"> & { categories?: { name: string } | null };
type Category = Tables<"categories">;

const PAGE_SIZE = 18;

type SortKey = "newest" | "popular";

const SORTS: Array<{ key: SortKey; label: string; icon: any }> = [
  { key: "newest", label: "Newest", icon: Sparkles },
  { key: "popular", label: "Popular", icon: TrendingUp },
];

interface PdfsViewProps {
  initialPdfs: Pdf[];
  totalCount: number;
  categories: Category[];
}

function isNewPdf(createdAt: string | null) {
  if (!createdAt) return false;
  const diffDays = Math.ceil(
    Math.abs(Date.now() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return diffDays <= 7;
}

export default function PdfsView({
  initialPdfs,
  totalCount,
  categories,
}: PdfsViewProps) {
  const { debouncedSearch, setSearchQuery } = useSiteSearch();
  const [pdfs, setPdfs] = useState<Pdf[]>(initialPdfs);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(initialPdfs.length < totalCount);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const observerTarget = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    const list = pdfs.filter((p) => {
      const matchSearch =
        !term ||
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term);
      const matchCategory =
        !activeCategoryId || p.category_id === activeCategoryId;
      return matchSearch && matchCategory;
    });
    const sorted = [...list];
    if (sort === "popular") {
      sorted.sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      );
    }
    return sorted;
  }, [pdfs, debouncedSearch, activeCategoryId, sort]);

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
      .from("pdfs")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setPdfs((prev) => [...prev, ...(data as Pdf[])]);
      setPage(nextPage);
      if (data.length < PAGE_SIZE || pdfs.length + data.length >= totalCount) {
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
          <BookOpen className="h-3 w-3" aria-hidden="true" /> Free downloads
        </span>
        <h1 className="page-header">PDF Library</h1>
        <p className="page-subtitle">
          Free study materials, books, and notes — download in one tap.
        </p>
        {totalCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length} of {totalCount}
            {activeCategoryName ? ` · ${activeCategoryName}` : ""}
          </p>
        )}
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div role="tablist" aria-label="Sort PDFs" className="inline-flex p-1 glass-card-static rounded-xl">
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
                    layoutId="pdfs-sort-pill"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((pdf, i) => (
              <motion.article
                key={pdf.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(i * 0.03, 0.36),
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group glass-card-static gradient-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-primary/30 transition-[transform,box-shadow,border-color] duration-fast ease-out motion-reduce:hover:translate-y-0"
              >
                <Link
                  href={`/pdfs/${pdf.slug || pdf.id}`}
                  aria-label={pdf.title ?? "View PDF"}
                  className="flex flex-row gap-4 p-4 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-2xl"
                >
                  <div className="relative w-24 md:w-28 shrink-0">
                    {isNewPdf(pdf.created_at) && (
                      <span className="absolute -top-1.5 -left-1.5 z-30 inline-flex items-center justify-center h-5 px-2 rounded-full bg-primary text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md motion-safe:animate-glow-pulse">
                        New
                      </span>
                    )}
                    {pdf.cover_image_url ? (
                      <img
                        src={pdf.cover_image_url}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="w-full aspect-[2/3] object-cover rounded-lg shadow-md ring-1 ring-border/30 transition-transform duration-base ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted rounded-lg shadow-md ring-1 ring-border/30">
                        <BookOpen className="h-6 w-6 text-primary/40" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-center min-w-0">
                    <h2 className="font-bold text-sm md:text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {pdf.title}
                    </h2>
                    {pdf.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {pdf.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      {pdf.created_at && (
                        <time dateTime={pdf.created_at}>
                          {new Date(pdf.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      )}
                      {pdf.categories?.name && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{pdf.categories.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {isFetching && (
            <div className="flex justify-center py-8" role="status" aria-live="polite">
              <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
              <span className="sr-only">Loading more PDFs…</span>
            </div>
          )}

          {hasMore && !isFetching && (
            <div ref={observerTarget} className="h-4" aria-hidden="true" />
          )}

          {!hasMore && filtered.length > 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              That&rsquo;s every PDF in the library.
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="glass-card-static inline-flex p-4 rounded-2xl mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mb-4">No PDFs match those filters.</p>
          {(activeCategoryId || debouncedSearch) && (
            <button
              type="button"
              onClick={() => {
                setActiveCategoryId(null);
                setSearchQuery("");
              }}
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
