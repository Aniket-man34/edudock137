import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSeoRow {
  id: string;
  page_name: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  twitter_card: string | null;
  schema_markup: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch SEO settings for a given page from the site_seo_settings table.
 * Falls back gracefully when no row exists or the table hasn't been created yet.
 *
 * NOTE: Uses a raw query cast because the generated supabase types don't include
 * site_seo_settings yet. Once the migration is applied and types regenerated,
 * the `as any` cast can be removed.
 */
export function useSiteSeo(pageName: string) {
  return useQuery({
    queryKey: ["site_seo", pageName],
    queryFn: async (): Promise<SiteSeoRow | null> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("site_seo_settings")
        .select("*")
        .eq("page_name", pageName)
        .maybeSingle();

      if (error) {
        // Table may not exist yet — swallow and fall back
        console.warn(`[useSiteSeo] ${pageName}:`, error.message);
        return null;
      }
      return (data as SiteSeoRow) ?? null;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 mins
    retry: 1,
  });
}