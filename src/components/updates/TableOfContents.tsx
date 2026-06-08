"use client";

import * as React from "react";

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
  number: string;
};

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  if (!headings || headings.length === 0) return null;

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
            {headings.map((h) => (
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
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    history.replaceState(null, "", `#${h.id}`);
                  }}
                  className="inline-flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded bg-primary/10 text-primary text-[10px] font-bold">
                    {h.number}
                  </span>
                  <span>{h.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
    </aside>
  );
}
