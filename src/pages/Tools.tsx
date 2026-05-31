import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ToolCard from '@/components/ToolCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Filter, Loader2, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTools } from '@/hooks/useTools';
import { useSiteSeo } from '@/hooks/useSiteSeo';
import { generateCollectionPageSchema, SEO_DEFAULTS, SITE_URL, DEFAULT_OG_IMAGE, PAGE_SEO } from '@/lib/seo';

function ToolsHelmet() {
  const { data: seo } = useSiteSeo("tools");
  const defaults = PAGE_SEO.tools;

  const title = seo?.meta_title?.trim() || defaults.title;
  const description = seo?.meta_description?.trim() || defaults.description;
  const ogTitle = seo?.og_title?.trim() || title;
  const ogDescription = seo?.og_description?.trim() || description;
  const ogImage = seo?.og_image?.trim() || DEFAULT_OG_IMAGE;
  const ogType = seo?.og_type?.trim() || "website";
  const twitterCard = seo?.twitter_card?.trim() || "summary_large_image";
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

type ContextType = { searchQuery: string };

const ITEMS_PER_PAGE = 12;

export default function Tools() {
  const { searchQuery } = useOutletContext<ContextType>();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allTools, setAllTools] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const { data: toolsData, isLoading, isFetching, error } = useTools(page, ITEMS_PER_PAGE);
  const tools = toolsData?.data || [];
  const totalTools = toolsData?.total || 0;

  // Update all tools when new data arrives
  useEffect(() => {
    if (tools && tools.length > 0) {
      if (page === 1) {
        setAllTools(tools);
      } else {
        setAllTools(prev => [...prev, ...tools]);
      }

      // Check if there's more data
      const hasMoreData = totalTools > page * ITEMS_PER_PAGE;
      setHasMore(hasMoreData);
    }
  }, [tools, page, totalTools]);

  // Reset when search query or category changes (skip on initial mount to avoid clearing cached data)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
    setAllTools([]);
    setHasMore(true);
  }, [searchQuery, activeCategoryId]);

  const { data: toolCategories } = useQuery<any[]>({
    queryKey: ['tool_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('entity_type', 'tool')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = allTools?.filter((t: any) => {
    const matchesSearch =
      !searchQuery ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.short_description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !activeCategoryId || t.category_id === activeCategoryId;

    return matchesSearch && matchesCategory;
  });

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

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load tools</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToolsHelmet />
      <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">All Tools</h1>
        <p className="page-subtitle">Browse our curated collection of educational tools</p>
        {totalTools > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {allTools.length} of {totalTools} tools
          </p>
        )}
      </motion.div>

      {/* Dropdown Category Filter */}
      {toolCategories && toolCategories.length > 0 && (
        <div className="relative mb-6 z-40">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border/50 shadow-sm rounded-lg hover:bg-muted/50 transition-all text-sm font-medium"
            aria-expanded={isFilterOpen}
            aria-haspopup="listbox"
            aria-label="Filter tools by category"
          >
            <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            {activeCategoryId
              ? toolCategories.find((c: any) => c.id === activeCategoryId)?.name
              : 'All Categories'}
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsFilterOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-background border border-border/50 z-40 overflow-hidden"
                  role="listbox"
                  aria-label="Tool categories"
                >
                  <div className="max-h-[50vh] overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <button
                      onClick={() => {
                        setActiveCategoryId(null);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${activeCategoryId === null ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                        }`}
                      role="option"
                      aria-selected={activeCategoryId === null}
                    >
                      All Categories
                    </button>
                    {toolCategories.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategoryId(cat.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${activeCategoryId === cat.id ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                          }`}
                        role="option"
                        aria-selected={activeCategoryId === cat.id}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-wrap gap-3 w-full" role="status" aria-live="polite" aria-label="Loading tools">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)] flex-none">
              <div className="h-40 glass-card animate-pulse rounded-2xl" aria-hidden="true" />
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-3 w-full" role="list" aria-label="Tools list">
            {filtered.map((tool: any, i: number) => (
              <div key={tool.id} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(16.666%-10px)] flex-none">
                <ToolCard tool={tool} index={i} />
              </div>
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {isFetching && !isLoading && (
            <div className="flex justify-center py-8" role="status" aria-live="polite" aria-label="Loading more tools">
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
              You've reached the end of tools
            </div>
          )}
        </>
      ) : (
        <div className="empty-state" role="status">
          <div className="glass-card inline-flex p-4 rounded-2xl mb-4">
            <Wrench className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <p>No tools found.</p>
        </div>
      )}
    </div>
    </>
  );
}