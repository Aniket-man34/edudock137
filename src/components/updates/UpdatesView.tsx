"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Filter, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import type { Tables } from "@/integrations/supabase/types";

const PAGE_SIZE = 20;

type Category = Tables<"categories">;

type SortKey = "newest" | "popular";

const SORTS: Array<{ key: SortKey; label: string; icon: any }> = [
  { key: "newest", label: "Newest", icon: Sparkles },
  { key: "popular", label: "Popular", icon: TrendingUp },
];

interface UpdateRow {
  id: string;
  title: string;
  slug: string | null;
  image_url: string | null;
  created_at: string;
  external_url?: string | null;
  clicks?: number | null;
  category_id?: string | null;
  content?: string | null;
  meta_description?: string | null;
}

interface UpdatesViewProps {
  initialUpdates: UpdateRow[];
  totalCount: number;
  categories: Category[];
}

function isNew(createdAt: string) {
  if (!createdAt) return false;
  const diffDays = Math.ceil(
    Math.abs(Date.now() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return diffDays <= 7;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UpdatesView({
  initialUpdates,
  totalCount,
  categories,
}: UpdatesViewProps) {
  const {
    debouncedSearch,
    activeCategoryId: pinnedCategoryId,
    activeCategoryName: pinnedCategoryName,
    setActiveCategory,
    clearActiveCategory,
  } = useSiteSearch();
  const [updates, setUpdates] = useState<UpdateRow[]>(initialUpdates);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(initialUpdates.length < totalCount);
  const [sort, setSort] = useState<SortKey>("newest");
  const [localCategoryId, setLocalCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Effective filter category — pinned by marquee click takes precedence,
  // otherwise the local dropdown selection drives filtering.
  const activeCategoryId = pinnedCategoryId ?? localCategoryId;
  const activeCategoryName =
    pinnedCategoryName ??
    (localCategoryId
      ? categories.find((c) => c.id === localCategoryId)?.name ?? null
      : null);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    const keyword = (activeCategoryName ?? "").toLowerCase().trim();

    const list = updates.filter((u) => {
      // Search box: scan title, snippet, content body.
      const haystack = [
        u.title,
        u.meta_description ?? "",
        u.content ?? "",
      ]
        .join(" ")
        .toLowerCase();
      const matchSearch = !term || haystack.includes(term);

      // Hybrid category match: direct id OR keyword fallback inside body text.
      let matchCategory = true;
      if (activeCategoryId) {
        const idHit = u.category_id === activeCategoryId;
        const keywordHit = keyword.length > 1 && haystack.includes(keyword);
        matchCategory = idHit || keywordHit;
      }

      return matchSearch && matchCategory;
    });
    const sorted = [...list];
    if (sort === "popular") {
      sorted.sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return sorted;
  }, [updates, debouncedSearch, sort, activeCategoryId, activeCategoryName]);

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
      .from("updates")
      .select(
        "id, title, slug, image_url, created_at, external_url, clicks, category_id, content, meta_description",
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setUpdates((prev) => [...prev, ...(data as UpdateRow[])]);
      setPage(nextPage);
      if (data.length < PAGE_SIZE || updates.length + data.length >= totalCount) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    setIsFetching(false);
  }

  const activeCategoryLabel = activeCategoryName;

  const selectCategory = (id: string | null) => {
    if (id === null) {
      clearActiveCategory();
      setLocalCategoryId(null);
    } else {
      const name = categories.find((c) => c.id === id)?.name ?? null;
      setActiveCategory(id, name);
      setLocalCategoryId(id);
    }
    setIsFilterOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="page-header">Latest Updates</h1>
        <p className="page-subtitle">
          Fresh news, alerts, and resources for students.
        </p>
        {totalCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length} of {totalCount}
            {activeCategoryLabel ? ` · ${activeCategoryLabel}` : ""}
          </p>
        )}
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div role="tablist" aria-label="Sort updates" className="inline-flex p-1 glass-card-static rounded-xl">
          {SORTS.map(({ key, label, icon: Icon }) => {
            const isActive = sort === key;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setSort(key)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
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
              {activeCategoryLabel ?? "All Categories"}
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
                        onClick={() => selectCategory(null)}
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
                          onClick={() => selectCategory(cat.id)}
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
              show: { transition: { staggerChildren: 0.04 } },
            }}
            className="flex flex-col gap-4 max-w-4xl mx-auto"
          >
            {filtered.map((u) => (
              <UpdateRowCard key={u.id} update={u} />
            ))}
          </motion.div>

          {isFetching && (
            <div className="flex justify-center py-8" role="status" aria-live="polite">
              <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
              <span className="sr-only">Loading more updates…</span>
            </div>
          )}

          {hasMore && !isFetching && (
            <div ref={observerTarget} className="h-4" aria-hidden="true" />
          )}

          {!hasMore && filtered.length > 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              You&rsquo;re all caught up.
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="glass-card-static inline-flex p-4 rounded-2xl mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mb-4">No updates match those filters.</p>
          {(activeCategoryId || debouncedSearch) && (
            <button
              type="button"
              onClick={() => selectCategory(null)}
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

function UpdateRowCard({ update }: { update: UpdateRow }) {
  const isExternal = !!update.external_url;
  const href = isExternal
    ? (update.external_url as string)
    : `/updates/${update.slug || update.id}`;

  const linkProps = isExternal
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { href };

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className="group glass-card-static rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:border-primary/30 transition-[transform,box-shadow,border-color] duration-fast ease-out motion-reduce:hover:translate-y-0"
    >
      {isExternal ? (
        <a
          {...linkProps}
          className="flex flex-row gap-4 p-4 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-2xl"
          aria-label={`${update.title} (opens external site)`}
        >
          <UpdateBody update={update} />
        </a>
      ) : (
        <Link
          {...linkProps}
          className="flex flex-row gap-4 p-4 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-2xl"
          aria-label={update.title}
        >
          <UpdateBody update={update} />
        </Link>
      )}
    </motion.article>
  );
}

function UpdateBody({ update }: { update: UpdateRow }) {
  return (
    <>
      <div className="w-32 sm:w-44 aspect-video bg-muted overflow-hidden rounded-xl shrink-0 ring-1 ring-border/30">
        {update.image_url ? (
          <img
            src={update.image_url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-base ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-primary/40" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-foreground font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {update.title}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          {isNew(update.created_at) && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded">
              New
            </span>
          )}
          <time
            dateTime={update.created_at}
            className="text-xs text-muted-foreground font-medium"
          >
            {formatDate(update.created_at)}
          </time>
        </div>
      </div>
    </>
  );
}
