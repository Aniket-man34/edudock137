"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSearch } from "@/components/layout/SearchProvider";

const PAGE_SIZE = 20;

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
}

interface UpdatesViewProps {
  initialUpdates: UpdateRow[];
  totalCount: number;
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
}: UpdatesViewProps) {
  const { debouncedSearch } = useSiteSearch();
  const [updates, setUpdates] = useState<UpdateRow[]>(initialUpdates);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(initialUpdates.length < totalCount);
  const [sort, setSort] = useState<SortKey>("newest");
  const observerTarget = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    const list = term
      ? updates.filter((u) => u.title?.toLowerCase().includes(term))
      : updates;
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
  }, [updates, debouncedSearch, sort]);

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
      .select("id, title, slug, image_url, created_at, external_url, clicks")
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
      </motion.div>

      <div role="tablist" aria-label="Sort updates" className="inline-flex p-1 glass-card-static rounded-xl mb-6">
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
          <p>No updates match your search yet.</p>
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
