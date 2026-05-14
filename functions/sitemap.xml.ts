// Cloudflare Pages Function: Dynamic XML Sitemap
// Fetches all update slugs from Supabase and generates a valid sitemap.xml
// URL: https://edudock.in/sitemap.xml

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Env {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
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

interface UpdateRow {
  readonly slug: string | null;
  readonly created_at: string | null;
}

/* ------------------------------------------------------------------ */
/*  Main Handler                                                       */
/* ------------------------------------------------------------------ */

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  try {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = context.env;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
      return new Response(
        generateErrorSitemap("Configuration error: Missing environment variables"),
        {
          status: 200,
          headers: { "Content-Type": "application/xml" },
        },
      );
    }

    // Fetch slugs and created_at from the updates table via Supabase REST API
    const supabaseResponse: Response = await fetch(
      SUPABASE_URL + "/rest/v1/updates?select=slug,created_at&order=created_at.desc",
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!supabaseResponse.ok) {
      console.error("Supabase API error: " + supabaseResponse.status + " " + supabaseResponse.statusText);
      return new Response(
        generateErrorSitemap("Database fetch failed"),
        {
          status: 200,
          headers: { "Content-Type": "application/xml" },
        },
      );
    }

    const updates: UpdateRow[] = await supabaseResponse.json() as UpdateRow[];

    // Generate the XML sitemap
    const xmlString: string = generateSitemapXml(updates);

    return new Response(xmlString, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error: unknown) {
    const message: string = error instanceof Error ? error.message : "Unknown error";
    console.error("Sitemap generation error:", message);
    return new Response(
      generateErrorSitemap("Internal server error"),
      {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  XML Generation Helpers                                             */
/* ------------------------------------------------------------------ */

function generateSitemapXml(updates: UpdateRow[]): string {
  const staticPages: SitemapPage[] = [
    { loc: 'https://edudock.in/', lastmod: getTodayISO(), priority: '1.0' },
    { loc: 'https://edudock.in/updates', lastmod: getTodayISO(), priority: '0.8' },
    { loc: 'https://edudock.in/pdfs', lastmod: getTodayISO(), priority: '0.7' },
  ];

  var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n";
  xml += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + "\n";

  // Static pages
  for (const page of staticPages) {
    xml += "  <url>" + "\n";
    xml += "    <loc>" + escapeXml(page.loc) + "</loc>" + "\n";
    xml += "    <lastmod>" + page.lastmod + "</lastmod>" + "\n";
    xml += "    <priority>" + page.priority + "</priority>" + "\n";
    xml += "  </url>" + "\n";
  }

  // Dynamic update pages
  if (Array.isArray(updates)) {
    for (const update of updates) {
      if (!update.slug) continue;

      const lastmod: string = formatDate(update.created_at);
      xml += "  <url>" + "\n";
      xml += '    <loc>https://edudock.in/update/' + escapeXml(update.slug) + '</loc>' + '\n';
      xml += "    <lastmod>" + lastmod + "</lastmod>" + "\n";
      xml += "    <priority>0.6</priority>" + "\n";
      xml += "  </url>" + "\n";
    }
  }

  xml += "</urlset>";
  return xml;
}

function generateErrorSitemap(_reason: string): string {
  var nl = "\n";

  var str = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + nl;
  str += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + nl;
  str += "  <url>" + nl;
  str += "    <loc>https://edudock.in/</loc>" + nl;
  str += "    <lastmod>" + getTodayISO() + "</lastmod>" + nl;
  str += "    <priority>1.0</priority>" + nl;
  str += "  </url>" + nl;
  str += "  <url>" + nl;
  str += "    <loc>https://edudock.in/updates</loc>" + nl;
  str += "    <lastmod>" + getTodayISO() + "</lastmod>" + nl;
  str += "    <priority>0.8</priority>" + nl;
  str += "  </url>" + nl;
  str += "  <url>" + nl;
  str += "    <loc>https://edudock.in/pdfs</loc>" + nl;
  str += "    <lastmod>" + getTodayISO() + "</lastmod>" + nl;
  str += "    <priority>0.7</priority>" + nl;
  str += "  </url>" + nl;
  str += "</urlset>";
  return str;
}

function formatDate(isoString: string | null): string {
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

/**
 * Escape XML special characters to prevent injection or malformed XML.
 */
function escapeXml(str: string): string {
  if (typeof str !== "string") return "";
  var a = String.fromCharCode(38);
  return str
    .replace(/&/g, a + "amp;")
    .replace(/</g, a + "lt;")
    .replace(/>/g, a + "gt;")
    .replace(/"/g, a + "quot;")
    .replace(/'/g, a + 'apos;');
}
