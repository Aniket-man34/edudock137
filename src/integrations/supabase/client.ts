"use client";

import { createBrowserClient } from "@supabase/ssr";
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

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    if (isBuild) {
      return createBrowserClient<Database>(PLACEHOLDER_URL, PLACEHOLDER_KEY);
    }
    console.error("CRITICAL: Supabase keys are missing at RUNTIME environment.");
    return createBrowserClient<Database>(PLACEHOLDER_URL, PLACEHOLDER_KEY);
  }
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

export const supabase = createClient();
