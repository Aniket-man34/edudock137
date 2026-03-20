import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SITE_URL = Deno.env.get("SITE_URL") || "";
const DEFAULT_IMAGE = "/social.png";

function html(
  title: string,
  description: string,
  image: string,
  url: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta property="og:image" content="${esc(image)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url" content="${esc(url)}"/>
  <meta property="og:type" content="website"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(description)}"/>
  <meta name="twitter:image" content="${esc(image)}"/>
  <meta http-equiv="refresh" content="0;url=${esc(url)}"/>
</head>
<body>Redirecting…</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const reqUrl = new URL(req.url);
  const path = reqUrl.pathname.replace("/og-meta", "");
  
  // Use SITE_URL env, or fallback to preview URL pattern
  const projectRef = Deno.env.get("SUPABASE_URL")?.match(/\/\/([^.]+)/)?.[1] || "";
  const siteUrl = SITE_URL || `https://id-preview--${projectRef}.lovable.app`;
  const defaultImg = `${siteUrl}/social.png`;

  // Match /pdfs/:id
  const pdfMatch = path.match(/^\/pdfs\/([a-f0-9-]+)$/i);
  if (pdfMatch) {
    const { data } = await supabase
      .from("pdfs")
      .select("name, description, cover_image_url")
      .eq("id", pdfMatch[1])
      .single();

    if (data) {
      return new Response(
        html(
          `${data.name} - EduDock`,
          data.description || "Check out this PDF on EduDock",
          data.cover_image_url || defaultImg,
          `${siteUrl}/pdfs/${pdfMatch[1]}`
        ),
        { headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" } }
      );
    }
  }

  // Match /updates/:id
  const updateMatch = path.match(/^\/updates\/([a-f0-9-]+)$/i);
  if (updateMatch) {
    const { data } = await supabase
      .from("updates")
      .select("headline, content, image_url")
      .eq("id", updateMatch[1])
      .single();

    if (data) {
      return new Response(
        html(
          `${data.headline} - EduDock`,
          data.content?.substring(0, 155) || "Latest update from EduDock",
          data.image_url || defaultImg,
          `${siteUrl}/updates/${updateMatch[1]}`
        ),
        { headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" } }
      );
    }
  }

  // Fallback
  return new Response(
    html(
      "EduDock - Your Educational Resource Hub",
      "Discover curated educational tools, PDF resources, and updates.",
      defaultImg,
      siteUrl
    ),
    { headers: { ...corsHeaders, "content-type": "text/html; charset=utf-8" } }
  );
});
