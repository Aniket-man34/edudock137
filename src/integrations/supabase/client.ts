"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config";

export function createClient() {
  // SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY always resolve to a real value
  // (env first, then the public project default), so the browser client never
  // degrades to a placeholder that 404s every query.
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

export const supabase = createClient();
