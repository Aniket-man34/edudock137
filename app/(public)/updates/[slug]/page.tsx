import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { createServerClient } from "@/integrations/supabase/server";
import {
  buildArticleMetadata,
  fetchUpdate,
  generateArticleSchema,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import SocialShare from "@/components/updates/SocialShare";
import UpdateClickTracker from "@/components/updates/UpdateClickTracker";

export const revalidate = 60;

const getHighResAvatar = (url: string | null) => {
  if (!url) return null;
  if (url.includes("googleusercontent.com") && url.includes("=s")) {
    return url.replace(/=s\d+-c/g, "=s500-c");
  }
  return url;
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const update = await fetchUpdate(params.slug);
    if (!update) {
      return {
        title: "Update Not Found | EduDock",
        description: "This update could not be found.",
        robots: { index: false, follow: true },
      };
    }
    const url = `${SITE_URL}/updates/${update.slug || update.id}`;
    return buildArticleMetadata({
      title: update.title,
      description: update.content?.replace(/\n/g, " ") ?? "",
      image: update.image_url || DEFAULT_OG_IMAGE,
      url,
      publishedTime: update.created_at,
      modifiedTime: update.updated_at,
      authorName: update.author_name,
      metaTitleOverride: update.meta_title,
      metaDescriptionOverride: update.meta_description,
    });
  } catch {
    return {
      title: "Update | EduDock",
      description: "EduDock update.",
      robots: { index: false, follow: true },
    };
  }
}

function transformContent(raw: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/^<h2>(.*)<\/h2>$/gim, "## $1")
    .replace(/^<h3>(.*)<\/h3>$/gim, "### $1");
}

export default async function UpdateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const update = await fetchUpdate(params.slug);
  if (!update) notFound();

  const supabase = createServerClient();
  const { data: recent } = await supabase
    .from("updates")
    .select("id, title, slug, image_url, created_at")
    .neq("id", update.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const formattedDate = update.created_at
    ? new Date(update.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const markdownContent = transformContent(update.content);
  const avatarUrl = getHighResAvatar(update.author_avatar);

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: update.title,
          description: update.content,
          image_url: update.image_url,
          created_at: update.created_at,
          updated_at: update.updated_at,
          slug: update.slug,
          id: update.id,
          author_name: update.author_name,
        })}
      />
      <UpdateClickTracker updateId={update.id} clicks={update.clicks ?? 0} />

      <article className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Updates
        </Link>

        {update.categories?.name && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
            {update.categories.name}
          </span>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight mb-5 leading-[1.1]">
          {update.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {update.author_name && (
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={update.author_name}
                  className="w-7 h-7 rounded-full ring-1 ring-border/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                  {update.author_name[0]}
                </div>
              )}
              <span className="text-foreground font-medium">
                {update.author_name}
              </span>
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={update.created_at ?? undefined}>
                {formattedDate}
              </time>
            </div>
          )}
        </div>

        <div className="glass-card-static p-5 rounded-2xl mb-8">
          <SocialShare
            title={update.title}
            url={`${SITE_URL}/updates/${update.slug || update.id}`}
          />
        </div>

        {update.image_url && (
          <img
            src={update.image_url}
            alt={update.title}
            className="w-full aspect-[1200/630] object-cover rounded-2xl shadow-lg ring-1 ring-border/30 mb-10"
            loading="eager"
          />
        )}

        <div
          className="prose prose-blue max-w-none md:prose-lg dark:prose-invert
            prose-headings:scroll-mt-24 prose-headings:font-display
            prose-table:border prose-table:border-border
            prose-th:bg-muted prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:text-left
            prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-border
            prose-img:w-full prose-img:rounded-xl prose-img:my-6 prose-img:shadow-md
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>

        {update.external_url && (
          <div className="mt-12 glass-card-static rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Official Resource</h3>
            <p className="text-muted-foreground mb-6">
              Visit the official website or resource related to this update.
            </p>
            <a
              href={update.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Visit Official Link <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        <div className="mt-10 glass-card-static p-6 rounded-2xl">
          <SocialShare
            title={update.title}
            url={`${SITE_URL}/updates/${update.slug || update.id}`}
          />
        </div>

        {recent && recent.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">
              Recent Updates
            </h2>
            <div className="flex flex-col gap-4">
              {recent.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/updates/${item.slug || item.id}`}
                  className="flex flex-row items-center gap-4 glass-card-static p-4 rounded-xl group"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-32 sm:w-40 aspect-video object-cover rounded-lg shrink-0 ring-1 ring-border/30"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-32 sm:w-40 aspect-video bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6 text-primary/40" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm md:text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
