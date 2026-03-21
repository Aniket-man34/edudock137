import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  const id = parts[parts.length - 1]
  const type = parts[parts.length - 2] 

  const supabase = createClient(
    (Deno as any).env.get('SUPABASE_URL') ?? '',
    (Deno as any).env.get('SUPABASE_ANON_KEY') ?? ''
  )

  let title = 'EduDock Resource'
  let description = 'Check out this educational resource on EduDock!'
  let imageUrl = ''
  
  // No trailing slash here to avoid "https://edudock.netlify.app//pdfs/..."
  const LIVE_WEBSITE_URL = "https://edudock.netlify.app"
  let frontendUrl = LIVE_WEBSITE_URL

  if (type === 'updates') {
    const { data } = await (supabase.from('updates' as any) as any).select('*').eq('id', id).single()
    if (data) {
      title = data.headline || title
      description = data.content ? data.content.substring(0, 150).replace(/\n/g, ' ') + '...' : description
      imageUrl = data.image_url || ''
      frontendUrl = `${LIVE_WEBSITE_URL}/updates/${id}`
    }
  } else if (type === 'pdfs') {
    const { data } = await (supabase.from('pdfs' as any) as any).select('*').eq('id', id).single()
    if (data) {
      title = data.name || title
      description = data.description ? data.description.substring(0, 150).replace(/\n/g, ' ') + '...' : description
      imageUrl = data.cover_image_url || ''
      frontendUrl = `${LIVE_WEBSITE_URL}/pdfs/${id}`
    }
  }

  const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:url" content="${url.href}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="${imageUrl}" />
      
      <script>
        if (!/bot|googlebot|facebookexternalhit|whatsapp|twitterbot/i.test(navigator.userAgent)) {
          window.location.href = "${frontendUrl}";
        }
      </script>
      <noscript>
        <meta http-equiv="refresh" content="3; url=${frontendUrl}" />
      </noscript>
    </head>
    <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white;">
      <p>Redirecting to EduDock...</p>
    </body>
    </html>`

  return new Response(new TextEncoder().encode(html), { 
    status: 200,
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    } 
  })
})