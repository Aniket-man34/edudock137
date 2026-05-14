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
    <aside className="w-full md:w-80 shrink-0">
      <div className="rounded-lg border border-gray-100 p-4 bg-white">
        <h4 className="text-red-600 font-semibold mb-3">At a Glance</h4>

        <nav aria-label="Table of contents">
          <ol className="list-decimal list-inside space-y-2">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'ml-4' : ''}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // update url hash without jumping
                    history.replaceState(null, '', `#${h.id}`);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  <span className="mr-2 font-mono text-sm text-slate-600">{h.number}</span>
                  <span className="align-middle">{h.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  );
}
