"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useBookmarks, type BookmarkKind } from "@/hooks/useBookmarks";

interface BookmarkButtonProps {
  kind: BookmarkKind;
  id: string;
  title: string;
  href: string;
  image?: string | null;
  className?: string;
  variant?: "icon" | "labeled";
}

export default function BookmarkButton({
  kind,
  id,
  title,
  href,
  image,
  className = "",
  variant = "labeled",
}: BookmarkButtonProps) {
  const { has, toggle, hydrated } = useBookmarks();
  const saved = has(kind, id);

  const handleClick = () => {
    const wasAdded = toggle({ kind, id, title, href, image: image ?? null });
    toast.success(wasAdded ? "Saved for later" : "Removed from saved");
  };

  if (!hydrated) {
    if (variant === "icon") {
      return (
        <button
          type="button"
          aria-label="Save"
          disabled
          className={`btn-icon opacity-0 ${className}`}
        />
      );
    }
    return (
      <button
        type="button"
        aria-hidden="true"
        disabled
        className={`btn-secondary opacity-0 ${className}`}
      >
        <Bookmark className="h-4 w-4" />
        Save
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? "Remove from saved" : "Save for later"}
        aria-pressed={saved}
        className={`btn-icon ${saved ? "text-primary" : ""} ${className}`}
      >
        {saved ? (
          <BookmarkCheck className="h-[18px] w-[18px]" aria-hidden="true" />
        ) : (
          <Bookmark className="h-[18px] w-[18px]" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      className={`btn-secondary ${saved ? "text-primary border-primary/40" : ""} ${className}`}
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          Save for later
        </>
      )}
    </button>
  );
}
