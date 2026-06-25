/**
 * Shared heading utilities.
 *
 * The rendered markdown gets its heading `id`s from `rehype-slug`, which uses
 * `github-slugger`. To make the Table of Contents links resolve to the right
 * elements, the TOC must compute the *same* ids. This module centralises that
 * logic so the server (page) and any client component stay in sync.
 */

import GithubSlugger from "github-slugger";

export type HeadingLevel = 2 | 3;

export interface TocHeading {
  id: string;
  text: string;
  level: HeadingLevel;
  number: string;
}

/**
 * Convert heading text to the same slug `rehype-slug` produces.
 * `rehype-slug` uses a single GithubSlugger instance per document and calls
 * `.reset()` before each run, so duplicate headings become `foo`, `foo-1`, …
 * We mirror that exactly by constructing a fresh slugger per call.
 */
export function slugifyHeading(text: string): string {
  const slugger = new GithubSlugger();
  return slugger.slug(text);
}

/**
 * Normalise raw article content before heading extraction.
 *
 * Some legacy content stores headings as inline HTML (`<h2>…</h2>`). Convert
 * those to markdown `##`/`###` so they are detected consistently.
 */
export function normalizeArticleContent(raw: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/^<h2>(.*)<\/h2>$/gim, "## $1")
    .replace(/^<h3>(.*)<\/h3>$/gim, "### $1");
}

/**
 * Extract H2/H3 headings from markdown source, producing TOC entries whose
 * `id` matches the ids `rehype-slug` will attach at render time.
 *
 * - Skips headings inside fenced code blocks (``` … ```).
 * - Numbers headings hierarchically (1, 1.1, 2, …).
 * - Uses `github-slugger` so duplicate headings get unique, matching ids.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split("\n");
  const headings: TocHeading[] = [];
  let h2Count = 0;
  let h3Count = 0;

  // A single slugger per document mirrors rehype-slug's behaviour (it resets
  // once per tree). Using one instance means duplicates are de-duplicated the
  // same way the rendered ids are.
  const slugger = new GithubSlugger();

  let inFence = false;

  for (const line of lines) {
    // Track fenced code blocks so headings inside them are ignored.
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m2 = /^##\s+(.+?)\s*$/.exec(line);
    const m3 = /^###\s+(.+?)\s*$/.exec(line);

    if (m2) {
      h2Count++;
      h3Count = 0;
      const text = m2[1].trim();
      headings.push({
        id: slugger.slug(text),
        text,
        level: 2,
        number: `${h2Count}`,
      });
    } else if (m3) {
      h3Count++;
      const text = m3[1].trim();
      headings.push({
        id: slugger.slug(text),
        text,
        level: 3,
        number: `${h2Count}.${h3Count}`,
      });
    }
  }

  return headings;
}
