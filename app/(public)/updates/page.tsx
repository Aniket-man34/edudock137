import type { Metadata } from "next";
import { Suspense } from "react";
import { createServerClient } from "@/integrations/supabase/server";
import {
  buildPageMetadata,
  fetchSiteSeo,
  generateCollectionPageSchema,
  PAGE_SEO,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import UpdatesView from "@/components/updates/UpdatesView";
import UpdatesListSkeleton from "@/components/updates/UpdatesListSkeleton";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerClient();
  const seo = await fetchSiteSeo(supabase, "updates");
  return buildPageMetadata({ pageKey: "updates", seo });
}

export default async function UpdatesPage() {
  const supabase = createServerClient();

  const [{ data, count }, { data: categories }] = await Promise.all([
    supabase
      .from("updates")
      .select("id, title, slug, image_url, created_at, external_url, clicks, category_id", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(0, 19),
    supabase
      .from("categories")
      .select("*")
      .eq("entity_type", "update")
      .order("name"),
  ]);

  return (
    <>
      <JsonLd data={generateCollectionPageSchema(PAGE_SEO.updates)} />
      <Suspense fallback={<UpdatesListSkeleton />}>
        <UpdatesView
          initialUpdates={data ?? []}
          totalCount={count ?? 0}
          categories={categories ?? []}
        />
      </Suspense>
    </>
  );
}
