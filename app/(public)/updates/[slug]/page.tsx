import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "edge";
import { notFound } from "next/navigation";
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
import AuthorShareRow from "@/components/updates/AuthorShareRow";
import UpdateClickTracker from "@/components/updates/UpdateClickTracker";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/updates/TableOfContents";
import ReadingProgress from "@/components/updates/ReadingProgress";
import BookmarkButton from "@/components/BookmarkButton";
import NewsletterForm from "@/components/NewsletterForm";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

const getHighResAvatar = (url: string | null) => {
  if (!url) return null;
  if (url.includes("googleusercontent.com") && url.includes("=s")) {
    return url.replace(/=s\d+-c/g, "=s500-c");
  }
  return url;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function transformContent(raw: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/^<h2>(.*)<\/h2>$/gim, "## $1")
    .replace(/^<h3>(.*)<\/h3>$/gim, "### $1");
}

function extractHeadings(markdown: string) {
  const lines = markdown.split("\n");
  const headings: Array<{
    id: string;
    text: string;
    level: 2 | 3;
    number: string;
  }> = [];
  let h2Count = 0;
  let h3Count = 0;
  for (const line of lines) {
    const m2 = /^##\s+(.+?)\s*$/.exec(line);
    const m3 = /^###\s+(.+?)\s*$/.exec(line);
    if (m2) {
      h2Count++;
      h3Count = 0;
      const text = m2[1].trim();
      headings.push({
        id: slugify(text),
        text,
        level: 2,
        number: `${h2Count}`,
      });
    } else if (m3) {
      h3Count++;
      const text = m3[1].trim();
      headings.push({
        id: slugify(text),
        text,
        level: 3,
        number: `${h2Count}.${h3Count}`,
      });
    }
  }
  return headings;
}

function readingMinutes(text: string | null): number {
  if (!text) return 1;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

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

export default async function UpdateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const update = await fetchUpdate(params.slug);
  if (!update) notFound();

  const supabase = createServerClient();

  // Prefer related-by-category; fall back to most-recent if none.
  const relatedQuery = update.category_id
    ? supabase
        .from("updates")
        .select("id, title, slug, image_url, created_at")
        .eq("category_id", update.category_id)
        .neq("id", update.id)
        .order("created_at", { ascending: false })
        .limit(4)
    : supabase
        .from("updates")
        .select("id, title, slug, image_url, created_at")
        .neq("id", update.id)
        .order("created_at", { ascending: false })
        .limit(4);

  const { data: relatedRaw } = await relatedQuery;
  let related = relatedRaw ?? [];
  if (related.length === 0 && update.category_id) {
    const { data: fallback } = await supabase
      .from("updates")
      .select("id, title, slug, image_url, created_at")
      .neq("id", update.id)
      .order("created_at", { ascending: false })
      .limit(4);
    related = fallback ?? [];
  }

  const formattedDate = update.created_at
    ? new Date(update.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const markdownContent = transformContent(update.content);
  const headings = extractHeadings(markdownContent);
  const minutes = readingMinutes(update.content);
  const avatarUrl = getHighResAvatar(update.author_avatar);

  return (
    <>
      <ReadingProgress />
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
      <UpdateClickTracker updateId={update.id} />

      <article className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Updates
        </Link>

        <Breadcrumbs
          items={[
            { label: "Updates", href: "/updates" },
            { label: update.title },
          ]}
        />

        {update.categories?.name && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
            {update.categories.name}
          </span>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight mb-5 leading-[1.1]">
          {update.title}
        </h1>

        {update.author_name && (
          <div className="mb-6">
            <div className="flex items-start gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${update.author_name} avatar`}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full ring-2 ring-border/40 shadow-sm shrink-0"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl md:text-2xl font-bold text-primary ring-2 ring-border/40 shrink-0"
                  aria-hidden="true"
                >
                  {update.author_name[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-base md:text-lg font-bold text-foreground leading-tight">
                  {update.author_name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  {formattedDate && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      <time dateTime={update.created_at ?? undefined}>
                        {formattedDate}
                      </time>
                    </span>
                  )}
                  <span aria-label={`${minutes} minute read`}>
                    {minutes} min read
                  </span>
                </div>
                <AuthorShareRow
                  title={update.title}
                  url={`${SITE_URL}/updates/${update.slug || update.id}`}
                />
              </div>
              <BookmarkButton
                kind="update"
                id={update.id}
                title={update.title}
                href={`/updates/${update.slug || update.id}`}
                image={update.image_url}
                variant="icon"
                className="shrink-0"
              />
            </div>
          </div>
        )}

        {!update.author_name && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={update.created_at ?? undefined}>
                  {formattedDate}
                </time>
              </div>
            )}
            <span aria-label={`${minutes} minute read`}>{minutes} min read</span>
            <BookmarkButton
              kind="update"
              id={update.id}
              title={update.title}
              href={`/updates/${update.slug || update.id}`}
              image={update.image_url}
              variant="icon"
              className="ml-auto"
            />
          </div>
        )}

        {update.image_url && (
          <img
            src={update.image_url}
            alt={`Cover for ${update.title}`}
            className="w-full aspect-[1200/630] object-cover rounded-2xl shadow-lg ring-1 ring-border/30 mb-8"
            loading="eager"
            fetchPriority="high"
          />
        )}

        {headings.length >= 2 && (
          <div className="mb-8">
            <TableOfContents headings={headings} />
          </div>
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
          <MarkdownRenderer content={markdownContent} />
        </div>

        {update.external_url && (
          <div className="mt-12 glass-card-static rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold mb-2 font-display">
              Official Resource
            </h2>
            <p className="text-muted-foreground mb-6">
              Visit the official website or resource related to this update.
            </p>
            <a
              href={update.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Visit Official Link <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        )}

        <div className="mt-10 glass-card-static p-6 rounded-2xl">
          <SocialShare
            title={update.title}
            url={`${SITE_URL}/updates/${update.slug || update.id}`}
          />
        </div>

        <div className="mt-8">
          <NewsletterForm
            source="update-article"
            audience={update.categories?.name ?? null}
            title="Don't miss the next one"
            subtitle="Get a weekly digest of new updates, PDFs, and tools — no spam, unsubscribe anytime."
          />
        </div>

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 tracking-tight font-display">
              {update.category_id ? "More in this category" : "Recent Updates"}
            </h2>
            <div className="flex flex-col gap-4">
              {related.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/updates/${item.slug || item.id}`}
                  aria-label={item.title}
                  className="flex flex-row items-center gap-4 glass-card-static p-4 rounded-xl group hover:-translate-y-0.5 hover:border-primary/30 transition-[transform,border-color] duration-fast ease-out motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      aria-hidden="true"
                      className="w-32 sm:w-40 aspect-video object-cover rounded-lg shrink-0 ring-1 ring-border/30"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-32 sm:w-40 aspect-video bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6 text-primary/40" aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm md:text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
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
