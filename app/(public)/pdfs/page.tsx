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
import PdfsView from "@/components/pdfs/PdfsView";
import PdfsListSkeleton from "@/components/pdfs/PdfsListSkeleton";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerClient();
  const seo = await fetchSiteSeo(supabase, "pdfs");
  return buildPageMetadata({ pageKey: "pdfs", seo });
}

export default async function PdfsPage() {
  const supabase = createServerClient();

  const [{ data: initialPdfs, count }, { data: categories }] = await Promise.all([
    supabase
      .from("pdfs")
      .select("*, categories(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, 11),
    supabase
      .from("categories")
      .select("*")
      .eq("entity_type", "pdf")
      .order("name"),
  ]);

  return (
    <>
      <JsonLd data={generateCollectionPageSchema(PAGE_SEO.pdfs)} />
      <Suspense fallback={<PdfsListSkeleton />}>
        <PdfsView
          initialPdfs={initialPdfs ?? []}
          totalCount={count ?? 0}
          categories={categories ?? []}
        />
      </Suspense>
    </>
  );
}
