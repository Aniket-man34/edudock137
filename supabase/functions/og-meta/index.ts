import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const userAgent = req.headers.get('user-agent') || ''
  // Detects if the visitor is a social media crawler (WhatsApp,FB, etc.)
  const isBot = /bot|googlebot|facebookexternalhit|whatsapp|twitterbot/i.test(userAgent)
  
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  const id = parts[parts.length - 1]
  const type = parts[parts.length - 2] 

  const supabase = createClient(
    (Deno as any).env.get('SUPABASE_URL') ?? '',
    (Deno as any).env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const LIVE_WEBSITE_URL = "https://edudock.in"
  let title = 'EduDock Resource'
  let description = 'Check out this educational resource!'
  let imageUrl = ''
  let frontendUrl = LIVE_WEBSITE_URL

  // 1. Fetch Data from Supabase
  try {
    if (type === 'updates') {
      const { data } = await (supabase.from('updates' as any) as any).select('*').eq('id', id).single()
      if (data) {
        title = data.headline || title
        description = data.content?.substring(0, 150).replace(/\n/g, ' ') || description
        imageUrl = data.image_url || ''
        frontendUrl = `${LIVE_WEBSITE_URL}/updates/${id}`
      }
    } else if (type === 'pdfs') {
      const { data } = await (supabase.from('pdfs' as any) as any).select('*').eq('id', id).single()
      if (data) {
        title = data.name || title
        description = data.description?.substring(0, 150).replace(/\n/g, ' ') || description
        imageUrl = data.cover_image_url || ''
        frontendUrl = `${LIVE_WEBSITE_URL}/pdfs/${id}`
      }
    }
  } catch (error) {
    console.error("Fetch error:", error)
  }

  // 2. FOR HUMANS: Instant Server-Side Redirect
  // This bypasses the browser "sandbox" and "blocked script" errors
  if (!isBot) {
    return Response.redirect(frontendUrl, 302)
  }

  // 3. FOR BOTS: Return HTML with Meta Tags for the preview
  const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:url" content="${frontendUrl}" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="${imageUrl}" />
    </head>
    <body>Redirecting to EduDock...</body>
    </html>`

  return new Response(html, { 
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff" 
    } 
  })
})