export async function onRequest(context) {
  // Get the slug or ID from the URL (e.g., 'updates/math-notes')
  const urlPath = context.params.path ? context.params.path.join('/') : '';
  
  // Your Supabase Edge Function URL
  const supabaseUrl = `https://qxuxvhzgmrwpngvmsume.supabase.co/functions/v1/og-meta/${urlPath}`;
  
  // Fetch the HTML from Supabase
  const response = await fetch(supabaseUrl);
  
  // Return the HTML directly to the Bot/Browser
  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    }
  });
}