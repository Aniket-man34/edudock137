import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

export function createServerClient() {
  const authOpts = {
    auth: { persistSession: false, autoRefreshToken: false },
  };

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    if (isBuild) {
      return createSupabaseClient<Database>(PLACEHOLDER_URL, PLACEHOLDER_KEY, authOpts);
    }
    console.error("CRITICAL: Supabase keys are missing at RUNTIME environment.");
    return createSupabaseClient<Database>(PLACEHOLDER_URL, PLACEHOLDER_KEY, authOpts);
  }

  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, authOpts);
}
