export async function onRequest(context) {
  const urlPath = context.params.path ? context.params.path.join('/') : '';
  const userAgent = context.request.headers.get("user-agent") || "";
  
  // Detect bots (WhatsApp, Telegram, Twitter, etc.)
  const isBot = /bot|facebook|whatsapp|telegram|twitter|linkedin|viber|skype/i.test(userAgent);

  // 1. IF HUMAN: Instantly redirect to the real page! Fast and easy.
  if (!isBot) {
    return Response.redirect(`https://edudock.in/${urlPath}`, 302);
  }

  // 2. IF BOT: Fetch the meta tags from Supabase
  const supabaseUrl = `https://qxuxvhzgmrwpngvmsume.supabase.co/functions/v1/og-meta/${urlPath}`;
  const response = await fetch(supabaseUrl, {
    headers: { "user-agent": userAgent }
  });

  const html = await response.text();

  // Return the pure HTML to Telegram/WhatsApp
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}