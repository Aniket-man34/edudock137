// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const userAgent = req.headers.get('user-agent') || ''
  
  // 🚨 INCLUDES WHATSAPP, TELEGRAM, AND OTHERS 🚨
  const isBot = /bot|googlebot|facebookexternalhit|whatsapp|twitterbot|telegram|linkedin|viber|skype/i.test(userAgent)
  
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  
  let type = '';
  let slugOrId = ''; 

  // Since the URL hitting this function is like: .../og-meta/updates/slug
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
    // 🚨 DUAL-CATCH FOR BOTS 🚨
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

  // Humans get redirected immediately
  if (!isBot) {
    return Response.redirect(frontendUrl, 302)
  }

  // Bots get the meta-tags
  const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:url" content="${frontendUrl}" />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="EduDock" />
      <meta name="twitter:card" content="summary_large_image" />
    </head>
    <body>Redirecting...</body>
    </html>`

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
})