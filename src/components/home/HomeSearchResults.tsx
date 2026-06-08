"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Wrench, BookOpen, Bell, Eye, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ToolHit = {
  id: string;
  title: string;
  slug: string | null;
  short_description: string | null;
  image_url: string | null;
  url: string | null;
};
type PdfHit = {
  id: string;
  title: string;
  slug: string | null;
  cover_image_url: string | null;
};
type UpdateHit = {
  id: string;
  title: string;
  slug: string | null;
  image_url: string | null;
};

interface Corpus {
  tools: ToolHit[];
  pdfs: PdfHit[];
  updates: UpdateHit[];
}

let cachedCorpus: Corpus | null = null;
let inflight: Promise<Corpus> | null = null;

async function loadCorpus(): Promise<Corpus> {
  if (cachedCorpus) return cachedCorpus;
  if (inflight) return inflight;
  inflight = (async () => {
    const [{ data: tools }, { data: pdfs }, { data: updates }] =
      await Promise.all([
        supabase
          .from("tools")
          .select("id, title, slug, short_description, image_url, url")
          .order("title"),
        supabase
          .from("pdfs")
          .select("id, title, slug, cover_image_url")
          .order("title"),
        supabase
          .from("updates")
          .select("id, title, slug, image_url")
          .order("title"),
      ]);
    const corpus: Corpus = {
      tools: (tools as ToolHit[]) ?? [],
      pdfs: (pdfs as PdfHit[]) ?? [],
      updates: (updates as UpdateHit[]) ?? [],
    };
    cachedCorpus = corpus;
    inflight = null;
    return corpus;
  })();
  return inflight;
}

export default function HomeSearchResults({ query }: { query: string }) {
  const [corpus, setCorpus] = useState<Corpus | null>(cachedCorpus);
  const [loading, setLoading] = useState(!cachedCorpus);

  useEffect(() => {
    if (cachedCorpus) {
      setCorpus(cachedCorpus);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadCorpus().then((c) => {
      if (cancelled) return;
      setCorpus(c);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const term = query.toLowerCase();

  const matchedTools = useMemo(
    () =>
      (corpus?.tools ?? [])
        .filter(
          (t) =>
            t.title?.toLowerCase().includes(term) ||
            t.short_description?.toLowerCase().includes(term),
        )
        .slice(0, 6),
    [corpus, term],
  );
  const matchedPdfs = useMemo(
    () =>
      (corpus?.pdfs ?? [])
        .filter((p) => p.title?.toLowerCase().includes(term))
        .slice(0, 6),
    [corpus, term],
  );
  const matchedUpdates = useMemo(
    () =>
      (corpus?.updates ?? [])
        .filter((u) => u.title?.toLowerCase().includes(term))
        .slice(0, 4),
    [corpus, term],
  );

  const total =
    matchedTools.length + matchedPdfs.length + matchedUpdates.length;

  return (
    <div
      role="region"
      aria-label="Search results"
      aria-live="polite"
      aria-busy={loading}
      className="mt-3 glass-card-static rounded-2xl p-4 text-left max-h-[60vh] overflow-y-auto"
    >
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Searching everything…
        </div>
      )}

      {!loading && total === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Eye className="h-6 w-6 mx-auto mb-2 opacity-60" aria-hidden="true" />
          No matches for &ldquo;{query}&rdquo;
        </div>
      )}

      {!loading && matchedTools.length > 0 && (
        <ResultGroup icon={Wrench} title="Tools" viewAll="/tools">
          <ul className="grid sm:grid-cols-2 gap-2">
            {matchedTools.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.slug ? `/tools/${t.slug}` : `/tools/${t.id}`}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.image_url ? (
                    <img
                      src={t.image_url}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="w-8 h-8 rounded-md object-contain bg-muted"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <Wrench className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium line-clamp-1">
                    {t.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ResultGroup>
      )}

      {!loading && matchedPdfs.length > 0 && (
        <ResultGroup icon={BookOpen} title="PDFs" viewAll="/pdfs">
          <ul className="grid sm:grid-cols-2 gap-2">
            {matchedPdfs.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.slug ? `/pdfs/${p.slug}` : `/pdfs/${p.id}`}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {p.cover_image_url ? (
                    <img
                      src={p.cover_image_url}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="w-8 h-10 rounded-sm object-cover ring-1 ring-border/30"
                    />
                  ) : (
                    <div
                      className="w-8 h-10 rounded-sm bg-primary/10 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium line-clamp-2">
                    {p.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ResultGroup>
      )}

      {!loading && matchedUpdates.length > 0 && (
        <ResultGroup icon={Bell} title="Updates" viewAll="/updates">
          <ul className="space-y-1">
            {matchedUpdates.map((u) => (
              <li key={u.id}>
                <Link
                  href={u.slug ? `/updates/${u.slug}` : `/updates/${u.id}`}
                  className="block px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm font-medium line-clamp-2"
                >
                  {u.title}
                </Link>
              </li>
            ))}
          </ul>
        </ResultGroup>
      )}
    </div>
  );
}

function ResultGroup({
  icon: Icon,
  title,
  viewAll,
  children,
}: {
  icon: any;
  title: string;
  viewAll: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3 last:mb-0">
      <header className="flex items-center justify-between mb-2 px-1">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {title}
        </h3>
        <Link
          href={viewAll}
          className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-0.5 link-underline"
        >
          View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </header>
      {children}
    </section>
  );
}
