"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Bell,
  Wrench,
  Eye,
  Mail,
  Info,
  GraduationCap,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import ParticleBackground from "@/components/ParticleBackground";
import { useSiteSearch } from "@/components/layout/SearchProvider";
import type { Tables } from "@/integrations/supabase/types";

type Tool = Tables<"tools">;
type Pdf = Tables<"pdfs">;
type Update = Tables<"updates">;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

interface HomeViewProps {
  newestTools: Tool[];
  newPdfs: Pdf[];
  newUpdates: Update[];
  allTools: Pick<Tool, "id" | "title" | "short_description" | "image_url" | "url" | "clicks">[];
  allPdfs: Pick<Pdf, "id" | "title" | "cover_image_url" | "clicks" | "slug">[];
  allUpdates: Pick<Update, "id" | "title" | "image_url" | "clicks" | "slug">[];
}

export default function HomeView({
  newestTools,
  newPdfs,
  newUpdates,
  allTools,
  allPdfs,
  allUpdates,
}: HomeViewProps) {
  const { debouncedSearch } = useSiteSearch();
  const term = debouncedSearch.toLowerCase().trim();
  const isSearching = term.length > 0;

  const matchedTools = useMemo(
    () =>
      isSearching
        ? allTools.filter(
            (t) =>
              t.title?.toLowerCase().includes(term) ||
              t.short_description?.toLowerCase().includes(term)
          )
        : [],
    [allTools, term, isSearching]
  );
  const matchedPdfs = useMemo(
    () =>
      isSearching
        ? allPdfs.filter((p) => p.title?.toLowerCase().includes(term))
        : [],
    [allPdfs, term, isSearching]
  );
  const matchedUpdates = useMemo(
    () =>
      isSearching
        ? allUpdates.filter((u) => u.title?.toLowerCase().includes(term))
        : [],
    [allUpdates, term, isSearching]
  );

  // ── SEARCH RESULTS VIEW ─────────────────────────────────────────
  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-14 min-h-[70vh]"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold font-display mb-2 tracking-tight">
          Results for{" "}
          <span className="gradient-text">&ldquo;{debouncedSearch}&rdquo;</span>
        </h2>
        <p className="text-muted-foreground mb-10">
          {matchedTools.length + matchedPdfs.length + matchedUpdates.length}{" "}
          item{matchedTools.length + matchedPdfs.length + matchedUpdates.length === 1 ? "" : "s"} found
        </p>

        {matchedTools.length === 0 && matchedPdfs.length === 0 && matchedUpdates.length === 0 ? (
          <div className="text-center py-24">
            <div className="glass-card-static inline-flex p-6 rounded-3xl mb-6">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No results. Try a different keyword.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {matchedTools.length > 0 && (
              <ResultSection title="Tools" icon={Wrench} count={matchedTools.length} viewAll="/tools">
                <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-wrap gap-3">
                  {matchedTools.map((t, i) => (
                    <div key={t.id} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)]">
                      <ToolCard tool={t as Tool} index={i} />
                    </div>
                  ))}
                </motion.div>
              </ResultSection>
            )}

            {matchedPdfs.length > 0 && (
              <ResultSection title="PDFs" icon={BookOpen} count={matchedPdfs.length} viewAll="/pdfs">
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
                  {matchedPdfs.map((p) => (
                    <Link
                      key={p.id}
                      href={`/pdfs/${p.slug || p.id}`}
                      className="flex-none w-[40vw] md:w-[200px] snap-start"
                    >
                      {p.cover_image_url ? (
                        <img
                          src={p.cover_image_url}
                          alt={p.title}
                          className="w-full aspect-[2/3] object-cover rounded-xl shadow-md hover:scale-[1.03] transition-transform"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted rounded-xl shadow-md">
                          <BookOpen className="h-8 w-8 text-primary/40" />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </ResultSection>
            )}

            {matchedUpdates.length > 0 && (
              <ResultSection title="Updates" icon={Bell} count={matchedUpdates.length} viewAll="/updates">
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide">
                  {matchedUpdates.map((u) => (
                    <Link
                      key={u.id}
                      href={`/updates/${u.slug || u.id}`}
                      className="flex-none w-[88vw] md:w-[720px] snap-center rounded-xl overflow-hidden shadow-md"
                    >
                      {u.image_url ? (
                        <img
                          src={u.image_url}
                          alt={u.title}
                          className="w-full aspect-[1200/620] object-cover block hover:scale-[1.02] transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[1200/620] flex items-center justify-center bg-muted">
                          <Bell className="h-10 w-10 text-primary/40" />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </ResultSection>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // ── DEFAULT HOME VIEW ───────────────────────────────────────────
  return (
    <div className="relative">
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent)]">
          <ParticleBackground />
        </div>
        <div className="absolute -top-20 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl -z-10" />
        <div className="absolute -bottom-20 -left-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl -z-10" />

        <div className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-static mb-6 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Curated for students &amp; educators</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-display mb-6 tracking-tight leading-[1.05]">
              Your gateway to
              <br />
              <span className="gradient-text">educational excellence</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Discover curated tools, free PDFs, and real-time updates designed
              to enhance your learning journey.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/tools" className="btn-primary">
                Explore Tools <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pdfs" className="btn-secondary">
                Browse PDFs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LATEST CONTENT ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-12 space-y-16">
        {/* New PDFs */}
        <CarouselBlock
          title="Fresh PDFs"
          subtitle="Added in the last 30 days"
          icon={BookOpen}
          accent="emerald"
          viewAll="/pdfs"
          empty="No new PDFs in the last 30 days."
          isEmpty={!newPdfs.length}
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide"
          >
            {newPdfs.map((pdf) => (
              <motion.div
                key={pdf.id}
                variants={scaleIn}
                className="flex-none w-[40vw] md:w-[200px] snap-start"
              >
                <Link href={`/pdfs/${pdf.slug || pdf.id}`} className="block group">
                  {pdf.cover_image_url ? (
                    <div className="relative overflow-hidden rounded-xl shadow-lg ring-1 ring-border/20">
                      <img
                        src={pdf.cover_image_url}
                        alt={pdf.title}
                        className="w-full aspect-[2/3] object-cover block group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted rounded-xl shadow-lg">
                      <BookOpen className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                  <p className="text-xs font-medium mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {pdf.title}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </CarouselBlock>

        {/* Latest Updates */}
        <CarouselBlock
          title="Latest Updates"
          subtitle="Hot off the press"
          icon={Bell}
          accent="violet"
          viewAll="/updates"
          empty="No new updates in the last 30 days."
          isEmpty={!newUpdates.length}
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide"
          >
            {newUpdates.map((update) => (
              <motion.div
                key={update.id}
                variants={fadeUp}
                className="flex-none w-[88vw] md:w-[720px] snap-center"
              >
                <Link
                  href={`/updates/${update.slug || update.id}`}
                  className="block rounded-2xl overflow-hidden shadow-lg ring-1 ring-border/20 group"
                >
                  {update.image_url ? (
                    <div className="aspect-[1200/620] w-full">
                      <img
                        src={update.image_url}
                        alt={update.title}
                        className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[1200/620] w-full flex items-center justify-center bg-muted">
                      <Bell className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </CarouselBlock>
      </section>

      {/* ── ALL TOOLS REPOSITORY ──────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-400/10 ring-1 ring-emerald-400/25">
            <Wrench className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Tools Repository
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Newest tools added</p>
          </div>
          <Link
            href="/tools"
            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {newestTools.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {newestTools.map((tool, i) => (
              <div
                key={tool.id}
                className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)]"
              >
                <ToolCard tool={tool} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No tools found.</p>
        )}
      </section>

      {/* ── ABOUT + CONTACT ──────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card-static p-8 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-400/5 ring-1 ring-sky-400/20">
                  <Info className="h-5 w-5 text-sky-500" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">About EduDock</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                EduDock is your all-in-one educational hub. We provide a curated
                collection of powerful web tools, high-quality PDF study materials,
                and real-time updates for students and educators. Our goal is to
                organize the chaos of online learning into one clean, seamless,
                lightning-fast platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card-static p-8 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/[0.06] blur-3xl rounded-full pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Get in touch</h2>
                </div>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Have a tool suggestion, found a bug, or want to contribute a PDF?
                  We&rsquo;d love to hear from you.
                </p>
                <a
                  href="mailto:edudockadmin@gmail.com"
                  className="inline-flex w-full items-center justify-center gap-2.5 py-3.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-all duration-300 border border-primary/15 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                >
                  <Mail className="h-4 w-4" />
                  edudockadmin@gmail.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────
function CarouselBlock({
  title,
  subtitle,
  icon: Icon,
  accent,
  viewAll,
  isEmpty,
  empty,
  children,
}: {
  title: string;
  subtitle: string;
  icon: any;
  accent: "emerald" | "violet" | "sky";
  viewAll: string;
  isEmpty: boolean;
  empty: string;
  children: React.ReactNode;
}) {
  const accentClass = {
    emerald: "from-emerald-400/20 to-green-400/10 ring-emerald-400/25 text-emerald-500",
    violet: "from-violet-400/20 to-purple-400/10 ring-violet-400/25 text-violet-500",
    sky: "from-sky-400/20 to-blue-400/10 ring-sky-400/25 text-sky-500",
  }[accent];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3 mb-5"
      >
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${accentClass} ring-1`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <Link
          href={viewAll}
          className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
      {isEmpty ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{empty}</p>
      ) : (
        children
      )}
    </div>
  );
}

function ResultSection({
  title,
  icon: Icon,
  count,
  viewAll,
  children,
}: {
  title: string;
  icon: any;
  count: number;
  viewAll: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {count} {title.toLowerCase()} found
            </p>
          </div>
        </div>
        <Link
          href={viewAll}
          className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {children}
    </div>
  );
}
