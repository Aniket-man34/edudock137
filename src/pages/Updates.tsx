import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2, Play } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

type ContextType = { searchQuery: string };

/* ── Framer Motion variants ─────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] as const },
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
  const diffDays = Math.ceil(
    Math.abs(new Date().getTime() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return diffDays <= 7;
}

/* ── Component ───────────────────────────────────────────────────── */

export default function Updates() {
  const { searchQuery } = useOutletContext<ContextType>();

  /* Fetch latest 6 updates — bumped from 5 for a proper 2-row layout */
  const { data: updates, isLoading } = useQuery({
    queryKey: ['updates-latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  /* Apply search filter */
  const filtered = updates?.filter(
    (u: any) =>
      !searchQuery ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Render a single Netflix-style poster card ───────────────── */
  const renderCard = (update: any) => {
    const isExternal = !!update.external_link;
    const isNew = isNewUpdate(update.created_at);

    const linkProps = isExternal
      ? { as: 'a' as const, href: update.external_link, target: '_blank', rel: 'noopener noreferrer' }
      : { as: Link as any, to: `/updates/${update.slug || update.id}` };

    const { as: Tag, ...rest } = linkProps;

    return (
      <motion.div
        key={update.id}
        variants={cardVariants}
        className="group min-w-0 flex flex-col"
        style={{ flexBasis: 'calc(50% - 10px)', flexShrink: 0, flexGrow: 0 }}
      >
        {/* ── Pure image poster (no text inside) ── */}
        <Tag {...rest} className="block">
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: '1200 / 630' }}
          >
            <OptimizedImage
              src={update.image_url || '/placeholder.svg'}
              alt={update.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              width={1200}
              height={630}
            />

            {/* Subtle top-to-bottom dark vignette for a moodier look */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />

            {/* Hover: dim + red border glow */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-red-600/70 transition-all duration-300 group-hover:shadow-[0_0_22px_rgba(220,38,38,0.3)]" />
          </div>
        </Tag>

        {/* ── Text content — outside the card, directly below ── */}
        <div className="mt-3 px-0.5">
          {/* Meta row: NEW badge + date */}
          <div className="flex items-center gap-2 mb-1.5">
            {isNew && (
              <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm">
                ● NEW
              </span>
            )}
            <span className="text-gray-500 text-xs font-medium">
              {formatDate(update.created_at)}
            </span>
          </div>

          {/* Title */}
          <Tag {...rest} className="block">
            <h3 className="text-gray-100 font-bold text-sm md:text-[15px] leading-snug line-clamp-2 group-hover:text-red-400 transition-colors duration-300 cursor-pointer">
              {update.title}
            </h3>
          </Tag>

          {/* Slide-up Read More — visible on hover */}
          <div className="flex items-center gap-2 mt-2 overflow-hidden max-h-0 group-hover:max-h-10 transition-all duration-300 ease-out">
            <Tag
              {...rest}
              className="inline-flex items-center gap-1.5 text-white bg-red-600 hover:bg-red-700 text-xs font-bold px-3 py-1.5 rounded-sm transition-colors duration-150"
            >
              <Play className="w-3 h-3 fill-white" />
              Read More
            </Tag>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ── Page skeleton cards ─────────────────────────────────────── */
  const renderSkeletons = () => (
    <div className="flex flex-wrap gap-5">
      {[...Array(6)].map((_, i) => (
        <div
          key={`sk-${i}`}
          className="flex flex-col"
          style={{ flexBasis: 'calc(50% - 10px)', flexShrink: 0, flexGrow: 0 }}
        >
          <div
            className="rounded-xl bg-[#1f1f1f] animate-pulse w-full"
            style={{ aspectRatio: '1200 / 630' }}
          />
          <div className="mt-3 px-0.5 space-y-2">
            <div className="h-2.5 w-1/4 bg-[#2a2a2a] animate-pulse rounded" />
            <div className="h-3 w-3/4 bg-[#2a2a2a] animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-[#2a2a2a] animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  /* ── Main render ─────────────────────────────────────────────── */
  return (
    <div className="w-full bg-[#141414] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-5 md:px-10 py-8 md:py-10"
      >
        {/* ── Section heading ──────────────────────────────────── */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            {/* Netflix-style red left-bar accent */}
            <span className="block w-1 h-7 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Latest{' '}
              <span className="text-red-500">Updates</span>
            </h2>
          </div>

          <Link
            to="/updates"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm font-semibold transition-colors duration-200 group"
          >
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        {isLoading ? (
          renderSkeletons()
        ) : filtered && filtered.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-5"
          >
            {filtered.map((update: any) => renderCard(update))}
          </motion.div>
        ) : (
          /* ── Empty state ──────────────────────────────────── */
          <div
            className="flex flex-col items-center justify-center py-24"
            role="status"
          >
            <div className="inline-flex p-4 rounded-2xl mb-4 bg-[#1f1f1f] border border-[#2a2a2a]">
              <Loader2 className="h-6 w-6 text-gray-600" aria-hidden="true" />
            </div>
            <p className="text-gray-500 text-base">
              {searchQuery
                ? 'No updates match your search'
                : 'No updates found'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}