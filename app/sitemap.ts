import type { MetadataRoute } from "next";
import { createServerClient } from "@/integrations/supabase/server";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const [{ data: updates }, { data: pdfs }, { data: tools }] = await Promise.all([
    supabase
      .from("updates")
      .select("slug, id, updated_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("pdfs")
      .select("slug, id, updated_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("tools")
      .select("slug, id, updated_at, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pdfs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/updates`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const updateRoutes: MetadataRoute.Sitemap = (updates ?? []).map((u: any) => ({
    url: `${SITE_URL}/updates/${u.slug || u.id}`,
    lastModified: u.updated_at || u.created_at || now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const pdfRoutes: MetadataRoute.Sitemap = (pdfs ?? []).map((p: any) => ({
    url: `${SITE_URL}/pdfs/${p.slug || p.id}`,
    lastModified: p.updated_at || p.created_at || now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const toolRoutes: MetadataRoute.Sitemap = (tools ?? []).map((t: any) => ({
    url: `${SITE_URL}/tools/${t.slug || t.id}`,
    lastModified: t.updated_at || t.created_at || now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...updateRoutes, ...pdfRoutes, ...toolRoutes];
}
