import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Info,
  Mail,
  BookOpen,
  Bell,
  Wrench,
  Eye,
  ChevronRight,
  Flame,
  GraduationCap,
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import ParticleBackground from '@/components/ParticleBackground';
import { useState } from 'react';

type ContextType = { searchQuery: string };

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const sectionReveal: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function getRankStyle(i: number) {
  if (i === 0)
    return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 border-yellow-300/60 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]';
  if (i === 1)
    return 'bg-gradient-to-br from-gray-200 via-slate-300 to-slate-400 border-slate-200/60 text-black shadow-[0_0_16px_rgba(148,163,184,0.3)]';
  if (i === 2)
    return 'bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600 border-orange-300/60 text-black shadow-[0_0_16px_rgba(249,115,22,0.3)]';
  return 'bg-muted/80 border-border/60 text-muted-foreground';
}

export default function Home() {
  const { searchQuery } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const [heroImageError, setHeroImageError] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const { data: tools } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('tools')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const { data: allPdfs } = useQuery({
    queryKey: ['search_pdfs'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('pdfs').select(
        'id, name, cover_image_url, clicks, slug' // Added slug
      );
      return (data as any[]) || [];
    },
  });

  const { data: allUpdates } = useQuery({
    queryKey: ['search_updates'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('updates').select(
        'id, headline, image_url, clicks, slug' // Added slug
      );
      return (data as any[]) || [];
    },
  });

  const { data: trendingUpdates } = useQuery({
    queryKey: ['trending_updates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('updates')
        .select('*')
        .order('clicks', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const { data: trendingPdfs } = useQuery({
    queryKey: ['trending_pdfs'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('pdfs')
        .select('*')
        .order('clicks', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysIso = thirtyDaysAgo.toISOString();

  const { data: newPdfs } = useQuery({
    queryKey: ['new_pdfs'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('pdfs')
        .select('*')
        .gte('created_at', thirtyDaysIso)
        .order('created_at', { ascending: false })
        .limit(4);
      return (data as any[]) || [];
    },
  });

  const { data: newUpdates } = useQuery({
    queryKey: ['new_updates'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('updates')
        .select('*')
        .gte('created_at', thirtyDaysIso)
        .order('created_at', { ascending: false })
        .limit(3);
      return (data as any[]) || [];
    },
  });

  const trendingTools =
    tools
      ?.sort((a: any, b: any) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 6) || [];

  const term = searchQuery?.toLowerCase().trim() || '';
  const searchMatchedTools =
    tools?.filter(
      (t: any) =>
        t.name.toLowerCase().includes(term) ||
        t.short_description?.toLowerCase().includes(term)
    ) || [];
  const searchMatchedPdfs =
    allPdfs?.filter((p: any) => p.name.toLowerCase().includes(term)) || [];
  const searchMatchedUpdates =
    allUpdates?.filter((u: any) => u.headline.toLowerCase().includes(term)) ||
    [];
  const isSearching = term.length > 0;

  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 py-14 min-h-screen"
      >
        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold font-display mb-10 tracking-tight"
        >
          Results for{' '}
          <span className="gradient-text">&ldquo;{searchQuery}&rdquo;</span>
        </motion.h2>

        {searchMatchedTools.length === 0 &&
          searchMatchedPdfs.length === 0 &&
          searchMatchedUpdates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-white/[0.02] backdrop-blur-xl p-14 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <p className="relative text-muted-foreground text-lg">
                No matches found for &ldquo;
                <span className="text-foreground font-medium">
                  {searchQuery}
                </span>
                &rdquo;. Try a different keyword.
              </p>
            </motion.div>
          )}

        {/* ── Tools Results ── */}
        <AnimatePresence>
          {searchMatchedTools.length > 0 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mb-14"
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 mb-7 border-b border-border/40 pb-4"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Wrench className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  Tools{' '}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({searchMatchedTools.length})
                  </span>
                </h3>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {searchMatchedTools.map((tool: any, i: number) => (
                  <motion.div key={tool.id} variants={fadeUp}>
                    <ToolCard tool={tool} index={i} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PDFs Results ── */}
        <AnimatePresence>
          {searchMatchedPdfs.length > 0 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mb-14"
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 mb-7 border-b border-border/40 pb-4"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  PDFs &amp; Study Materials{' '}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({searchMatchedPdfs.length})
                  </span>
                </h3>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                {searchMatchedPdfs.map((pdf: any) => (
                  <motion.div key={pdf.id} variants={fadeUp}>
                    <Link
                      to={`/pdfs/${pdf.slug || pdf.id}`}
                      className="group/pdf relative block rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:scale-[1.04] hover:z-10 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] hover:border-primary/30"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                        <img
                          src={pdf.cover_image_url || '/placeholder.png'}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/pdf:scale-110"
                          alt={pdf.name}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent opacity-0 group-hover/pdf:opacity-100 transition-opacity duration-500" />

                        {pdf.clicks > 0 && (
                          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/80 border border-white/10">
                            <Eye className="h-3 w-3" />
                            {pdf.clicks}
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-sm text-white leading-snug line-clamp-2 drop-shadow-lg group-hover/pdf:text-primary transition-colors duration-300">
                            {pdf.name}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Updates Results ── */}
        <AnimatePresence>
          {searchMatchedUpdates.length > 0 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mb-14"
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 mb-7 border-b border-border/40 pb-4"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Bell className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  Updates{' '}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({searchMatchedUpdates.length})
                  </span>
                </h3>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {searchMatchedUpdates.map((update: any) => (
                  <motion.div key={update.id} variants={fadeUp}>
                    <Link
                      to={`/updates/${update.slug || update.id}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-lg transition-all duration-500 hover:scale-[1.03] hover:z-10 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] hover:border-primary/30"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black/30">
                        <img
                          src={update.image_url || '/placeholder.png'}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {update.clicks > 0 && (
                          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/80 border border-white/10">
                            <Eye className="h-3 w-3" />
                            {update.clicks}
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="font-bold text-sm text-white leading-snug line-clamp-2 drop-shadow-lg group-hover:text-primary transition-colors duration-300">
                            {update.headline}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <section className="relative overflow-hidden px-4 pb-20 pt-10 md:pb-32 min-h-[55vh] flex items-center mt-4">
        <ParticleBackground />

        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-background pointer-events-none" />
        <div className="absolute top-[-5%] left-[8%] w-80 h-80 rounded-full bg-primary/[0.12] blur-[130px] animate-glow-pulse pointer-events-none" />
        <div
          className="absolute bottom-[5%] right-[12%] w-64 h-64 rounded-full bg-secondary/[0.10] blur-[110px] animate-glow-pulse pointer-events-none"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute top-[40%] left-[50%] w-48 h-48 rounded-full bg-accent/[0.08] blur-[90px] animate-glow-pulse pointer-events-none"
          style={{ animationDelay: '3s' }}
        />

        <div className="container mx-auto relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col md:flex-row items-center gap-10 md:gap-20"
          >
            <div className="flex-1 text-center md:text-left">
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] backdrop-blur-md text-xs font-semibold text-primary mb-7 tracking-wide uppercase"
              >
                <Sparkles className="h-3.5 w-3.5" /> Your Learning Hub
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-5 leading-[1.08] tracking-tight"
              >
                Welcome to{' '}
                <span className="gradient-text bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
                  EduDock
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-base md:text-lg max-w-lg mb-9 leading-relaxed mx-auto md:mx-0"
              >
                Discover curated educational tools, resources, and updates —
                everything you need in one place.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-3 justify-center md:justify-start"
              >
                <Link
                  to="/tools"
                  className="btn-primary group inline-flex items-center gap-2"
                >
                  Explore Tools{' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/pdfs" className="btn-secondary">
                  Browse PDFs
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={scaleIn}
              className="flex-1 max-w-sm md:max-w-md hidden md:block"
            >
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 blur-3xl opacity-50 animate-glow-pulse" />

                {!heroImageError ? (
                  <img
                    src="/hero-image.png"
                    alt="EduDock Hero"
                    className="relative w-full rounded-2xl animate-float drop-shadow-2xl"
                    onError={() => setHeroImageError(true)}
                  />
                ) : (
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent backdrop-blur-2xl animate-float">
                    <div className="absolute top-6 right-8 w-20 h-20 rounded-full bg-primary/20 blur-[40px]" />
                    <div className="absolute bottom-10 left-6 w-16 h-16 rounded-full bg-secondary/20 blur-[35px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent/15 blur-[45px]" />

                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full" />
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                          <GraduationCap className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold gradient-text bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          EduDock
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Learn. Discover. Grow.
                        </p>
                      </div>
                    </div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute top-8 left-8 w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-lg flex items-center justify-center"
                    >
                      <BookOpen className="h-6 w-6 text-blue-400/70" />
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                      }}
                      className="absolute top-12 right-10 w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-lg flex items-center justify-center"
                    >
                      <Wrench className="h-5 w-5 text-emerald-400/70" />
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                      }}
                      className="absolute bottom-12 right-12 w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-lg flex items-center justify-center"
                    >
                      <Bell className="h-5 w-5 text-purple-400/70" />
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1.5,
                      }}
                      className="absolute bottom-16 left-10 w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-lg flex items-center justify-center"
                    >
                      <Sparkles className="h-5 w-5 text-yellow-400/70" />
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] via-white/[0.01] to-white/[0.03] backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.05] via-transparent to-secondary/[0.05] pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/[0.08] blur-[60px] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 py-5 px-6 md:px-10">
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Join the Community
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get instant alerts for new study materials &amp; updates.
                </p>
              </div>
            </div>

            <div className="flex flex-row gap-3 w-full md:w-auto">
              <a
                href="https://whatsapp.com/channel/0029VbCi3v5DZ4LZBkI0470b"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-sm rounded-xl transition-all duration-300 border border-[#25D366]/20 hover:border-[#25D366]/40 hover:shadow-lg hover:shadow-[#25D366]/5"
              >
                WhatsApp
              </a>
              <a
                href="https://t.me/edudock"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] font-semibold text-sm rounded-xl transition-all duration-300 border border-[#0088cc]/20 hover:border-[#0088cc]/40 hover:shadow-lg hover:shadow-[#0088cc]/5"
              >
                Telegram
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex items-center justify-between mb-2"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 ring-1 ring-orange-500/25">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-orange-500 rounded-full animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-orange-500 rounded-full" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">
                  Trending Now
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Most popular across the platform
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 mb-10">
          <div className="h-px bg-gradient-to-r from-orange-500/40 via-red-500/20 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2.5 text-foreground">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Wrench className="h-4 w-4 text-emerald-400" />
                </span>
                Top Tools
              </h3>
              <Link
                to="/tools"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
              >
                See all
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="relative group/row">
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex overflow-x-auto gap-4 md:gap-5 pb-4 pt-2 px-4 md:px-8 snap-x snap-mandatory scrollbar-hide">
              {trendingTools.map((tool: any, i: number) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="min-w-[260px] md:min-w-[300px] lg:min-w-[320px] snap-start shrink-0 relative group/card"
                >
                  <div
                    className={`absolute -top-2.5 -left-2.5 z-30 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 transform -rotate-6 transition-all duration-500 group-hover/card:rotate-0 group-hover/card:scale-110 ${getRankStyle(i)}`}
                  >
                    {i + 1}
                  </div>
                  <ToolCard tool={tool} index={i} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {trendingPdfs && trendingPdfs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2.5 text-foreground">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </span>
                  Most Read PDFs
                </h3>
                <Link
                  to="/pdfs"
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
                >
                  See all
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

              <div className="flex overflow-x-auto gap-4 md:gap-5 pb-4 pt-2 px-4 md:px-8 snap-x snap-mandatory scrollbar-hide">
                {trendingPdfs.map((pdf: any, i: number) => (
                  <motion.div
                    key={pdf.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="snap-start shrink-0"
                  >
                    <Link
                      to={`/pdfs/${pdf.slug || pdf.id}`}
                      className="group/card relative block w-[180px] md:w-[220px] lg:w-[240px] rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:scale-[1.05] hover:z-20 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] hover:border-primary/30"
                    >
                      <div
                        className={`absolute top-3 left-3 z-30 w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border-2 transition-all duration-500 group-hover/card:scale-110 ${getRankStyle(i)}`}
                      >
                        {i + 1}
                      </div>

                      {pdf.clicks > 0 && (
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/80 border border-white/10">
                          <Eye className="h-3 w-3" />
                          {pdf.clicks}
                        </div>
                      )}

                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/30">
                        <img
                          src={pdf.cover_image_url || '/placeholder.png'}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                          alt={pdf.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="font-bold text-sm text-white leading-snug line-clamp-2 drop-shadow-lg group-hover/card:text-primary transition-colors duration-300">
                          {pdf.name}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {trendingUpdates && trendingUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2.5 text-foreground">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                    <Bell className="h-4 w-4 text-blue-400" />
                  </span>
                  Hot Updates
                </h3>
                <Link
                  to="/updates"
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
                >
                  See all
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

              <div className="flex overflow-x-auto gap-4 md:gap-5 pb-4 pt-2 px-4 md:px-8 snap-x snap-mandatory scrollbar-hide">
                {trendingUpdates.map((update: any, i: number) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="snap-start shrink-0"
                  >
                    <Link
                      to={`/updates/${update.slug || update.id}`}
                      className="group/card relative block w-[280px] md:w-[340px] lg:w-[380px] rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:scale-[1.03] hover:z-20 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] hover:border-primary/30"
                    >
                      <div
                        className={`absolute top-3 left-3 z-30 w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border-2 transition-all duration-500 group-hover/card:scale-110 ${getRankStyle(i)}`}
                      >
                        {i + 1}
                      </div>

                      {update.clicks > 0 && (
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/80 border border-white/10">
                          <Eye className="h-3 w-3" />
                          {update.clicks}
                        </div>
                      )}

                      <div className="relative aspect-video w-full overflow-hidden bg-black/30">
                        <img
                          src={update.image_url || '/placeholder.png'}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                        <h4 className="font-bold text-sm md:text-base text-white leading-snug line-clamp-2 drop-shadow-lg group-hover/card:text-primary transition-colors duration-300">
                          {update.headline}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="container mx-auto px-4 mt-10">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 ring-1 ring-blue-500/25">
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">
              Fresh Arrivals
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Added in the last 30 days
            </p>
          </div>
        </motion.div>

        <div className="h-px bg-gradient-to-r from-blue-500/40 via-cyan-500/20 to-transparent mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent backdrop-blur-2xl"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/[0.06] blur-[70px] rounded-full pointer-events-none" />
            <div className="relative p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg flex items-center gap-2.5 tracking-tight">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </span>
                  New PDFs
                </h3>
                <Link
                  to="/pdfs"
                  className="text-xs text-primary/70 hover:text-primary font-medium transition-colors flex items-center gap-1 group"
                >
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {newPdfs?.map((pdf: any, idx: number) => (
                  <motion.div
                    key={pdf.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      to={`/pdfs/${pdf.slug || pdf.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-300 border border-white/[0.04] hover:border-primary/25 group"
                    >
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-black/30 ring-1 ring-white/10 shrink-0">
                        <img
                          src={pdf.cover_image_url || '/placeholder.png'}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <p className="text-sm font-medium flex-1 truncate group-hover:text-primary transition-colors">
                        {pdf.name}
                      </p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 shrink-0" />
                    </Link>
                  </motion.div>
                ))}
                {newPdfs?.length === 0 && (
                  <p className="text-xs text-muted-foreground py-3 text-center">
                    No new PDFs in the last 30 days.
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent backdrop-blur-2xl"
          >
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-secondary/[0.06] blur-[70px] rounded-full pointer-events-none" />
            <div className="relative p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg flex items-center gap-2.5 tracking-tight">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                    <Bell className="h-4 w-4 text-primary" />
                  </span>
                  Latest Updates
                </h3>
                <Link
                  to="/updates"
                  className="text-xs text-primary/70 hover:text-primary font-medium transition-colors flex items-center gap-1 group"
                >
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {newUpdates?.map((update: any, idx: number) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      to={`/updates/${update.slug || update.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-300 border border-white/[0.04] hover:border-primary/25 group"
                    >
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-black/30 ring-1 ring-white/10 shrink-0">
                        <img
                          src={update.image_url || '/placeholder.png'}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <p className="text-sm font-medium flex-1 truncate group-hover:text-primary transition-colors">
                        {update.headline}
                      </p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 shrink-0" />
                    </Link>
                  </motion.div>
                ))}
                {newUpdates?.length === 0 && (
                  <p className="text-xs text-muted-foreground py-3 text-center">
                    No new updates in the last 30 days.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 ring-1 ring-emerald-500/25">
            <Wrench className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight">
              All Tools Repository
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse by category
            </p>
          </div>
        </motion.div>

        <div className="h-px bg-gradient-to-r from-emerald-500/40 via-green-500/20 to-transparent mb-10" />

        {categories && categories.length > 0 ? (
          categories.map((cat: any) => {
            const catTools = tools?.filter(
              (t: any) => t.category_id === cat.id
            );
            if (!catTools || catTools.length === 0) return null;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-12"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-2.5">
                    <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary via-primary/60 to-primary/20" />
                    {cat.name}
                  </h3>
                  <span className="text-xs text-muted-foreground/60">
                    {catTools.length} tool{catTools.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {catTools.map((tool: any, i: number) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    >
                      <ToolCard tool={tool} index={i} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-muted-foreground">No tools found.</p>
        )}
      </section>

      <section className="relative border-t border-white/[0.06] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-background pointer-events-none" />
        <div className="absolute bottom-10 left-[20%] w-64 h-64 bg-primary/[0.04] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-[15%] w-48 h-48 bg-secondary/[0.04] blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  About EduDock
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                EduDock is your all-in-one educational hub. We provide a curated
                collection of powerful web tools, high-quality PDF study
                materials, and real-time updates for students and educators. Our
                goal is to organize the chaos of online learning into one clean,
                seamless, and lightning-fast platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent backdrop-blur-2xl p-7"
            >
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/[0.06] blur-[60px] rounded-full pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Get in Touch
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  Have a tool suggestion, found a bug, or want to contribute a
                  PDF? We&apos;d love to hear from you.
                </p>
                <a
                  href="mailto:edudockadmin@gmail.com"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-all duration-300 border border-primary/15 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
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