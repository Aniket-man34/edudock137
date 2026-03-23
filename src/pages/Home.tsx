import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import ParticleBackground from '@/components/ParticleBackground';

type ContextType = { searchQuery: string };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const { searchQuery } = useOutletContext<ContextType>();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: tools } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tools').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const filteredTools = tools?.filter(
    (t) =>
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 md:py-28 min-h-[65vh] flex items-center">
        <ParticleBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background pointer-events-none" />

        {/* Decorative glow orbs */}
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-primary/10 blur-[100px] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-10 right-[15%] w-48 h-48 rounded-full bg-secondary/10 blur-[80px] animate-glow-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

        <div className="container mx-auto relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col md:flex-row items-center gap-8 md:gap-20"
          >
            <div className="flex-1 text-center md:text-left">
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-subtle border border-primary/20 text-xs font-semibold text-primary mb-6"
              >
                <Sparkles className="h-3.5 w-3.5" /> Your Learning Hub
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-[1.1] tracking-tight"
              >
                Welcome to{' '}
                <span className="gradient-text">EduDock</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-base md:text-lg max-w-md mb-8 leading-relaxed mx-auto md:mx-0"
              >
                Discover curated educational tools, resources, and updates — everything you need in one place.
              </motion.p>

              <motion.div variants={fadeUp} className="flex gap-3 justify-center md:justify-start">
                <Link to="/tools" className="btn-primary">
                  Explore Tools <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/pdfs" className="btn-secondary">
                  Browse PDFs
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              className="flex-1 max-w-sm md:max-w-md"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 blur-2xl opacity-60 animate-glow-pulse" />
                <img
                  src="/hero-image.png"
                  alt="EduDock Hero"
                  className="relative w-full rounded-2xl animate-float"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- COMMUNITY BANNER START (COMPACT) --- */}
      <section className="container mx-auto px-4 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 md:px-8 rounded-2xl border border-border/50 bg-gradient-to-r from-background to-muted/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg hidden md:block">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-sm font-bold text-foreground">Join the Community</h3>
              <p className="text-xs text-muted-foreground">Get instant alerts for new study materials & updates.</p>
            </div>
          </div>
          
          <div className="flex flex-row gap-3 w-full md:w-auto">
            {/* WhatsApp Button */}
            <a 
              href="https://whatsapp.com/channel/0029VbCi3v5DZ4LZBkI0470b" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-sm rounded-lg transition-colors border border-[#25D366]/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </a>

            {/* Telegram Button */}
            <a 
              href="https://t.me/edudock" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] font-semibold text-sm rounded-lg transition-colors border border-[#0088cc]/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </a>
          </div>
        </motion.div>
      </section>
      {/* --- COMMUNITY BANNER END --- */}

      {/* Tools by Category */}
      <section className="container mx-auto px-4 pb-16">
        {categories && categories.length > 0 ? (
          categories.map((cat) => {
            const catTools = filteredTools?.filter((t) => t.category_id === cat.id);
            if (!catTools || catTools.length === 0) return null;
            return (
              <div key={cat.id} className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="page-header">{cat.name}</h2>
                  </div>
                  <Link to="/tools" className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {catTools.map((tool, i) => (
                    <ToolCard key={tool.id} tool={tool} index={i} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="glass-card inline-flex p-4 rounded-2xl mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg">No tools yet — add some from the admin panel!</p>
          </div>
        )}

        {filteredTools && filteredTools.filter((t) => !t.category_id).length > 0 && (
          <div className="mb-14">
            <h2 className="page-header mb-6">Other Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTools.filter((t) => !t.category_id).map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}