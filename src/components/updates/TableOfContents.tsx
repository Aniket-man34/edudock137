"use client";

import React from 'react';

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
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
          Table of Contents
        </h4>

        <nav aria-label="Table of contents" className="text-sm">
          <ol className="space-y-2.5">
            {headings.map((h) => (
              <li
                key={h.id}
                className={`${h.level === 3 ? 'ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-3' : ''}`}
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', `#${h.id}`);
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug block"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold mr-2">
                    {h.number}
                  </span>
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  );
}
