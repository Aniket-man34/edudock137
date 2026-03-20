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
                className="text-muted-foreground text-base md:text-lg max-w-md mb-8 leading-relaxed"
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
