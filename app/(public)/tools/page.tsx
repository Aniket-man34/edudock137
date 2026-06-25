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

// Cloudflare (next-on-pages) requires the Edge runtime for any non-static
// (dynamic/SSR) route. Without it the dynamic listing cannot be emitted as an
// edge function and falls back to a build-time static snapshot, so newly
// published tools never appear. Must stay paired with `force-dynamic`.
export const runtime = "edge";
export const dynamic = "force-dynamic";

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
