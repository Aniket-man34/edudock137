import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "edge";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Download, ExternalLink, Calendar } from "lucide-react";
import { createServerClient } from "@/integrations/supabase/server";
import {
  buildArticleMetadata,
  fetchPdf,
  generateDigitalDocumentSchema,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import SocialShare from "@/components/updates/SocialShare";
import PdfClickTracker from "@/components/pdfs/PdfClickTracker";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const pdf = await fetchPdf(params.slug);
    if (!pdf) {
      return {
        title: "PDF Not Found | EduDock",
        description: "This PDF could not be found.",
        robots: { index: false, follow: true },
      };
    }
    const url = `${SITE_URL}/pdfs/${pdf.slug || pdf.id}`;
    return buildArticleMetadata({
      title: pdf.title,
      description: pdf.description ?? "",
      image: pdf.cover_image_url || DEFAULT_OG_IMAGE,
      url,
      publishedTime: pdf.created_at,
      modifiedTime: pdf.updated_at,
      authorName: pdf.author_name,
      metaTitleOverride: pdf.meta_title,
      metaDescriptionOverride: pdf.meta_description,
    });
  } catch {
    return {
      title: "PDF | EduDock",
      description: "EduDock study material.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function PdfDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const pdf = await fetchPdf(params.slug);
  if (!pdf) notFound();

  const supabase = createServerClient();
  const { data: recent } = await supabase
    .from("pdfs")
    .select("id, title, cover_image_url, slug, created_at")
    .neq("id", pdf.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const formattedDate = pdf.created_at
    ? new Date(pdf.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const downloadHref = pdf.file_url || pdf.drive_link || null;

  return (
    <>
      <JsonLd
        data={generateDigitalDocumentSchema({
          title: pdf.title,
          description: pdf.description,
          cover_image_url: pdf.cover_image_url,
          created_at: pdf.created_at,
          slug: pdf.slug,
          id: pdf.id,
          author_name: pdf.author_name,
        })}
      />
      <PdfClickTracker pdfId={pdf.id} clicks={pdf.clicks ?? 0} />

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/pdfs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PDFs
        </Link>

        <div className="glass-card-static p-6 md:p-8 rounded-3xl mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Cover */}
            <div className="shrink-0 md:w-56">
              {pdf.cover_image_url ? (
                <img
                  src={pdf.cover_image_url}
                  alt={pdf.title}
                  className="w-full aspect-[2/3] object-cover rounded-2xl shadow-xl ring-1 ring-border/30"
                />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted rounded-2xl shadow-xl ring-1 ring-border/30">
                  <BookOpen className="h-14 w-14 text-primary/40" />
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              {pdf.categories?.name && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
                  {pdf.categories.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight mb-3 leading-tight">
                {pdf.title}
              </h1>
              {pdf.description && (
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {pdf.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {pdf.author_name && (
                  <div className="flex items-center gap-2">
                    {pdf.author_avatar ? (
                      <img
                        src={pdf.author_avatar}
                        alt={pdf.author_name}
                        className="w-6 h-6 rounded-full ring-1 ring-border/40"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {pdf.author_name[0]}
                      </div>
                    )}
                    <span className="text-foreground font-medium">
                      {pdf.author_name}
                    </span>
                  </div>
                )}
                {formattedDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <time>{formattedDate}</time>
                  </div>
                )}
              </div>

              {downloadHref && (
                <a
                  href={downloadHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full md:w-auto"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card-static p-6 rounded-2xl mb-10">
          <SocialShare
            title={pdf.title}
            url={`${SITE_URL}/pdfs/${pdf.slug || pdf.id}`}
          />
        </div>

        {recent && recent.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-5 tracking-tight">More PDFs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recent.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/pdfs/${p.slug || p.id}`}
                  className="group block"
                >
                  {p.cover_image_url ? (
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="w-full aspect-[2/3] object-cover rounded-xl shadow-md ring-1 ring-border/20 group-hover:scale-[1.03] transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted rounded-xl ring-1 ring-border/20">
                      <BookOpen className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                  <p className="text-xs font-medium mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
