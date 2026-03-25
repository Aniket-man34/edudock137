import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Clock, Info, Mail, BookOpen, Bell, Wrench } from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import ParticleBackground from '@/components/ParticleBackground';

type ContextType = { searchQuery: string };

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Home() {
  const { searchQuery } = useOutletContext<ContextType>();

  // --- EXISTING QUERIES ---
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error; return data;
    },
  });

  const { data: tools } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tools').select('*').order('name');
      if (error) throw error; return data;
    },
  });

  // --- NEW: TRENDING QUERIES (Sorted by Clicks) ---
  const { data: trendingUpdates } = useQuery({
    queryKey: ['trending_updates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('updates').select('*').order('clicks', { ascending: false }).limit(6);
      if (error) throw error; return data || [];
    }
  });

  const { data: trendingPdfs } = useQuery({
    queryKey: ['trending_pdfs'],
    queryFn: async () => {
      // Use 'as any' just in case TypeScript complains about clicks column locally
      const { data, error } = await (supabase.from('pdfs' as any) as any).select('*').order('clicks', { ascending: false }).limit(6);
      if (error) throw error; return data || [];
    }
  });

  // --- FRESH ARRIVALS QUERIES (Last 30 Days) ---
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysIso = thirtyDaysAgo.toISOString();

  const { data: newPdfs } = useQuery({
    queryKey: ['new_pdfs'],
    queryFn: async () => {
      const { data } = await supabase.from('pdfs').select('*').gte('created_at', thirtyDaysIso).order('created_at', { ascending: false }).limit(4);
      return data || [];
    }
  });

  const { data: newUpdates } = useQuery({
    queryKey: ['new_updates'],
    queryFn: async () => {
      const { data } = await supabase.from('updates').select('*').gte('created_at', thirtyDaysIso).order('created_at', { ascending: false }).limit(3);
      return data || [];
    }
  });

  const filteredTools = tools?.filter((t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.short_description?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Trending Tools sorted by clicks
  const trendingTools = tools?.sort((a: any, b: any) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 6) || []; 

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 md:py-28 min-h-[65vh] flex items-center">
        <ParticleBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background pointer-events-none" />
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-primary/10 blur-[100px] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-10 right-[15%] w-48 h-48 rounded-full bg-secondary/10 blur-[80px] animate-glow-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="container mx-auto relative z-10">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col md:flex-row items-center gap-8 md:gap-20">
            <div className="flex-1 text-center md:text-left">
              <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-subtle border border-primary/20 text-xs font-semibold text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Your Learning Hub
              </motion.span>
              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-[1.1] tracking-tight">
                Welcome to <span className="gradient-text">EduDock</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-muted-foreground text-base md:text-lg max-w-md mb-8 leading-relaxed mx-auto md:mx-0">
                Discover curated educational tools, resources, and updates — everything you need in one place.
              </motion.p>
              <motion.div variants={fadeUp} className="flex gap-3 justify-center md:justify-start">
                <Link to="/tools" className="btn-primary">Explore Tools <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/pdfs" className="btn-secondary">Browse PDFs</Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="flex-1 max-w-sm md:max-w-md">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 blur-2xl opacity-60 animate-glow-pulse" />
                <img src="/hero-image.png" alt="EduDock Hero" className="relative w-full rounded-2xl animate-float" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- COMMUNITY BANNER START --- */}
      <section className="container mx-auto px-4 pb-12">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 md:px-8 rounded-2xl border border-border/50 bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg hidden md:block"><Sparkles className="h-5 w-5 text-primary" /></div>
            <div className="text-center md:text-left">
              <h3 className="text-sm font-bold text-foreground">Join the Community</h3>
              <p className="text-xs text-muted-foreground">Get instant alerts for new study materials & updates.</p>
            </div>
          </div>
          <div className="flex flex-row gap-3 w-full md:w-auto">
            <a href="https://whatsapp.com/channel/0029VbCi3v5DZ4LZBkI0470b" target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-sm rounded-lg transition-colors border border-[#25D366]/20">
              WhatsApp
            </a>
            <a href="https://t.me/edudock" target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] font-semibold text-sm rounded-lg transition-colors border border-[#0088cc]/20">
              Telegram
            </a>
          </div>
        </motion.div>
      </section>

      {/* ============================================================== */}
      {/* NETFLIX-STYLE TRENDING SECTION                 */}
      {/* ============================================================== */}
      <section className="container mx-auto px-4 pb-16 overflow-hidden">
        <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-4">
          <div className="relative">
            <TrendingUp className="h-7 w-7 text-orange-500" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full animate-ping"></span>
          </div>
          <h2 className="text-2xl font-bold font-display">Trending Now</h2>
        </div>

        {/* 1. TRENDING TOOLS ROW */}
        <div className="mb-10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground/80"><Wrench className="h-5 w-5 text-emerald-500" /> Top Tools</h3>
          {/* Netflix Slider Container */}
          <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-1 -mx-1 snap-x snap-mandatory scrollbar-hide">
            {trendingTools.map((tool, i) => (
              <div key={tool.id} className="min-w-[280px] md:min-w-[320px] snap-start shrink-0 relative group">
                {/* Ranking Badge */}
                <div className={`absolute -top-3 -left-3 z-20 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-lg border transform -rotate-12 transition-transform group-hover:rotate-0
                  ${i === 0 ? 'bg-yellow-500 border-yellow-400 text-black' : i === 1 ? 'bg-slate-300 border-slate-200 text-black' : i === 2 ? 'bg-orange-400 border-orange-300 text-black' : 'bg-muted border-border text-muted-foreground'}`}>
                  #{i + 1}
                </div>
                <ToolCard tool={tool} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* 2. TRENDING PDFS ROW */}
        {trendingPdfs && trendingPdfs.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground/80"><BookOpen className="h-5 w-5 text-primary" /> Most Read PDFs</h3>
            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-1 -mx-1 snap-x snap-mandatory scrollbar-hide">
              {trendingPdfs.map((pdf, i) => (
                <Link to={`/pdfs/${pdf.id}`} key={pdf.id} className="glass-card flex flex-col p-4 rounded-2xl hover:-translate-y-1 transition-all group border border-border/50 min-w-[200px] md:min-w-[240px] snap-start shrink-0 relative">
                  <div className={`absolute -top-3 -left-3 z-20 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shadow-lg border transform -rotate-12 transition-transform group-hover:rotate-0
                    ${i === 0 ? 'bg-yellow-500 border-yellow-400 text-black' : i === 1 ? 'bg-slate-300 border-slate-200 text-black' : i === 2 ? 'bg-orange-400 border-orange-300 text-black' : 'bg-muted border-border text-muted-foreground'}`}>
                    #{i + 1}
                  </div>
                  <div className="relative h-40 w-full mb-3 rounded-xl overflow-hidden bg-black/20">
                    <img src={pdf.cover_image_url || '/placeholder.png'} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={pdf.name} />
                  </div>
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{pdf.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 3. TRENDING UPDATES ROW */}
        {trendingUpdates && trendingUpdates.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground/80"><Bell className="h-5 w-5 text-blue-500" /> Hot Updates</h3>
            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-1 -mx-1 snap-x snap-mandatory scrollbar-hide">
              {trendingUpdates.map((update, i) => (
                <Link to={`/updates/${update.id}`} key={update.id} className="glass-card flex flex-col p-4 rounded-2xl hover:-translate-y-1 transition-all group border border-border/50 min-w-[260px] md:min-w-[300px] snap-start shrink-0 relative">
                  <div className={`absolute -top-3 -left-3 z-20 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shadow-lg border transform -rotate-12 transition-transform group-hover:rotate-0
                    ${i === 0 ? 'bg-yellow-500 border-yellow-400 text-black' : i === 1 ? 'bg-slate-300 border-slate-200 text-black' : i === 2 ? 'bg-orange-400 border-orange-300 text-black' : 'bg-muted border-border text-muted-foreground'}`}>
                    #{i + 1}
                  </div>
                  <div className="relative h-36 w-full mb-3 rounded-xl overflow-hidden bg-black/20">
                    <img src={update.image_url || '/placeholder.png'} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                  </div>
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{update.headline}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* --- WHATS NEW SECTION (Last 30 Days) --- */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
          <Clock className="h-7 w-7 text-blue-500" />
          <h2 className="text-2xl font-bold font-display">Fresh Arrivals (Last 30 Days)</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New PDFs List */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> New PDFs</h3>
              <Link to="/pdfs" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {newPdfs?.map(pdf => (
                <Link to={`/pdfs/${pdf.id}`} key={pdf.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition border border-border/50 group">
                  <img src={pdf.cover_image_url || '/placeholder.png'} className="w-10 h-12 object-cover rounded bg-black/20" alt="" />
                  <p className="text-sm font-medium flex-1 truncate group-hover:text-primary transition-colors">{pdf.name}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              {newPdfs?.length === 0 && <p className="text-xs text-muted-foreground py-2">No new PDFs in the last 30 days.</p>}
            </div>
          </div>

          {/* New Updates List */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/> Latest Updates</h3>
              <Link to="/updates" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {newUpdates?.map(update => (
                <Link to={`/updates/${update.id}`} key={update.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition border border-border/50 group">
                  <img src={update.image_url || '/placeholder.png'} className="w-12 h-10 object-cover rounded bg-black/20" alt="" />
                  <p className="text-sm font-medium flex-1 truncate group-hover:text-primary transition-colors">{update.headline}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              {newUpdates?.length === 0 && <p className="text-xs text-muted-foreground py-2">No new updates in the last 30 days.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* --- ALL TOOLS BY CATEGORY --- */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
          <Wrench className="h-7 w-7 text-emerald-500" />
          <h2 className="text-2xl font-bold font-display">All Tools Repository</h2>
        </div>
        {categories && categories.length > 0 ? (
          categories.map((cat) => {
            const catTools = filteredTools?.filter((t) => t.category_id === cat.id);
            if (!catTools || catTools.length === 0) return null;
            return (
              <div key={cat.id} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {catTools.map((tool, i) => (
                    <ToolCard key={tool.id} tool={tool} index={i} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted-foreground">No tools found.</p>
        )}
      </section>

      {/* --- ABOUT & CONTACT SECTION --- */}
      <section className="border-t border-border/50 bg-muted/10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* About Us */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">About EduDock</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                EduDock is your all-in-one educational hub. We provide a curated collection of powerful web tools, 
                high-quality PDF study materials, and real-time updates for students and educators. 
                Our goal is to organize the chaos of online learning into one clean, seamless, and lightning-fast platform.
              </p>
            </div>

            {/* Contact Us */}
            <div className="glass-card p-6 rounded-2xl border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Get in Touch</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Have a tool suggestion, found a bug, or want to contribute a PDF? We'd love to hear from you.
              </p>
              <a 
                href="mailto:am46697032@gmail.com" 
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors"
              >
                <Mail className="h-4 w-4" />
                am4669703@gmail.com
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}