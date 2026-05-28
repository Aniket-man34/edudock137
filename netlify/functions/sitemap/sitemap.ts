// Netlify Functions handler: Dynamic XML Sitemap
// Queries Supabase for all update + pdf slugs and returns fresh XML
// Deployed at: https://edudock.in/.netlify/functions/sitemap

import type { Handler } from "@netlify/functions";

interface SitemapEntry {
  slug: string | null;
  updated_at: string | null;
}

const SITE = "https://edudock.in";

const STATIC_PAGES = [
  { loc: `${SITE}/`, priority: "1.0" },
  { loc: `${SITE}/updates`, priority: "0.9" },
  { loc: `${SITE}/pdfs`, priority: "0.8" },
  { loc: `${SITE}/tools`, priority: "0.8" },
  { loc: `${SITE}/privacy`, priority: "0.3" },
  { loc: `${SITE}/terms`, priority: "0.3" },
];

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "'");
}

function fmtDate(iso: string | null): string {
  if (!iso) return new Date().toISOString().split("T")[0];
  return iso.split("T")[0];
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

async function fetchEntries(
  table: string,
  supabaseUrl: string,
  anonKey: string,
): Promise<SitemapEntry[]> {
  const url = `${supabaseUrl}/rest/v1/${table}?select=slug,updated_at&order=updated_at.desc`;
  const res = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.warn(`Sitemap: ${table} fetch failed (${res.status})`);
    return [];
  }
  return (await res.json()) as SitemapEntry[];
}

function buildXml(updates: SitemapEntry[], pdfs: SitemapEntry[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const p of STATIC_PAGES) {
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(p.loc)}</loc>\n`;
    xml += `    <lastmod>${today()}</lastmod>\n`;
    xml += `    <priority>${p.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Updates
  for (const u of updates) {
    if (!u.slug) continue;
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(`${SITE}/updates/${u.slug}`)}</loc>\n`;
    xml += `    <lastmod>${fmtDate(u.updated_at)}</lastmod>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  // PDFs
  for (const p of pdfs) {
    if (!p.slug) continue;
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(`${SITE}/pdfs/${p.slug}`)}</loc>\n`;
    xml += `    <lastmod>${fmtDate(p.updated_at)}</lastmod>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

const handler: Handler = async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !anonKey) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/xml" },
      body: buildXml([], []),
    };
  }

  try {
    const [updates, pdfs] = await Promise.all([
      fetchEntries("updates", supabaseUrl, anonKey),
      fetchEntries("pdfs", supabaseUrl, anonKey),
    ]);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
      body: buildXml(updates, pdfs),
    };
  } catch {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/xml" },
      body: buildXml([], []),
    };
  }
};

export { handler };