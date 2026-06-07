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
import ToolsView from "@/components/tools/ToolsView";
import ToolsListSkeleton from "@/components/tools/ToolsListSkeleton";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerClient();
  const seo = await fetchSiteSeo(supabase, "tools");
  return buildPageMetadata({ pageKey: "tools", seo });
}

export default async function ToolsPage() {
  const supabase = createServerClient();

  const [{ data: initialTools, count }, { data: categories }] = await Promise.all([
    supabase
      .from("tools")
      .select("*, categories(name)", { count: "exact" })
      .order("title")
      .range(0, 11),
    supabase
      .from("categories")
      .select("*")
      .eq("entity_type", "tool")
      .order("name"),
  ]);

  return (
    <>
      <JsonLd data={generateCollectionPageSchema(PAGE_SEO.tools)} />
      <Suspense fallback={<ToolsListSkeleton />}>
        <ToolsView
          initialTools={initialTools ?? []}
          totalCount={count ?? 0}
          categories={categories ?? []}
        />
      </Suspense>
    </>
  );
}
