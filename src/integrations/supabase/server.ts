import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config";

export function createServerClient() {
  const authOpts = {
    auth: { persistSession: false, autoRefreshToken: false },
  };

  // SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY always resolve to a real value
  // (env first, then the public project default) so the server client can never
  // silently degrade to a placeholder and render an empty site in production.
  return createSupabaseClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    authOpts,
  );
}
