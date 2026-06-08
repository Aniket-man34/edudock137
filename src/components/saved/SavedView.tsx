"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookOpen,
  Wrench,
  Bell,
  X,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useBookmarks, type BookmarkKind } from "@/hooks/useBookmarks";

const FILTERS: Array<{ key: BookmarkKind | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "tool", label: "Tools" },
  { key: "pdf", label: "PDFs" },
  { key: "update", label: "Updates" },
];

const ICONS: Record<BookmarkKind, any> = {
  tool: Wrench,
  pdf: BookOpen,
  update: Bell,
};

const LABELS: Record<BookmarkKind, string> = {
  tool: "Tool",
  pdf: "PDF",
  update: "Update",
};

export default function SavedView() {
  const { items, hydrated, remove, clear } = useBookmarks();
  const [filter, setFilter] = useState<BookmarkKind | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((b) => b.kind === filter);
  }, [filter, items]);

  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[60vh]" aria-busy="true">
        <div className="skeleton h-9 w-48 mb-3" />
        <div className="skeleton h-4 w-72 mb-8" />
        <div className="skeleton h-10 w-72 mb-6 rounded-xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-[60vh] text-center">
        <div className="glass-card-static inline-flex p-6 rounded-3xl mb-6">
          <Bookmark className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="page-header mb-2">Nothing saved yet</h1>
        <p className="page-subtitle max-w-md mx-auto">
          Hit the bookmark icon on any tool, PDF, or update and it&rsquo;ll show
          up here on this device.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/pdfs" className="btn-primary">
            Browse PDFs
          </Link>
          <Link href="/tools" className="btn-secondary">
            Explore tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="page-header inline-flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
            Saved
          </h1>
          <p className="page-subtitle">
            {items.length} {items.length === 1 ? "item" : "items"} stored on
            this device.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all saved items on this device?")) {
              clear();
              toast.success("Saved list cleared");
            }
          }}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear all
        </button>
      </div>

      <div role="tablist" aria-label="Filter saved items" className="inline-flex p-1 glass-card-static rounded-xl mb-6">
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;
          const count =
            key === "all"
              ? items.length
              : items.filter((b) => b.kind === key).length;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setFilter(key)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              <span
                className={`text-[10px] font-semibold px-1.5 rounded ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="text-muted-foreground">
            Nothing saved in this category yet.
          </p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
            {filtered.map((b) => {
              const Icon = ICONS[b.kind];
              return (
                <motion.li
                  key={`${b.kind}:${b.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card-static rounded-2xl overflow-hidden group"
                >
                  <Link
                    href={b.href}
                    aria-label={b.title}
                    className="flex gap-3 p-3 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-2xl"
                  >
                    {b.image ? (
                      <img
                        src={b.image}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="w-16 h-16 rounded-lg object-cover ring-1 ring-border/30 shrink-0"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <Icon className="h-6 w-6 text-primary/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        {LABELS[b.kind]}
                      </p>
                      <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {b.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        remove(b.kind, b.id);
                        toast.success("Removed from saved");
                      }}
                      aria-label={`Remove ${b.title} from saved`}
                      className="btn-icon shrink-0"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
