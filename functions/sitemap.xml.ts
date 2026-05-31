import { createClient } from "@supabase/supabase-js";

interface Env {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface PagesFunctionContext {
  readonly env: Env;
  readonly request: Request;
  readonly params: Record<string, string | string[] | undefined>;
  readonly data: Record<string, unknown>;
  next(): Promise<Response>;
}

interface SitemapPage {
  readonly loc: string;
  readonly lastmod: string;
  readonly priority: string;
}

type UpdateRow = { slug: string | null; updated_at: string | null };
type PdfRow = { slug: string | null; created_at: string | null };

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  try {
    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = context.env;

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
      console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
      return new Response(generateErrorSitemap(), {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, { global: { fetch } as any });

    const [updatesRes, pdfsRes] = await Promise.all([
      supabase.from("updates").select("slug,updated_at").order("updated_at", { ascending: false }),
      supabase.from("pdfs").select("slug,created_at").order("created_at", { ascending: false }),
    ]);

    const updates = Array.isArray(updatesRes.data) ? updatesRes.data : [];
    const pdfs = Array.isArray(pdfsRes.data) ? pdfsRes.data : [];

    const xmlString = generateSitemapXml(updates, pdfs);

    return new Response(xmlString, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sitemap generation error:", message);
    return new Response(generateErrorSitemap(), {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

function generateSitemapXml(updates: UpdateRow[], pdfs: PdfRow[]): string {
  const staticPages: SitemapPage[] = [
    { loc: "https://edudock.in/", lastmod: getTodayISO(), priority: "1.0" },
    { loc: "https://edudock.in/updates", lastmod: getTodayISO(), priority: "0.9" },
    { loc: "https://edudock.in/pdfs", lastmod: getTodayISO(), priority: "0.8" },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += `  <url>\n    <loc>${escapeXml(page.loc)}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n    <priority>${page.priority}</priority>\n  </url>\n`;
  }

  for (const update of updates) {
    if (!update.slug) continue;
    xml += `  <url>\n    <loc>https://edudock.in/updates/${escapeXml(update.slug)}</loc>\n    <lastmod>${formatDate(update.updated_at)}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  for (const pdf of pdfs) {
    if (!pdf.slug) continue;
    xml += `  <url>\n    <loc>https://edudock.in/pdfs/${escapeXml(pdf.slug)}</loc>\n    <lastmod>${formatDate(pdf.created_at)}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  xml += "</urlset>";
  return xml;
}

function generateErrorSitemap(): string {
  const nl = "\n";
  const today = getTodayISO();

  let str = '<?xml version="1.0" encoding="UTF-8"?>' + nl;
  str += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + nl;
  str += "  <url>" + nl;
  str += "    <loc>https://edudock.in/</loc>" + nl;
  str += "    <lastmod>" + today + "</lastmod>" + nl;
  str += "    <priority>1.0</priority>" + nl;
  str += "  </url>" + nl;
  str += "  <url>" + nl;
  str += "    <loc>https://edudock.in/updates</loc>" + nl;
  str += "    <lastmod>" + today + "</lastmod>" + nl;
  str += "    <priority>0.8</priority>" + nl;
  str += "  </url>" + nl;
  str += "  <url>" + nl;
  str += "    <loc>https://edudock.in/pdfs</loc>" + nl;
  str += "    <lastmod>" + today + "</lastmod>" + nl;
  str += "    <priority>0.7</priority>" + nl;
  str += "  </url>" + nl;
  str += "</urlset>";
  return str;
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return getTodayISO();
  try {
    return isoString.split("T")[0] as string;
  } catch {
    return getTodayISO();
  }
}

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0] as string;
}

function escapeXml(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
