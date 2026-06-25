/**
 * Resolved Supabase connection config for the PUBLIC site.
 *
 * Why hardcoded fallbacks exist:
 * Next.js inlines `NEXT_PUBLIC_*` env vars at BUILD time. On Cloudflare Pages
 * (next-on-pages) the build runs in the dashboard/CI, and if those vars are not
 * configured there the compiled bundle ships a placeholder client and the whole
 * site renders empty — content is in the DB but never shows. The Supabase URL
 * and the publishable/anon key are PUBLIC by design (already exposed to the
 * browser), so embedding them as a last-resort default is safe and removes the
 * "build-time environment mismatch on deployment" failure mode entirely.
 *
 * Env vars still take precedence, so staging/forks can point elsewhere.
 */

// Public project identity for EduDock (project ref: qxuxvhzgmrwpngvmsume).
const DEFAULT_SUPABASE_URL = "https://qxuxvhzgmrwpngvmsume.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_0Gr3eV9tfqSo8nRObkj4_Q_aD-I14CF";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;
