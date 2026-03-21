import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  const id = parts[parts.length - 1]
  const type = parts[parts.length - 2] 

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  let title = 'EduDock Resource'
  let description = 'Check out this educational resource on EduDock!'
  let imageUrl = ''
  
  const LIVE_WEBSITE_URL = "https://edudock.netlify.app"; 
  let frontendUrl = LIVE_WEBSITE_URL;

  if (type === 'updates') {
    const { data } = await supabase.from('updates').select('*').eq('id', id).single()
    if (data) {
      title = data.headline || title
      description = data.content ? data.content.substring(0, 120).replace(/\n/g, ' ') + '...' : description
      imageUrl = data.image_url || ''
      frontendUrl = `${LIVE_WEBSITE_URL}/updates/${id}`
    }
  } else if (type === 'pdfs') {
    const { data } = await supabase.from('pdfs').select('*').eq('id', id).single()
    if (data) {
      title = data.title || title
      description = data.description ? data.description.substring(0, 120).replace(/\n/g, ' ') + '...' : description
      imageUrl = data.pdf_cover || '' 
      frontendUrl = `${LIVE_WEBSITE_URL}/pdfs/${id}`
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="${imageUrl}" />
      <meta http-equiv="refresh" content="0; url=${frontendUrl}" />
    </head>
    <body>
      <script>window.location.href = "${frontendUrl}";</script>
    </body>
    </html>
  `

  return new Response(html, { 
    status: 200,
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    } 
  })
})