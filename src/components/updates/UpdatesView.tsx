"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSearch } from "@/components/layout/SearchProvider";

const PAGE_SIZE = 20;

interface UpdateRow {
  id: string;
  title: string;
  slug: string | null;
  image_url: string | null;
  created_at: string;
  external_url?: string | null;
}

interface UpdatesViewProps {
  initialUpdates: UpdateRow[];
  totalCount: number;
}

function isNew(createdAt: string) {
  if (!createdAt) return false;
  const diffDays = Math.ceil(
    Math.abs(Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
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
  const observerTarget = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    if (!term) return updates;
    return updates.filter((u) => u.title?.toLowerCase().includes(term));
  }, [updates, debouncedSearch]);

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
      .from("updates")
      .select("id, title, slug, image_url, created_at, external_url")
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
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-header">Latest Updates</h1>
        <p className="page-subtitle">
          Stay informed with the latest news, alerts and resources.
        </p>
      </motion.div>

      {filtered.length > 0 ? (
        <>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } },
            }}
            className="flex flex-col gap-5 max-w-4xl mx-auto"
          >
            {filtered.map((u) => (
              <UpdateRow key={u.id} update={u} />
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
              You&rsquo;re all caught up.
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="glass-card-static inline-flex p-4 rounded-2xl mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p>No updates found.</p>
        </div>
      )}
    </div>
  );
}

function UpdateRow({ update }: { update: UpdateRow }) {
  const isExternal = !!update.external_url;
  const href = isExternal
    ? (update.external_url as string)
    : `/updates/${update.slug || update.id}`;

  const Tag: any = isExternal ? "a" : Link;
  const linkProps = isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
      whileHover={{ y: -2 }}
      className="group glass-card-static rounded-2xl overflow-hidden"
    >
      <Tag
        {...linkProps}
        className="flex flex-row gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
      >
        <div className="w-32 sm:w-44 aspect-video bg-muted overflow-hidden rounded-xl shrink-0 ring-1 ring-border/30">
          {update.image_url ? (
            <img
              src={update.image_url}
              alt={update.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {update.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {isNew(update.created_at) && (
              <span className="bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded">
                NEW
              </span>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {formatDate(update.created_at)}
            </span>
          </div>
        </div>
      </Tag>
    </motion.div>
  );
}
