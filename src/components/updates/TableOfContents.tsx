"use client";

import * as React from "react";
import type { TocHeading } from "@/lib/headings";

interface TableOfContentsProps {
  headings: TocHeading[];
}

/**
 * Table of Contents.
 *
 * - Renders H2/H3 entries passed in from the server (computed with the same
 *   slugger as `rehype-slug`, so anchor ids always match the rendered headings).
 * - Clicking an entry smooth-scrolls to the heading and updates the URL hash.
 * - Highlights the heading currently in view using an IntersectionObserver.
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Keep a ref to the latest headings so the observer callback always sees
  // current data without re-subscribing on every render.
  const headingsRef = React.useRef(headings);
  headingsRef.current = headings;

  React.useEffect(() => {
    if (!headings.length) return;

    const ids = headings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Use a rootMargin that triggers "active" slightly before the heading
    // reaches the very top (accounts for the sticky header offset).
    const observer = new IntersectionObserver(
      (entries) => {
        // Collect all currently-intersecting heading ids.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Top bias: a heading is "active" once it crosses ~120px from the top
        // (sticky header height). Bottom margin extends the active zone so the
        // last section stays highlighted while reading it.
        rootMargin: "-120px 0px -70% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside className="w-full shrink-0">
      <details
        className="glass-card-static rounded-2xl p-5 group open:pb-3"
        open
      >
        <summary className="flex items-center justify-between cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          <span className="text-xs font-bold text-foreground uppercase tracking-[0.18em]">
            Table of Contents
          </span>
          <span
            className="text-xs text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            ▾
          </span>
        </summary>

        <nav aria-label="Table of contents" className="mt-4 text-sm">
          <ol className="space-y-2">
            {headings.map((h) => {
              const isActive = activeId === h.id;
              return (
                <li
                  key={h.id}
                  className={
                    h.level === 3
                      ? "ml-4 border-l-2 border-border pl-3"
                      : ""
                  }
                >
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => handleClick(e, h.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={`inline-flex items-start gap-2 transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded text-[10px] font-bold transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {h.number}
                    </span>
                    <span>{h.text}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </details>
    </aside>
  );
}
