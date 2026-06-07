import type { Metadata } from "next";
import { createServerClient } from "@/integrations/supabase/server";
import {
  buildPageMetadata,
  fetchSiteSeo,
  generateHomeSchemas,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import HomeView from "@/components/home/HomeView";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerClient();
  const seo = await fetchSiteSeo(supabase, "home");
  return buildPageMetadata({ pageKey: "home", seo });
}

export default async function HomePage() {
  const supabase = createServerClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysIso = thirtyDaysAgo.toISOString();

  const [
    { data: newestTools },
    { data: newPdfs },
    { data: newUpdates },
    { data: allTools },
    { data: allPdfs },
    { data: allUpdates },
  ] = await Promise.all([
    supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("pdfs")
      .select("*")
      .gte("created_at", thirtyDaysIso)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("updates")
      .select("*")
      .gte("created_at", thirtyDaysIso)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("tools").select("id, title, short_description, image_url, url, clicks").order("title"),
    supabase.from("pdfs").select("id, title, cover_image_url, clicks, slug"),
    supabase.from("updates").select("id, title, image_url, clicks, slug"),
  ]);

  return (
    <>
      <JsonLd data={generateHomeSchemas()} />
      <HomeView
        newestTools={newestTools ?? []}
        newPdfs={newPdfs ?? []}
        newUpdates={newUpdates ?? []}
        allTools={allTools ?? []}
        allPdfs={allPdfs ?? []}
        allUpdates={allUpdates ?? []}
      />
    </>
  );
}
