"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { useBookmarks } from "@/hooks/useBookmarks";

export default function BookmarksNavLink({ className = "" }: { className?: string }) {
  const { items, hydrated } = useBookmarks();
  if (!hydrated || items.length === 0) return null;

  return (
    <Link
      href="/saved"
      className={`relative inline-flex items-center justify-center min-h-[40px] min-w-[40px] btn-icon ${className}`}
      aria-label={`Saved items (${items.length})`}
    >
      <Bookmark className="h-[18px] w-[18px]" aria-hidden="true" />
      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
        {items.length > 99 ? "99+" : items.length}
      </span>
    </Link>
  );
}
