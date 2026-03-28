import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ChevronRight } from 'lucide-react';

type ContextType = { searchQuery: string };

export default function Updates() {
  const { searchQuery } = useOutletContext<ContextType>();

  const { data: updates, isLoading } = useQuery({
    queryKey: ['updates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = updates?.filter(
    (u) =>
      !searchQuery ||
      u.headline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isNewUpdate = (createdAt: string) => {
    if (!createdAt) return false;
    const uploadDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - uploadDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">Updates</h1>
        <p className="page-subtitle">Latest news, notifications, and announcements</p>
      </motion.div>

      {isLoading ? (
        // Skeleton Loaders
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-full flex flex-col animate-pulse rounded-2xl border border-border/50 bg-muted/10 shadow-lg"
            >
              <div className="w-full aspect-[1200/630] bg-muted/30 rounded-t-2xl shrink-0" />
              <div className="p-5 flex-1 flex flex-col">
                <div className="h-5 bg-muted/30 rounded w-full mb-3" />
                <div className="h-5 bg-muted/30 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        // Actual Content
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((update, i) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: 'easeOut' }}
              className="h-full" // Forces equal height in grid
            >
              <Link
                to={`/updates/${update.id}`}
                className="glass-card flex flex-col h-full rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border border-border/50"
              >
                {/* --- IMAGE CONTAINER (Strict 1200x630 ratio) --- */}
                <div className="relative w-full aspect-[1200/630] bg-muted/30 overflow-hidden shrink-0">
                  <img
                    src={update.image_url || '/placeholder.png'}
                    alt={update.headline}
                    // using object-cover assumes you upload exactly 1200x630. If you want NO crop ever, change this to object-contain
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* --- GLOWING NEW BADGE --- */}
                  {isNewUpdate(update.created_at) && (
                    <div className="absolute top-3 left-3 z-30">
                      <span className="relative flex h-6 w-14 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30" />
                        <span className="relative inline-flex items-center justify-center h-6 w-14 rounded-md bg-blue-500/90 backdrop-blur-sm border border-blue-400/50 text-[10px] font-bold text-white uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          New
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* --- TEXT CONTAINER (Flex-1 forces it to fill remaining space) --- */}
                <div className="p-5 flex flex-col flex-1 bg-background/40 relative">
                  <div className="flex items-start gap-2.5 mb-auto">
                    <Bell className="w-5 h-5 mt-0.5 shrink-0 text-primary/70" />
                    <h3 className="font-display font-semibold text-base md:text-lg leading-snug line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
                      {update.headline}
                    </h3>
                  </div>
                  
                  {/* Subtle accent line at the bottom to anchor the card visually */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                     <span className="text-xs font-medium text-muted-foreground">Read more</span>
                     <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="glass-card inline-flex p-4 rounded-2xl mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p>No updates found matching your search.</p>
        </div>
      )}
    </div>
  );
}