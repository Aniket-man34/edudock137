import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { cache } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Wrench, Calendar, ShieldCheck } from "lucide-react";
import { createServerClient } from "@/integrations/supabase/server";
import {
  buildArticleMetadata,
  fetchTool,
  generateWebApplicationSchema,
  resolveSchemaMarkup,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import SocialShare from "@/components/updates/SocialShare";
import ToolClickTracker from "@/components/tools/ToolClickTracker";
import BookmarkButton from "@/components/BookmarkButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import EduDockFooterEcosystem from "@/components/EduDockFooterEcosystem";

// Strip the size suffix (=s96-c, =w400-h400) Google adds to avatar URLs;
// without this, hotlinking + referer mask sometimes returns a 1×1 placeholder.
function normalizeAvatarUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (
      u.hostname.endsWith("googleusercontent.com") ||
      u.hostname.endsWith("ggpht.com")
    ) {
      // Drop the trailing "=…" parameters block that Google appends.
      return raw.replace(/=[swh]\d+(-[a-z0-9-]+)?$/i, "=s256-c");
    }
    return raw;
  } catch {
    return raw;
  }
}

const fetchRelatedTools = cache(async (toolId: string, categoryId: string | null) => {
  const supabase = createServerClient();
  const base = supabase
    .from("tools")
    .select("id, title, slug, image_url, favicon_url, short_description")
    .neq("id", toolId)
    .order("created_at", { ascending: false })
    .limit(4);
  const { data: scoped } = categoryId
    ? await base.eq("category_id", categoryId)
    : await base;
  if ((scoped ?? []).length > 0) return scoped ?? [];
  if (!categoryId) return [];
  const { data: fallback } = await supabase
    .from("tools")
    .select("id, title, slug, image_url, favicon_url, short_description")
    .neq("id", toolId)
    .order("created_at", { ascending: false })
    .limit(4);
  return fallback ?? [];
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const tool = await fetchTool(params.slug);
    if (!tool) {
      return {
        title: "Tool Not Found | EduDock",
        description: "This tool could not be found.",
        robots: { index: false, follow: true },
      };
    }
    const url = `${SITE_URL}/tools/${tool.slug || tool.id}`;
    return buildArticleMetadata({
      title: tool.title,
      description: tool.short_description || tool.description || "",
      image: tool.image_url || tool.favicon_url || DEFAULT_OG_IMAGE,
      url,
      publishedTime: tool.created_at,
      modifiedTime: tool.updated_at,
      authorName: tool.author_name,
      metaTitleOverride: tool.meta_title,
      metaDescriptionOverride: tool.meta_description,
    });
  } catch {
    return {
      title: "Tool | EduDock",
      description: "EduDock educational tool.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ToolDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const tool = await fetchTool(params.slug);
  if (!tool) notFound();

  const related = await fetchRelatedTools(tool.id, tool.category_id ?? null);

  const formattedDate = tool.created_at
    ? new Date(tool.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const heroImage = tool.image_url || tool.favicon_url || null;
  const authorAvatar = normalizeAvatarUrl(tool.author_avatar);
  const shareUrl = `${SITE_URL}/tools/${tool.slug || tool.id}`;

  return (
    <>
      <JsonLd
        data={resolveSchemaMarkup(
          tool.schema_markup,
          generateWebApplicationSchema({
            title: tool.title,
            short_description: tool.short_description,
            description: tool.description,
            image_url: tool.image_url || tool.favicon_url,
            url: tool.url,
            slug: tool.slug,
            id: tool.id,
            author_name: tool.author_name,
          }),
        )}
      />
      <ToolClickTracker toolId={tool.id} />

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Tools
        </Link>

        <Breadcrumbs
          items={[
            { label: "Tools", href: "/tools" },
            { label: tool.title },
          ]}
        />

        <div className="glass-card-static p-6 md:p-8 rounded-3xl mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="shrink-0 md:w-56">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={`${tool.title} icon`}
                  className="w-full aspect-square object-cover rounded-2xl shadow-xl ring-1 ring-border/30"
                  fetchPriority="high"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-muted rounded-2xl shadow-xl ring-1 ring-border/30">
                  <Wrench className="h-14 w-14 text-primary/40" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {tool.categories?.name && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
                  {tool.categories.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight mb-3 leading-tight">
                {tool.title}
              </h1>
              {tool.short_description && (
                <p className="text-foreground/80 leading-relaxed mb-5">
                  {tool.short_description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {formattedDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <time dateTime={tool.created_at ?? undefined}>
                      {formattedDate}
                    </time>
                  </div>
                )}
              </div>

              {tool.url && (
                <div className="flex flex-wrap gap-3">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full sm:w-auto"
                  >
                    Visit Tool
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <BookmarkButton
                    kind="tool"
                    id={tool.id}
                    title={tool.title}
                    href={`/tools/${tool.slug || tool.id}`}
                    image={tool.image_url || tool.favicon_url}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {tool.author_name && (
          <div className="glass-card-static p-5 md:p-6 rounded-2xl mb-8 flex items-center gap-4">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={`${tool.author_name} profile picture`}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full ring-2 ring-primary/20 object-cover shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold text-primary ring-2 ring-primary/20 shrink-0"
                aria-hidden="true"
              >
                {tool.author_name.trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5 inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Curated by
              </p>
              <p className="text-base md:text-lg font-bold text-foreground truncate">
                {tool.author_name}
              </p>
              <p className="text-xs text-muted-foreground">
                EduDock editor
              </p>
            </div>
          </div>
        )}

        {tool.description && (
          <div className="glass-card-static p-6 md:p-8 rounded-2xl mb-10">
            <h2 className="text-xl font-bold mb-4 font-display">
              About this tool
            </h2>
            <p className="whitespace-pre-line text-foreground/80 leading-relaxed">
              {tool.description}
            </p>
          </div>
        )}

        <div className="glass-card-static p-6 rounded-2xl mb-10">
          <SocialShare title={tool.title} url={shareUrl} />
        </div>

        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-5 tracking-tight font-display">
              {tool.category_id ? "More in this category" : "More Tools"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((t: any) => {
                const thumb = t.image_url || t.favicon_url;
                return (
                  <Link
                    key={t.id}
                    href={`/tools/${t.slug || t.id}`}
                    aria-label={t.title}
                    className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        aria-hidden="true"
                        className="w-full aspect-square object-cover rounded-xl shadow-md ring-1 ring-border/20 group-hover:scale-[1.03] transition-transform duration-base ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-muted rounded-xl ring-1 ring-border/20">
                        <Wrench className="h-8 w-8 text-primary/40" aria-hidden="true" />
                      </div>
                    )}
                    <p className="text-xs font-medium mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {t.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>

      <EduDockFooterEcosystem />
    </>
  );
}
