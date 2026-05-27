import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Clock,
  Info,
  Mail,
  BookOpen,
  Bell,
  Wrench,
  Eye,
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

// New-design glass card utility class
const glassCard =
  'bg-white/70 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]';

// Color wheel for category icon backgrounds
const catColors = [
  'bg-blue-50 group-hover:bg-blue-100 text-blue-500',
  'bg-purple-50 group-hover:bg-purple-100 text-purple-500',
  'bg-teal-50 group-hover:bg-teal-100 text-teal-500',
  'bg-pink-50 group-hover:bg-pink-100 text-pink-500',
  'bg-emerald-50 group-hover:bg-emerald-100 text-emerald-500',
  'bg-indigo-50 group-hover:bg-indigo-100 text-indigo-500',
  'bg-amber-50 group-hover:bg-amber-100 text-amber-500',
  'bg-rose-50 group-hover:bg-rose-100 text-rose-500',
];

export default function Home() {
  const { searchQuery } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const [heroImageError, setHeroImageError] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['tool_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('entity_type', 'tool')
        .order('title');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tools } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('title');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allPdfs } = useQuery({
    queryKey: ['search_pdfs'],
    queryFn: async () => {
      const { data } = await supabase.from('pdfs').select(
        'id, title, cover_image_url, clicks, slug'
      );
      return data || [];
    },
  });

  const { data: allUpdates } = useQuery({
    queryKey: ['search_updates'],
    queryFn: async () => {
      const { data } = await supabase.from('updates').select(
        'id, title, image_url, clicks, slug'
      );
      return data || [];
    },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysIso = thirtyDaysAgo.toISOString();

  const { data: newPdfs } = useQuery({
    queryKey: ['new_pdfs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pdfs')
        .select('*')
        .gte('created_at', thirtyDaysIso)
        .order('created_at', { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  const { data: newUpdates } = useQuery({
    queryKey: ['new_updates'],
    queryFn: async () => {
      const { data } = await supabase
        .from('updates')
        .select('*')
        .gte('created_at', thirtyDaysIso)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const term = searchQuery?.toLowerCase().trim() || '';
  const searchMatchedTools =
    tools?.filter(
      (t: any) =>
        t.title.toLowerCase().includes(term) ||
        t.short_description?.toLowerCase().includes(term)
    ) || [];
  const searchMatchedPdfs =
    allPdfs?.filter((p: any) => p.title.toLowerCase().includes(term)) || [];
  const searchMatchedUpdates =
    allUpdates?.filter((u: any) => u.title.toLowerCase().includes(term)) ||
    [];
  const isSearching = term.length > 0;

  // ── SEARCH RESULTS VIEW ──
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
          className="text-3xl md:text-4xl font-extrabold font-display mb-10 tracking-tight text-slate-800"
        >
          Results for{' '}
          <span className="bg-gradient-to-r from-sky-400 to-pink-500 bg-clip-text text-transparent">
            &ldquo;{searchQuery}&rdquo;
          </span>
        </motion.h2>

        {searchMatchedTools.length === 0 &&
          searchMatchedPdfs.length === 0 &&
          searchMatchedUpdates.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative overflow-hidden rounded-3xl border border-dashed border-slate-200 ${glassCard} p-14 text-center`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 via-transparent to-pink-400/5 pointer-events-none" />
              <p className="relative text-slate-500 text-lg">
                No matches found for &ldquo;
                <span className="text-slate-800 font-medium">
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
                className="flex items-center gap-3 mb-7 pb-4"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Wrench className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  Tools{' '}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    ({searchMatchedTools.length})
                  </span>
                </h3>
              </motion.div>
              <div className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full" style={{ touchAction: 'pan-x' }}>
                {searchMatchedTools.map((tool: any, i: number) => (
                  <motion.div key={tool.id} variants={fadeUp} className="min-w-[280px] shrink-0">
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
                className="flex items-center gap-3 mb-7 pb-4"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  PDFs & Study Materials{' '}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    ({searchMatchedPdfs.length})
                  </span>
                </h3>
              </motion.div>

              <div className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full" style={{ touchAction: 'pan-x' }}>
                {searchMatchedPdfs.map((pdf: any) => (
                  <motion.div key={pdf.id} variants={fadeUp} className="min-w-[300px] shrink-0">
                    <Link
                      to={`/pdfs/${pdf.slug || pdf.id}`}
                      className="group/pdf flex flex-row gap-4 p-4 rounded-2xl bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-[#1f1f1f]">
                        {pdf.cover_image_url ? (
                          <img
                            src={pdf.cover_image_url}
                            alt={pdf.title}
                            className="aspect-[2/3] object-cover rounded-lg shadow-sm shrink-0 block w-full h-full"
                            loading="lazy"
                          />
                        ) : (
                          <div className="aspect-[2/3] w-full h-full flex flex-col items-center justify-center p-2 gap-1 bg-slate-100 dark:bg-[#1f1f1f]">
                            <BookOpen className="h-5 w-5 text-slate-400" />
                            <span className="font-semibold text-[10px] text-center leading-snug line-clamp-2 text-slate-500">
                              {pdf.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 leading-snug group-hover/pdf:text-sky-500 transition-colors duration-300">
                          {pdf.title}
                        </h4>
                        {pdf.clicks > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Eye className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{pdf.clicks}</span>
                          </div>
                        )}
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
                className="flex items-center gap-3 mb-7 pb-4"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Bell className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  Updates{' '}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    ({searchMatchedUpdates.length})
                  </span>
                </h3>
              </motion.div>
              <div className="flex flex-row flex-nowrap overflow-x-auto gap-6 pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full" style={{ touchAction: 'pan-x' }}>
                {searchMatchedUpdates.map((update: any) => (
                  <motion.div key={update.id} variants={fadeUp} className="min-w-[380px] shrink-0">
                    <Link
                      to={`/updates/${update.slug || update.id}`}
                      className="group flex flex-row gap-4 p-4 rounded-2xl bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="w-48 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-[#1f1f1f]">
                        {update.image_url ? (
                          <img
                            src={update.image_url}
                            alt={update.title}
                            className="w-full aspect-[1200/630] object-cover rounded-lg shrink-0 block"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-[1200/630] flex items-center justify-center bg-slate-200 dark:bg-[#2a2a2a] rounded-lg">
                            <Bell className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-sm text-slate-800 leading-snug group-hover:text-sky-500 transition-colors duration-300">
                          {update.title}
                        </h4>
                        {update.clicks > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Eye className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{update.clicks}</span>
                          </div>
                        )}
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

  // ═══════════════ MAIN HOME VIEW ═══════════════
  return (
    <div className="relative bg-slate-50/50">
      {/* ──────── HERO ──────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-10 md:pb-32 min-h-[55vh] flex items-center mt-4">
        <ParticleBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/[0.04] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[-5%] left-[8%] w-80 h-80 rounded-full bg-sky-400/[0.08] blur-[130px] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-[5%] right-[12%] w-64 h-64 rounded-full bg-pink-400/[0.06] blur-[110px] animate-glow-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[50%] w-48 h-48 rounded-full bg-violet-400/[0.05] blur-[90px] animate-glow-pulse pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="container mx-auto relative z-10">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
            <div className="flex-1 text-center md:text-left">
              <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-300/40 bg-sky-400/[0.08] backdrop-blur-md text-xs font-semibold text-sky-600 mb-7 tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5" /> Your Learning Hub
              </motion.span>
              <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-5 leading-[1.08] tracking-tight">
                <span className="bg-gradient-to-r from-sky-400 to-pink-500 bg-clip-text text-transparent">Welcome to</span>
                <br />
                <span className="text-slate-800">EduDock</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-slate-500 text-base md:text-lg max-w-lg mb-9 leading-relaxed mx-auto md:mx-0">
                Discover curated educational tools, resources, and updates — everything you need in one place.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link to="/tools" className="bg-gradient-to-r from-blue-400 to-blue-500 px-8 py-3.5 rounded-full text-white font-bold shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] hover:opacity-90 transition inline-flex items-center gap-2">
                  Explore Tools <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/pdfs" className="border-2 border-blue-400 px-8 py-3.5 rounded-full text-blue-600 font-bold hover:bg-blue-50 transition">
                  Browse PDFs
                </Link>
              </motion.div>
            </div>

            <motion.div variants={scaleIn} className="flex-1 max-w-sm md:max-w-md hidden md:block">
              <div className="relative flex justify-center">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-sky-400/20 via-violet-400/10 to-pink-400/20 blur-3xl opacity-50 animate-glow-pulse" />
                {!heroImageError ? (
                  <img src="/hero-image.png" alt="EduDock Hero" className="relative w-full max-w-xl rounded-2xl animate-float drop-shadow-2xl" onError={() => setHeroImageError(true)} />
                ) : (
                  <div className="relative w-full aspect-square max-w-xl rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-white/80 via-white/40 to-white/60 backdrop-blur-2xl animate-float">
                    <div className="absolute top-6 right-8 w-20 h-20 rounded-full bg-sky-400/20 blur-[40px]" />
                    <div className="absolute bottom-10 left-6 w-16 h-16 rounded-full bg-pink-400/20 blur-[35px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-violet-400/15 blur-[45px]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-sky-400/20 blur-[30px] rounded-full" />
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-400/30 via-sky-400/10 to-transparent border border-sky-400/20 flex items-center justify-center backdrop-blur-sm">
                          <GraduationCap className="h-12 w-12 text-sky-500" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold bg-gradient-to-r from-sky-400 to-pink-500 bg-clip-text text-transparent">EduDock</p>
                        <p className="text-xs text-slate-500 mt-1">Learn. Discover. Grow.</p>
                      </div>
                    </div>
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-8 left-8 w-14 h-14 rounded-2xl bg-white/60 border border-slate-200 backdrop-blur-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-400/70" />
                    </motion.div>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute top-12 right-10 w-12 h-12 rounded-2xl bg-white/60 border border-slate-200 backdrop-blur-lg flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-emerald-400/70" />
                    </motion.div>
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute bottom-12 right-12 w-12 h-12 rounded-2xl bg-white/60 border border-slate-200 backdrop-blur-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-purple-400/70" />
                    </motion.div>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} className="absolute bottom-16 left-10 w-11 h-11 rounded-2xl bg-white/60 border border-slate-200 backdrop-blur-lg flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-amber-400/70" />
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ──────── COMMUNITY BANNER ──────── */}
      <section className="container mx-auto px-4 pb-14">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className={`relative overflow-hidden rounded-2xl ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400/[0.05] via-transparent to-violet-400/[0.05] pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-sky-400/[0.08] blur-[60px] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 py-5 px-6 md:px-10">
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-400/5 ring-1 ring-sky-400/20">
                <Sparkles className="h-5 w-5 text-sky-500" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Join the Community</h3>
                <p className="text-xs text-slate-500 mt-0.5">Get instant alerts for new study materials & updates.</p>
              </div>
            </div>
            <div className="flex flex-row gap-3 w-full md:w-auto">
              <a href="https://whatsapp.com/channel/0029VbCi3v5DZ4LZBkI0470b" target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-sm rounded-xl transition-all duration-300 border border-[#25D366]/20 hover:border-[#25D366]/40 hover:shadow-lg hover:shadow-[#25D366]/5">
                WhatsApp
              </a>
              <a href="https://t.me/edudock" target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] font-semibold text-sm rounded-xl transition-all duration-300 border border-[#0088cc]/20 hover:border-[#0088cc]/40 hover:shadow-lg hover:shadow-[#0088cc]/5">
                Telegram
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ──────── FRESH ARRIVALS ──────── */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div variants={sectionReveal} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400/20 to-cyan-400/10 ring-1 ring-blue-400/25">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Fresh Arrivals</h2>
            <p className="text-xs text-slate-500 mt-0.5">Added in the last 30 days</p>
          </div>
        </motion.div>

        {/* New PDFs — horizontal image-only carousel, no grid, no borders */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold flex items-center gap-2.5 text-slate-800">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20"><BookOpen className="h-4 w-4 text-sky-500" /></span>
              New PDFs
            </h3>
            <Link to="/pdfs" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-500 transition-colors group">
              View All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          {newPdfs && newPdfs.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide w-full">
              {newPdfs.map((pdf: any, idx: number) => (
                <motion.div key={pdf.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                  <Link to={`/pdfs/${pdf.slug || pdf.id}`}>
                    {pdf.cover_image_url ? (
                      <img
                        src={pdf.cover_image_url}
                        alt={pdf.title}
                        className="w-[35vw] md:w-44 flex-none snap-start aspect-[2/3] object-cover rounded-lg block shadow-sm transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-[35vw] md:w-44 flex-none snap-start aspect-[2/3] flex flex-col items-center justify-center p-2 gap-1 bg-slate-100 dark:bg-[#1f1f1f] rounded-lg shadow-sm transition-transform hover:scale-105">
                        <BookOpen className="h-8 w-8 text-slate-400" />
                        <span className="font-semibold text-[10px] text-center leading-snug line-clamp-2 text-slate-500">
                          {pdf.title}
                        </span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No new PDFs in the last 30 days.</p>
          )}
        </div>

        {/* Latest Updates — horizontal image-only carousel, 1200×620, no grid, no borders */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold flex items-center gap-2.5 text-slate-800">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20"><Bell className="h-4 w-4 text-violet-500" /></span>
              Latest Updates
            </h3>
            <Link to="/updates" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-500 transition-colors group">
              View All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          {newUpdates && newUpdates.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide w-full">
              {newUpdates.map((update: any, idx: number) => (
                <motion.div key={update.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  <Link to={`/updates/${update.slug || update.id}`}>
                    {update.image_url ? (
                      <img
                        src={update.image_url}
                        alt={update.title}
                        className="w-[90vw] md:w-[420px] flex-none snap-start aspect-[1200/620] object-cover rounded-lg block shadow-sm transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-[90vw] md:w-[420px] flex-none snap-start aspect-[1200/620] flex flex-col items-center justify-center gap-2 bg-slate-200 dark:bg-[#0f0f1a] rounded-lg shadow-sm transition-transform hover:scale-105">
                        <Bell className="h-8 w-8 text-slate-400 dark:text-violet-500/40" />
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 font-semibold">
                          No Preview
                        </span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No new updates in the last 30 days.</p>
          )}
        </div>
      </section>

      {/* ──────── ALL TOOLS REPOSITORY ──────── */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div variants={sectionReveal} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-400/10 ring-1 ring-emerald-400/25">
            <Wrench className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">All Tools Repository</h2>
            <p className="text-xs text-slate-500 mt-0.5">Browse by category</p>
          </div>
        </motion.div>
        {categories && categories.length > 0 ? (
          <div className="flex flex-wrap gap-6 items-stretch justify-start [&>*]:flex-[1_1_300px]">
            {categories.map((cat: any, idx: number) => {
              const catTools = tools?.filter((t: any) => t.category_id === cat.id);
              const color = catColors[idx % catColors.length];
              return (
                <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                  <Link to={`/tools?category=${cat.id}`} className={`${glassCard} p-10 rounded-3xl flex flex-col items-center justify-center space-y-6 group hover:scale-[1.02] transition duration-300 cursor-pointer block`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition duration-300 ${color}`}>
                      <Wrench className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-slate-700 text-lg text-center">{cat.name || cat.title}</span>
                    {catTools && <span className="text-xs text-slate-400 -mt-4">{catTools.length} tool{catTools.length !== 1 ? 's' : ''}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-10">No tools found.</p>
        )}
      </section>

      {/* ──────── ABOUT + GET IN TOUCH ──────── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-slate-50/50 pointer-events-none" />
        <div className="absolute bottom-10 left-[20%] w-64 h-64 bg-sky-400/[0.04] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-[15%] w-48 h-48 bg-violet-400/[0.04] blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-10 max-w-5xl mx-auto [&>*]:flex-1">
            {/* About */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-400/5 ring-1 ring-sky-400/20">
                  <Info className="h-5 w-5 text-sky-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">About EduDock</h2>
              </div>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                EduDock is your all-in-one educational hub. We provide a curated collection of powerful web tools, high-quality PDF study materials, and real-time updates for students and educators. Our goal is to organize the chaos of online learning into one clean, seamless, and lightning-fast platform.
              </p>
            </motion.div>

            {/* Get in Touch */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className={`relative overflow-hidden rounded-2xl ${glassCard} p-7`}>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-sky-400/[0.06] blur-[60px] rounded-full pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/20 to-sky-400/5 ring-1 ring-sky-400/20">
                    <Mail className="h-4 w-4 text-sky-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Get in Touch</h2>
                </div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Have a tool suggestion, found a bug, or want to contribute a PDF? We'd love to hear from you.
                </p>
                <a href="mailto:edudockadmin@gmail.com" className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-sky-400/10 hover:bg-sky-400/20 text-sky-600 font-medium rounded-xl transition-all duration-300 border border-sky-400/15 hover:border-sky-400/30 hover:shadow-lg hover:shadow-sky-400/5">
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