import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, Loader2 } from 'lucide-react';
import { useRef, useEffect, useState, useCallback } from 'react';
import OptimizedImage from '@/components/OptimizedImage';

type ContextType = { searchQuery: string };

const ITEMS_PER_PAGE = 9;

export default function Updates() {
  const { searchQuery } = useOutletContext<ContextType>();
  const [page, setPage] = useState(1);
  const [allUpdates, setAllUpdates] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const { data: updates, isLoading, isFetching } = useQuery({
    queryKey: ['updates', page],
    queryFn: async () => {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data;
    },
  });

  // Update all updates when new data arrives
  useEffect(() => {
    if (updates) {
      if (page === 1) {
        setAllUpdates(updates);
      } else {
        setAllUpdates(prev => [...prev, ...updates]);
      }

      // Check if there's more data
      if (updates.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    }
  }, [updates, page]);

  // Reset when search query changes (skip on initial mount to avoid clearing cached data)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
    setAllUpdates([]);
    setHasMore(true);
  }, [searchQuery]);

  const filtered = allUpdates?.filter(
    (u: any) =>
      !searchQuery ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetching) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, [hasMore, isLoading, isFetching]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch" role="status" aria-live="polite" aria-label="Loading updates">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="h-full flex flex-col animate-pulse rounded-xl border border-border/40 bg-muted/5 shadow-sm"
              aria-hidden="true"
            >
              <div className="w-full aspect-[4/3] bg-muted/20 rounded-t-xl shrink-0" />
              <div className="p-3 flex-1 flex flex-col">
                <div className="h-4 bg-muted/20 rounded w-full mb-2" />
                <div className="h-4 bg-muted/20 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch" role="list" aria-label="Updates list">
            {filtered.map((update: any, i: number) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
                className="h-full"
                role="listitem"
              >
                <Link
                  to={`/updates/${update.slug || update.id}`}
                  className="glass-card flex flex-col h-full rounded-xl overflow-hidden group hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 border border-border/40"
                  aria-label={`Read ${update.title} update${isNewUpdate(update.created_at) ? ' - New' : ''}`}
                >
                  <div className="relative w-full aspect-[4/3] bg-muted/20 overflow-hidden shrink-0">
                    <OptimizedImage
                      src={update.image_url || '/placeholder.svg'}
                      alt={update.title}
                      className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {isNewUpdate(update.created_at) && (
                      <div className="absolute top-2 left-2 z-30" aria-label="New update">
                        <span className="relative flex h-5 w-12 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30" aria-hidden="true" />
                          <span className="relative inline-flex items-center justify-center h-5 w-12 rounded-md bg-blue-500/90 backdrop-blur-sm border border-blue-400/50 text-[9px] font-bold text-white uppercase tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                            New
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1 bg-background/30 relative">
                    <div className="flex items-start gap-2 mb-auto">
                      <Bell className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" aria-hidden="true" />
                      <h3 className="font-display font-medium text-sm leading-tight line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
                        {update.title}
                      </h3>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">Read more</span>
                      <ChevronRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {isFetching && !isLoading && (
            <div className="flex justify-center py-8" role="status" aria-live="polite" aria-label="Loading more updates">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Observer target for infinite scroll */}
          {hasMore && !isLoading && (
            <div ref={observerTarget} className="h-4" aria-hidden="true" />
          )}

          {/* End of list message */}
          {!hasMore && filtered.length > 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              You've reached the end of updates
            </div>
          )}
        </>
      ) : (
        <div className="empty-state" role="status">
          <div className="glass-card inline-flex p-4 rounded-2xl mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <p>No updates found matching your search.</p>
        </div>
      )}
    </div>
  );
}