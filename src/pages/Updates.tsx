import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { useSiteSeo } from '@/hooks/useSiteSeo';
import { generateCollectionPageSchema, SEO_DEFAULTS, SITE_URL, DEFAULT_OG_IMAGE, PAGE_SEO } from '@/lib/seo';

type ContextType = { searchQuery: string };

/* ── Framer Motion variants ─────────────────────────────────────── */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { useSiteSeo } from '@/hooks/useSiteSeo';
import { generateCollectionPageSchema, SEO_DEFAULTS, SITE_URL, DEFAULT_OG_IMAGE, PAGE_SEO } from '@/lib/seo';

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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
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
  const diffDays = Math.ceil(
    Math.abs(new Date().getTime() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return diffDays <= 7;
}

/* ── Component ───────────────────────────────────────────────────── */

function UpdatesHelmet() {
  const { data: seo } = useSiteSeo('updates');
  const defaults = PAGE_SEO.updates;

  const title = seo?.meta_title?.trim() || defaults.title;
  const description = seo?.meta_description?.trim() || defaults.description;
  const ogTitle = seo?.og_title?.trim() || title;
  const ogDescription = seo?.og_description?.trim() || description;
  const ogImage = seo?.og_image?.trim() || DEFAULT_OG_IMAGE;
  const ogType = seo?.og_type?.trim() || 'website';
  const twitterCard = seo?.twitter_card?.trim() || 'summary_large_image';
  const canonical = seo?.canonical_url?.trim() || `${SITE_URL}${defaults.path}`;

  const schemaJson = seo?.schema_markup
    ? seo.schema_markup
    : JSON.stringify(generateCollectionPageSchema(defaults));

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="EduDock" />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="canonical" href={canonical} />
      <script type="application/ld+json">{schemaJson}</script>
    </Helmet>
  );
}

export default function Updates() {
  const { searchQuery } = useOutletContext<ContextType>();

  const location = useLocation();
  const isFullPage = location.pathname === '/updates';

  /* Fetch updates — on the widget we show latest 6, on the full /updates page fetch all */
  const { data: updates, isLoading, refetch } = useQuery({
    queryKey: ['updates-list', isFullPage ? 'all' : 'latest'],
    queryFn: async () => {
      let q = supabase.from('updates').select('*').order('created_at', { ascending: false });
      if (!isFullPage) q = q.limit(6);

      const { data, error } = await q;
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

  /* ── Render a single horizontal card ────────────────────────── */
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
        className="flex flex-row gap-4 items-center border-b border-gray-200 dark:border-gray-700 pb-4"
      >
        {/* Left: Thumbnail (16:9 aspect ratio with contain — no cropping) */}
        <Tag {...rest} className="shrink-0">
          <div className="w-40 sm:w-48 aspect-video bg-gray-100 dark:bg-[#111111] overflow-hidden rounded-lg">
            <OptimizedImage
              src={update.image_url || '/placeholder.svg'}
              alt={update.title}
              className="w-full h-full object-contain"
              width={192}
              height={108}
            />
          </div>
        </Tag>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          <Tag {...rest} className="block">
            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-sm md:text-base leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              <span className="mr-1.5">📢</span>
              {update.title}
            </h3>
          </Tag>
          <div className="flex items-center gap-2 mt-1.5">
            {isNew && (
              <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm">
                ● NEW
              </span>
            )}
            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
              {formatDate(update.created_at)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ── Page skeleton cards ─────────────────────────────────────── */
  const renderSkeletons = () => (
    <div className="flex flex-wrap gap-6 w-full max-w-6xl mx-auto [&>*]:flex-[1_1_320px]">
      {[...Array(6)].map((_, i) => (
        <div
          key={`sk-${i}`}
          className="flex flex-row gap-4 items-center border-b border-gray-200 dark:border-gray-700 pb-4"
        >
          <div className="w-40 sm:w-48 aspect-video bg-gray-200 dark:bg-[#111111] animate-pulse shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-[#111111] animate-pulse rounded" />
            <div className="h-2.5 w-1/4 bg-gray-200 dark:bg-[#111111] animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  /* ── Main render ─────────────────────────────────────────────── */
  return (
    <>
      <UpdatesHelmet />
      <div className="w-full bg-white dark:bg-black min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-5 md:px-10 py-8 md:py-10"
      >
        {/* ── Section heading ──────────────────────────────────── */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight inline-flex items-center gap-1.5">
            <span className="text-gray-900 dark:text-white">
              Latest
              <span className="inline-block w-2 h-2 bg-red-600 rounded-full ml-1 align-middle" />
            </span>
            <span className="text-blue-600 dark:text-blue-400">Updates</span>
          </h2>
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        {isLoading ? (
          renderSkeletons()
        ) : filtered && filtered.length > 0 ? (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-6 w-full max-w-6xl mx-auto [&>*]:flex-[1_1_340px]"
            >
              {filtered.map((update: any) => renderCard(update))}
            </motion.div>

            {/* ── View All Button ──────────────────────────────── */}
            <div className="flex justify-end w-full max-w-6xl mx-auto mt-8">
              {!isFullPage ? (
                <Link
                  to="/updates"
                  className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                >
                  View All Updates
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                >
                  Refresh All Updates
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* ── Empty state ──────────────────────────────────── */
          <div
            className="flex flex-col items-center justify-center py-24"
            role="status"
          >
            <div className="inline-flex p-4 rounded-2xl mb-4 bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-[#111111]">
              <Loader2 className="h-6 w-6 text-gray-400 dark:text-gray-600" aria-hidden="true" />
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-base">
              {searchQuery
                ? 'No updates match your search'
                : 'No updates found'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
    </>
  );
}