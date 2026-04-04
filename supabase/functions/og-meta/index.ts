// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  
  let type = '';
  let slugOrId = ''; 

  // Safely extract the type and slug regardless of how the proxy forwards it
  if (parts.includes('updates')) {
    type = 'updates';
    slugOrId = parts[parts.indexOf('updates') + 1];
  } else if (parts.includes('pdfs')) {
    type = 'pdfs';
    slugOrId = parts[parts.indexOf('pdfs') + 1];
  }

  const safeParam = slugOrId ? decodeURIComponent(slugOrId) : '';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const LIVE_WEBSITE_URL = "https://edudock.in"
  let title = 'EduDock - Your Educational Resource Hub'
  let description = 'Discover curated educational tools, PDFs, study materials, and real-time updates.'
  let imageUrl = `${LIVE_WEBSITE_URL}/social.png` 
  let frontendUrl = LIVE_WEBSITE_URL

  try {
    // DUAL-CATCH: Supports both old UUID links and new beautiful Slugs
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(safeParam);

    if (type === 'updates' && safeParam) {
      let query = supabase.from('updates').select('*');
      query = isUUID ? query.eq('id', safeParam) : query.eq('slug', safeParam);
      
      const { data } = await query.single();

      if (data) {
        title = data.headline || title
        description = data.content?.substring(0, 150).replace(/\n/g, ' ') || description
        imageUrl = data.image_url || imageUrl
        frontendUrl = `${LIVE_WEBSITE_URL}/updates/${data.slug || data.id}`
      }
    } else if (type === 'pdfs' && safeParam) {
      let query = supabase.from('pdfs').select('*');
      query = isUUID ? query.eq('id', safeParam) : query.eq('slug', safeParam);

      const { data } = await query.single();
      
      if (data) {
        title = data.name || title
        description = data.description?.substring(0, 150).replace(/\n/g, ' ') || description
        imageUrl = data.cover_image_url || imageUrl
        frontendUrl = `${LIVE_WEBSITE_URL}/pdfs/${data.slug || data.id}`
      }
    }
  } catch (error) {
    console.error("Fetch error:", error)
  }

  // 🚨 ALWAYS RETURN HTML WITH REDIRECT TRIGGERS 🚨
  // Bots read the meta tags. Humans execute the Javascript & meta-refresh.
  const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      
      <meta property="og:type" content="article" />
      <meta property="og:url" content="${frontendUrl}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:image:secure_url" content="${imageUrl}" />
      <meta property="og:site_name" content="EduDock" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="${frontendUrl}" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${imageUrl}" />

      <meta http-equiv="refresh" content="0;url=${frontendUrl}" />
      <script>
        window.location.replace("${frontendUrl}");
      </script>
    </head>
    <body>
      <p>Redirecting to <a href="${frontendUrl}">${title}</a>...</p>
    </body>
    </html>`

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
})