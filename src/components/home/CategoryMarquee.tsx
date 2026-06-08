"use client";

import { useSiteSearch } from "@/components/layout/SearchProvider";

interface CategoryMarqueeProps {
  categories: Array<{ id: string; name: string }>;
  className?: string;
}

export default function CategoryMarquee({
  categories,
  className = "",
}: CategoryMarqueeProps) {
  const { setSearchQuery } = useSiteSearch();

  if (!categories.length) return null;

  const track = [...categories, ...categories];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground shrink-0" aria-hidden="true">
          Preparing for:
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-2 w-max animate-marquee-rtl motion-reduce:animate-none">
            {track.map((cat, i) => (
              <button
                key={`${cat.id}-${i}`}
                type="button"
                onClick={() => setSearchQuery(cat.name)}
                aria-label={`Search ${cat.name}`}
                aria-hidden={i >= categories.length ? "true" : undefined}
                tabIndex={i >= categories.length ? -1 : 0}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border/60 bg-card hover:border-primary/30 hover:text-primary transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap shrink-0"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
