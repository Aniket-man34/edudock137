import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bell,
  Wrench,
  Mail,
  Info,
  Sparkles,
} from "lucide-react";
import { createServerClient } from "@/integrations/supabase/server";
import {
  buildPageMetadata,
  fetchSiteSeo,
  generateHomeSchemas,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import ToolCard from "@/components/ToolCard";
import HomeSearch from "@/components/home/HomeSearch";
import CategoryMarquee from "@/components/home/CategoryMarquee";
import NewsletterForm from "@/components/NewsletterForm";
import type { Tables } from "@/integrations/supabase/types";

type Tool = Tables<"tools">;
type Pdf = Tables<"pdfs">;
type Update = Tables<"updates">;

type PdfCard = Pick<Pdf, "id" | "title" | "cover_image_url" | "clicks" | "slug">;
type UpdateCard = Pick<Update, "id" | "title" | "image_url" | "slug" | "created_at">;

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
    { data: popularTools },
    { data: newPdfs },
    { data: popularPdfs },
    { data: newUpdates },
    { count: toolsCount },
    { count: pdfsCount },
    { count: updatesCount },
    { data: marqueeCategories },
  ] = await Promise.all([
    supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("tools")
      .select("*")
      .order("clicks", { ascending: false, nullsFirst: false })
      .limit(10),
    supabase
      .from("pdfs")
      .select("id, title, cover_image_url, clicks, slug")
      .gte("created_at", thirtyDaysIso)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("pdfs")
      .select("id, title, cover_image_url, clicks, slug")
      .order("clicks", { ascending: false, nullsFirst: false })
      .limit(8),
    supabase
      .from("updates")
      .select("id, title, image_url, slug, created_at")
      .gte("created_at", thirtyDaysIso)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("tools").select("id", { count: "exact", head: true }),
    supabase.from("pdfs").select("id", { count: "exact", head: true }),
    supabase.from("updates").select("id", { count: "exact", head: true }),
    supabase
      .from("categories")
      .select("id, name")
      .eq("entity_type", "update")
      .order("name"),
  ]);

  const totals = {
    tools: toolsCount ?? 0,
    pdfs: pdfsCount ?? 0,
    updates: updatesCount ?? 0,
  };

  const hasFreshPdfs = (newPdfs ?? []).length > 0;
  const hasFreshUpdates = (newUpdates ?? []).length > 0;
  const hasNewestTools = (newestTools ?? []).length > 0;

  const pdfCarousel: PdfCard[] = hasFreshPdfs
    ? (newPdfs as PdfCard[])
    : (popularPdfs as PdfCard[]) ?? [];
  const toolGrid: Tool[] = hasNewestTools
    ? (newestTools as Tool[])
    : (popularTools as Tool[]) ?? [];

  const uniqueCategories = Array.from(
    new Map(
      ((marqueeCategories ?? []) as Array<{ id: string; name: string }>).map(
        (c) => [c.name.toLowerCase(), c],
      ),
    ).values(),
  );

  return (
    <>
      <JsonLd data={generateHomeSchemas()} />

      <div className="relative">
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
            aria-hidden="true"
          />
          <div className="container mx-auto px-4 pt-12 md:pt-20 pb-12 text-center max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-5">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Curated for students &amp; educators
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-display tracking-tight leading-[1.05] mb-5">
              Your <span className="gradient-text">study shelf,</span> not a
              tab graveyard.
            </h1>

            <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto mb-7 leading-relaxed">
              {formatTotals(totals)} — hand-picked, free, and updated weekly.
            </p>

            <HomeSearch totals={totals} />

            <CategoryMarquee categories={uniqueCategories} className="mt-6" />
          </div>
        </section>

        {/* ── FRESH PDFs / TRENDING fallback ──────────────────────── */}
        <section className="container mx-auto px-4 py-10 md:py-14">
          <SectionHeader
            icon={BookOpen}
            accent="violet"
            title={hasFreshPdfs ? "Fresh PDFs" : "Trending PDFs"}
            subtitle={
              hasFreshPdfs
                ? "Newly added in the last 30 days"
                : "Most-downloaded right now"
            }
            viewAll="/pdfs"
          />

          {pdfCarousel.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4">
              {pdfCarousel.map((p) => (
                <Link
                  key={p.id}
                  href={`/pdfs/${p.slug || p.id}`}
                  aria-label={p.title ?? "View PDF"}
                  className="flex-none w-[40vw] md:w-[200px] snap-start group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
                >
                  {p.cover_image_url ? (
                    <div className="relative overflow-hidden rounded-xl shadow-md ring-1 ring-border/30 mb-2">
                      <img
                        src={p.cover_image_url}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="w-full aspect-[2/3] object-cover transition-transform duration-base ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted rounded-xl shadow-md ring-1 ring-border/30 mb-2">
                      <BookOpen className="h-8 w-8 text-primary/40" aria-hidden="true" />
                    </div>
                  )}
                  <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No PDFs yet. <Link href="/submit?kind=pdf" className="text-primary link-underline">Suggest one →</Link>
            </p>
          )}
        </section>

        {/* ── FRESH UPDATES ──────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-10 md:py-14">
          <SectionHeader
            icon={Bell}
            accent="sky"
            title="This week"
            subtitle="Latest news, alerts, and resources"
            viewAll="/updates"
          />

          {hasFreshUpdates ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide -mx-4 px-4">
              {newUpdates!.map((u: any) => (
                <Link
                  key={u.id}
                  href={`/updates/${u.slug || u.id}`}
                  aria-label={u.title ?? "Read update"}
                  className="flex-none w-[88vw] md:w-[640px] snap-center rounded-2xl overflow-hidden glass-card-static group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {u.image_url ? (
                    <img
                      src={u.image_url}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="w-full aspect-[1200/620] object-cover transition-transform duration-base ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full aspect-[1200/620] flex items-center justify-center bg-muted">
                      <Bell className="h-10 w-10 text-primary/40" aria-hidden="true" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm md:text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {u.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              You&rsquo;re all caught up. Check back next week.
            </p>
          )}
        </section>

        {/* ── TOOLS REPOSITORY ───────────────────────────────────── */}
        <section className="container mx-auto px-4 py-10 md:py-14">
          <SectionHeader
            icon={Wrench}
            accent="emerald"
            title="Tools repository"
            subtitle={
              hasNewestTools
                ? "Newest tools added"
                : "Most-used tools right now"
            }
            viewAll="/tools"
          />

          {toolGrid.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {toolGrid.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} showDescription />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              No tools yet.{" "}
              <Link href="/submit?kind=tool" className="text-primary link-underline">
                Suggest one →
              </Link>
            </p>
          )}
        </section>

        {/* ── NEWSLETTER ─────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
          <NewsletterForm source="home" />
        </section>

        {/* ── ABOUT + CONTACT ────────────────────────────────────── */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="glass-card-static p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-400/5 ring-1 ring-sky-400/20"
                    aria-hidden="true"
                  >
                    <Info className="h-5 w-5 text-sky-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight font-display">
                    About EduDock
                  </h2>
                </div>
                <p className="text-foreground/80 leading-relaxed mb-5">
                  EduDock is a hand-picked hub of free study tools, PDFs, and
                  timely exam &amp; education news. No paywalls, no ads, no
                  clutter.
                </p>
                <Link href="/about" className="text-sm font-semibold text-primary inline-flex items-center gap-1 link-underline">
                  Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="glass-card-static p-8 rounded-3xl relative overflow-hidden">
                <div
                  className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/[0.06] blur-3xl rounded-full pointer-events-none"
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20"
                      aria-hidden="true"
                    >
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight font-display">
                      Get in touch
                    </h2>
                  </div>
                  <p className="text-foreground/80 text-sm mb-6 leading-relaxed">
                    Suggest a tool, contribute a PDF, or just say hello.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/submit" className="btn-primary">
                      Submit something
                    </Link>
                    <Link href="/contact" className="btn-secondary">
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function formatTotals(t: { tools: number; pdfs: number; updates: number }) {
  const parts = [
    t.pdfs ? `${t.pdfs.toLocaleString()} free ${t.pdfs === 1 ? "PDF" : "PDFs"}` : null,
    t.tools ? `${t.tools.toLocaleString()} study ${t.tools === 1 ? "tool" : "tools"}` : null,
    t.updates ? `${t.updates.toLocaleString()} ${t.updates === 1 ? "update" : "updates"}` : null,
  ].filter(Boolean);
  if (parts.length === 0) return "Hand-picked educational resources";
  if (parts.length === 1) return parts[0]!;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function SectionHeader({
  icon: Icon,
  accent,
  title,
  subtitle,
  viewAll,
}: {
  icon: any;
  accent: "emerald" | "violet" | "sky";
  title: string;
  subtitle: string;
  viewAll: string;
}) {
  const accentClass = {
    emerald: "from-emerald-400/20 to-green-400/10 ring-emerald-400/25 text-emerald-500",
    violet: "from-violet-400/20 to-purple-400/10 ring-violet-400/25 text-violet-500",
    sky: "from-sky-400/20 to-blue-400/10 ring-sky-400/25 text-sky-500",
  }[accent];

  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${accentClass} ring-1`}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <Link
        href={viewAll}
        className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 link-underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
