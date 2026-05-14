import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

type ContextType = { searchQuery: string };

/* ── Framer Motion variants ─────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ── Helpers ─────────────────────────────────────────────────────── */

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isNewUpdate(createdAt: string): boolean {
  if (!createdAt) return false;
  const uploadDate = new Date(createdAt);
  const today = new Date();
  const diffDays = Math.ceil(
    Math.abs(today.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= 7;
}

/* ── Component ───────────────────────────────────────────────────── */

export default function Updates() {
  const { searchQuery } = useOutletContext<ContextType>();

  /* Fetch latest 5 updates from Supabase */
  const { data: updates, isLoading } = useQuery({
    queryKey: ['updates-latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  /* Apply search filter */
  const filtered = updates?.filter(
    (u: any) =>
      !searchQuery || u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* Split into two columns: left (3 items), right (2 items) */
  const leftItems = filtered ? filtered.slice(0, 3) : [];
  const rightItems = filtered ? filtered.slice(3, 5) : [];

  /* ── Render a single update row ──────────────────────────────── */
  const renderUpdateItem = (update: any, isLastInColumn: boolean) => {
    const isExternal = !!update.external_link;

    const titleElement = (
      <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 text-sm md:text-base leading-snug">
        {update.title}
      </h3>
    );

    return (
      <motion.div
        key={update.id}
        variants={itemVariants}
        className={`group flex flex-row items-start gap-4 ${
          isLastInColumn ? '' : 'border-b border-gray-100 pb-4'
        }`}
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-28 md:w-32 aspect-[40/21] rounded-lg overflow-hidden">
          <OptimizedImage
            src={update.image_url || '/placeholder.svg'}
            alt={update.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            width={1200}
            height={630}
          />
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-start min-w-0 flex-1">
          {isExternal ? (
            <a
              href={update.external_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {titleElement}
            </a>
          ) : (
            <Link to={`/updates/${update.slug || update.id}`}>
              {titleElement}
            </Link>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            {isNewUpdate(update.created_at) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                New
              </span>
            )}
            <span className="text-sm text-blue-500 font-medium">
              {formatDate(update.created_at)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-6 md:p-10"
      >
        {/* ── Section Heading ─────────────────────────────────── */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>Latest</span>
            <span className="text-blue-600">Updates</span>
          </h2>
        </div>

        {isLoading ? (
          /* ── Loading Skeleton ────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left column skeletons */}
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`left-skeleton-${i}`}
                  className="flex flex-row items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="shrink-0 w-28 md:w-32 aspect-[40/21] rounded-lg bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>

            {/* Right column skeletons */}
            <div className="flex flex-col gap-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={`right-skeleton-${i}`}
                  className="flex flex-row items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="shrink-0 w-28 md:w-32 aspect-[40/21] rounded-lg bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filtered && filtered.length > 0 ? (
          <>
            {/* ── Two-Column Layout ─────────────────────────────── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            >
              {/* Left Column — 3 items */}
              <div className="flex flex-col gap-4">
                {leftItems.map((update: any, i: number) =>
                  renderUpdateItem(update, i === leftItems.length - 1)
                )}
              </div>

              {/* Right Column — 2 items */}
              <div className="flex flex-col gap-4">
                {rightItems.map((update: any, i: number) =>
                  renderUpdateItem(update, i === rightItems.length - 1)
                )}
              </div>
            </motion.div>

            {/* ── View All Updates Button ──────────────────────── */}
            <div className="flex justify-center md:justify-end mt-8">
              <Link
                to="/updates"
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-200 text-blue-700 font-medium rounded-full px-6 py-2.5 transition-colors duration-200"
              >
                View All Updates
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          /* ── Empty State ─────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-16" role="status">
            <div className="inline-flex p-4 rounded-2xl mb-4 bg-gray-50 border border-gray-100">
              <Loader2 className="h-6 w-6 text-gray-400" aria-hidden="true" />
            </div>
            <p className="text-gray-500 text-base">
              {searchQuery ? 'No updates match your search' : 'No updates found'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
