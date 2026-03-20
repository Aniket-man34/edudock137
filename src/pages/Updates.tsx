import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">Updates</h1>
        <p className="page-subtitle">Latest news and announcements</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card animate-pulse rounded-2xl">
              <div className="aspect-video bg-muted/30 rounded-t-2xl" />
              <div className="p-4"><div className="h-5 bg-muted/30 rounded w-3/4" /></div>
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((update, i) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <Link
                to={`/updates/${update.id}`}
                className="block glass-card overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              >
                {update.image_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={update.image_url}
                      alt={update.headline}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Bell className="h-10 w-10 text-primary/30" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-sm md:text-base leading-snug line-clamp-2">{update.headline}</h3>
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
          <p>No updates yet.</p>
        </div>
      )}
    </div>
  );
}
