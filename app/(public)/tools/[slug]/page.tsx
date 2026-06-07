import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "edge";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Wrench, Calendar } from "lucide-react";
import { createServerClient } from "@/integrations/supabase/server";
import {
  buildArticleMetadata,
  fetchTool,
  generateSoftwareApplicationSchema,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import SocialShare from "@/components/updates/SocialShare";
import ToolClickTracker from "@/components/tools/ToolClickTracker";

export const revalidate = 60;

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

  const supabase = createServerClient();
  const { data: recent } = await supabase
    .from("tools")
    .select("id, title, slug, image_url, favicon_url, short_description")
    .neq("id", tool.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const formattedDate = tool.created_at
    ? new Date(tool.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const heroImage = tool.image_url || tool.favicon_url || null;

  return (
    <>
      <JsonLd
        data={generateSoftwareApplicationSchema({
          title: tool.title,
          short_description: tool.short_description,
          description: tool.description,
          image_url: tool.image_url || tool.favicon_url,
          url: tool.url,
          slug: tool.slug,
          id: tool.id,
          author_name: tool.author_name,
        })}
      />
      <ToolClickTracker toolId={tool.id} clicks={tool.clicks ?? 0} />

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tools
        </Link>

        <div className="glass-card-static p-6 md:p-8 rounded-3xl mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="shrink-0 md:w-56">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={tool.title}
                  className="w-full aspect-square object-cover rounded-2xl shadow-xl ring-1 ring-border/30"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-muted rounded-2xl shadow-xl ring-1 ring-border/30">
                  <Wrench className="h-14 w-14 text-primary/40" />
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
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {tool.short_description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {tool.author_name && (
                  <div className="flex items-center gap-2">
                    {tool.author_avatar ? (
                      <img
                        src={tool.author_avatar}
                        alt={tool.author_name}
                        className="w-6 h-6 rounded-full ring-1 ring-border/40"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {tool.author_name[0]}
                      </div>
                    )}
                    <span className="text-foreground font-medium">
                      {tool.author_name}
                    </span>
                  </div>
                )}
                {formattedDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={tool.created_at ?? undefined}>
                      {formattedDate}
                    </time>
                  </div>
                )}
              </div>

              {tool.url && (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full md:w-auto"
                >
                  Visit Tool
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {tool.description && (
          <div className="glass-card-static p-6 md:p-8 rounded-2xl mb-10">
            <h2 className="text-xl font-bold mb-4">About this tool</h2>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {tool.description}
            </p>
          </div>
        )}

        <div className="glass-card-static p-6 rounded-2xl mb-10">
          <SocialShare
            title={tool.title}
            url={`${SITE_URL}/tools/${tool.slug || tool.id}`}
          />
        </div>

        {recent && recent.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-5 tracking-tight">More Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recent.map((t: any) => {
                const thumb = t.image_url || t.favicon_url;
                return (
                  <Link
                    key={t.id}
                    href={`/tools/${t.slug || t.id}`}
                    className="group block"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={t.title}
                        className="w-full aspect-square object-cover rounded-xl shadow-md ring-1 ring-border/20 group-hover:scale-[1.03] transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-muted rounded-xl ring-1 ring-border/20">
                        <Wrench className="h-8 w-8 text-primary/40" />
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
    </>
  );
}
