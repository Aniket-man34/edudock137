"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import type { Tables } from "@/integrations/supabase/types";

type Pdf = Tables<"pdfs"> & { categories?: { name: string } | null };
type Category = Tables<"categories">;

const PAGE_SIZE = 12;

interface PdfsViewProps {
  initialPdfs: Pdf[];
  totalCount: number;
  categories: Category[];
}

function isNewPdf(createdAt: string | null) {
  if (!createdAt) return false;
  const diffDays = Math.ceil(
    Math.abs(Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= 7;
}

export default function PdfsView({
  initialPdfs,
  totalCount,
  categories,
}: PdfsViewProps) {
  const { debouncedSearch } = useSiteSearch();
  const [pdfs, setPdfs] = useState<Pdf[]>(initialPdfs);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(initialPdfs.length < totalCount);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    return pdfs.filter((p) => {
      const matchSearch =
        !term ||
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term);
      const matchCategory = !activeCategoryId || p.category_id === activeCategoryId;
      return matchSearch && matchCategory;
    });
  }, [pdfs, debouncedSearch, activeCategoryId]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) loadMore();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-header">PDF Library</h1>
        <p className="page-subtitle">
          Free study materials, books, and notes — download and learn.
        </p>
        {totalCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {pdfs.length} of {totalCount} PDFs
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
          <div className="flex flex-col md:flex-row md:flex-wrap gap-6">
            {filtered.map((pdf, i) => (
              <motion.div
                key={pdf.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="flex flex-row gap-4 items-center w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] cursor-pointer group"
              >
                <Link
                  href={`/pdfs/${pdf.slug || pdf.id}`}
                  className="contents"
                  aria-label={`View ${pdf.title}`}
                >
                  <div className="relative w-24 md:w-28 shrink-0">
                    {isNewPdf(pdf.created_at) && (
                      <div className="absolute -top-1.5 -left-1.5 z-30">
                        <span className="relative flex h-5 w-12 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-30" />
                          <span className="relative inline-flex rounded-full h-5 w-12 items-center justify-center bg-primary border border-primary/40 text-[9px] font-bold text-primary-foreground uppercase tracking-wider shadow-lg">
                            New
                          </span>
                        </span>
                      </div>
                    )}
                    {pdf.cover_image_url ? (
                      <img
                        src={pdf.cover_image_url}
                        alt={pdf.title}
                        className="w-full aspect-[2/3] object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300 ring-1 ring-border/30"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted rounded-lg shadow-md ring-1 ring-border/30">
                        <BookOpen className="h-6 w-6 text-primary/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-center min-w-0">
                    <h3 className="font-bold text-sm md:text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {pdf.title}
                    </h3>
                    {pdf.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {pdf.description}
                      </p>
                    )}
                    {pdf.created_at && (
                      <span className="text-[11px] text-muted-foreground mt-1">
                        {new Date(pdf.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

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
              You&rsquo;ve reached the end of PDFs.
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="glass-card-static inline-flex p-4 rounded-2xl mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p>No PDFs found.</p>
        </div>
      )}
    </div>
  );
}
