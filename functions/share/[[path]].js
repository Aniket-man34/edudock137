export async function onRequest(context) {
  const urlPath = context.params.path ? context.params.path.join('/') : '';
  const supabaseUrl = `https://qxuxvhzgmrwpngvmsume.supabase.co/functions/v1/og-meta/${urlPath}`;

  // 🚨 CRITICAL: Grab the User-Agent so Supabase knows if it's Telegram or a Human
  const userAgent = context.request.headers.get("user-agent") || "";

  // Fetch from Supabase, passing the exact User-Agent
  const response = await fetch(supabaseUrl, {
    headers: {
      "user-agent": userAgent
    },
    redirect: "manual" // Prevents Cloudflare from auto-following redirects
  });

  // If Supabase says it's a human (302 Redirect), pass the redirect to the user
  if (response.status >= 300 && response.status < 400) {
    return new Response(null, {
      status: response.status,
      headers: {
        "Location": response.headers.get("Location") || `https://edudock.in/${urlPath}`
      }
    });
  }

  // If Supabase says it's a bot (200 OK), send the meta tags to Telegram!
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    }
  });
}