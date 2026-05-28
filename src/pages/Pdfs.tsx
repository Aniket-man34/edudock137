import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, BookOpen, Filter, ChevronRight, Calendar, Download, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import OptimizedImage from '@/components/OptimizedImage';
import { useSiteSeo } from '@/hooks/useSiteSeo';
import { generateCollectionPageSchema, generateDigitalDocumentSchema, SEO_DEFAULTS, SITE_URL, DEFAULT_OG_IMAGE, PAGE_SEO, fallbackMetaTitle, fallbackMetaDescription, fallbackOgImage } from '@/lib/seo';

type ContextType = { searchQuery: string };

function PdfsListHelmet() {
  const { data: seo } = useSiteSeo("pdfs");
  const defaults = PAGE_SEO.pdfs;
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

const ITEMS_PER_PAGE = 12;

// 🚨 HIGH-RES INTERCEPTOR FOR OLD PDF POSTS 🚨
const getHighResAvatar = (url: string | null) => {
  if (!url) return null;
  if (url.includes('googleusercontent.com') && url.includes('=s')) {
    return url.replace(/=s\d+-c/g, '=s500-c');
  }
  return url;
};

export default function Pdfs() {
  const { searchQuery } = useOutletContext<ContextType>();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const decodedSlug = slug ? decodeURIComponent(slug) : null;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(decodedSlug);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allPdfs, setAllPdfs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const { data: pdfs, isLoading, isFetching } = useQuery({
    queryKey: ['pdfs', page],
    queryFn: async () => {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('pdfs')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return data;
    },
  });

  // Update all pdfs when new data arrives
  useEffect(() => {
    if (pdfs) {
      if (page === 1) {
        setAllPdfs(pdfs);
      } else {
        setAllPdfs(prev => [...prev, ...pdfs]);
      }

      // Check if there's more data
      if (pdfs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    }
  }, [pdfs, page]);

  // Reset when search query or category changes (skip on initial mount to avoid clearing cached data)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
    setAllPdfs([]);
    setHasMore(true);
  }, [searchQuery, activeCategoryId]);

  const { data: pdfCategories } = useQuery({
    queryKey: ['pdf_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('entity_type', 'pdf')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: recentPdfs } = useQuery({
    queryKey: ['recent_pdfs_sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pdfs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (slug) setSelectedSlug(decodeURIComponent(slug));
    else setSelectedSlug(null);
  }, [slug]);

  const selectedPdf = allPdfs?.find((p: any) => p.slug === selectedSlug || p.id === selectedSlug);

  const filtered = allPdfs?.filter((p: any) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategoryId || p.category_id === activeCategoryId;
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

  const handleShare = async (pdfToShare: any) => {
    if (!pdfToShare) return;
    const shareUrl = `https://edudock.in/share/pdfs/${pdfToShare?.slug || pdfToShare?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: pdfToShare?.title || 'EduDock PDF', url: shareUrl });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('PDF Link copied to clipboard!');
    }
  };

  const isNewPdf = (createdAt: string) => {
    if (!createdAt) return false;
    const uploadDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - uploadDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (slug && selectedPdf) {
    const formattedDate = selectedPdf.created_at
      ? new Date(selectedPdf.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    const sidebarSuggestions = recentPdfs?.filter((p: any) => p.id !== selectedPdf.id && p.slug !== selectedPdf.slug).slice(0, 4);

    const pdfCanonicalUrl = `https://edudock.in/pdfs/${selectedPdf.slug || selectedPdf.id}`;
    const pdfSeoTitle = selectedPdf.meta_title || `${selectedPdf.title} | EduDock PDF`;
    const pdfSeoDesc = selectedPdf.meta_description || selectedPdf.description?.replace(/\n/g, ' ').substring(0, 160) || 'Download this free PDF study material from EduDock.';
    const pdfSeoImage = selectedPdf.cover_image_url || 'https://edudock.in/social.png';

    return (
      <>
        <Helmet>
          <title>{pdfSeoTitle}</title>
          <meta name="description" content={pdfSeoDesc} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={pdfCanonicalUrl} />
          <meta property="og:title" content={pdfSeoTitle} />
          <meta property="og:description" content={pdfSeoDesc} />
          <meta property="og:image" content={pdfSeoImage} />
          <meta property="og:site_name" content="EduDock" />
          <meta property="article:published_time" content={selectedPdf.created_at || undefined} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={pdfCanonicalUrl} />
          <meta name="twitter:title" content={pdfSeoTitle} />
          <meta name="twitter:description" content={pdfSeoDesc} />
          <meta name="twitter:image" content={pdfSeoImage} />
          <link rel="canonical" href={pdfCanonicalUrl} />
          <script type="application/ld+json">
            {JSON.stringify(generateDigitalDocumentSchema(selectedPdf))}
          </script>
        </Helmet>
        <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen">

        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link to="/pdfs" className="hover:text-primary transition-colors">PDF Library</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[400px]">{selectedPdf.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto">

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:w-2/3 flex flex-col"
          >
            <article className="w-full">
              <div className="flex flex-col md:flex-row gap-10 mb-10">

                <div className="w-full md:w-1/3 shrink-0">
                  <div className="bg-transparent overflow-hidden relative">
                    {selectedPdf.cover_image_url ? (
                      <img
                        src={selectedPdf.cover_image_url}
                        alt={selectedPdf.title}
                        className="w-full max-w-[250px] mx-auto aspect-[2/3] object-cover rounded-lg shadow-md block"
                      />
                    ) : (
                      <div className="w-full max-w-[250px] mx-auto aspect-[2/3] flex items-center justify-center bg-primary/5 rounded-lg shadow-md border border-border/20">
                        <BookOpen className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col justify-start pt-2">
                  {selectedPdf.categories?.name && (
                    <span className="inline-block px-3 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                      {selectedPdf.categories.name}
                    </span>
                  )}

                  <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold font-display text-foreground leading-[1.25] mb-6">
                    {selectedPdf.title}
                  </h1>

                  <div className="flex items-center gap-3 border-b border-border/40 pb-6 mb-6">
                    <img
                      src={getHighResAvatar(selectedPdf.author_avatar) || '/favicon.svg'}
                      alt="Author"
                      className="w-14 h-14 rounded-full object-cover border border-border/50 bg-muted/20 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[16px] font-bold text-foreground">
                          {selectedPdf.author_name || 'EduDock Official'}
                        </p>
                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mt-0.5 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.846 3.45-.043.196-.064.398-.064.6 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.818 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.202-.02-.404-.064-.6 1.106-.704 1.846-1.99 1.846-3.45z" fill="#1D9BF0" />
                          <path d="M12.044 18.354l-5.048-5.048 2.122-2.122 2.926 2.926 6.777-6.777 2.122 2.121-8.899 8.899z" fill="#FFFFFF" />
                        </svg>
                      </div>

                      <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1, textShadow: "0px 0px 8px rgba(37,99,235,0.5)" }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                        className="flex items-center gap-1.5 mt-0.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <p className="text-[15px] font-extrabold text-blue-600 tracking-wide uppercase">
                          {formattedDate}
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={selectedPdf.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                    <button
                      onClick={() => handleShare(selectedPdf)}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-all"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              </div>

              {selectedPdf.description && (
                <div className="prose prose-slate dark:prose-invert max-w-none pt-4 border-t border-border/30">
                  <h3 className="text-xl font-bold mb-4">About this Material</h3>
                  <p className="whitespace-pre-wrap text-[16px] md:text-[18px] text-foreground/80 leading-[1.9]">
                    {selectedPdf.description}
                  </p>
                </div>
              )}
            </article>
          </motion.main>

          <aside className="lg:w-1/3 space-y-8">

            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <h3 className="font-bold text-lg mb-2 relative z-10">Get More Materials 📚</h3>
              <p className="text-sm text-muted-foreground mb-5 relative z-10">Join our community to get instant notifications when new books and notes are uploaded.</p>

              <div className="space-y-3 relative z-10">
                <a
                  href="https://whatsapp.com/channel/0029VbBdBJj3gvWfZFIEUw1J"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors font-semibold border border-[#25D366]/20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                  WhatsApp
                </a>
                <a
                  href="https://t.me/edudock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors font-semibold border border-[#0088cc]/20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  Telegram
                </a>
              </div>
            </div>

            {sidebarSuggestions && sidebarSuggestions.length > 0 && (
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border/50">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Other Materials</h3>
                </div>

                <div className="space-y-5">
                  {sidebarSuggestions.map((item: any) => (
                    <Link
                      to={`/pdfs/${item.slug || item.id}`}
                      key={item.id}
                      className="flex gap-4 group items-center"
                    >
                      <div className="w-14 shrink-0">
                        {item.cover_image_url ? (
                          <img
                            src={item.cover_image_url}
                            alt=""
                            className="w-full aspect-[2/3] object-cover rounded-lg shadow-md block group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted/30 rounded-lg border border-border/50">
                            <BookOpen className="w-6 h-6 text-primary/30" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground/90 group-hover:text-primary leading-snug line-clamp-3 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <PdfsListHelmet />
      <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">PDF Library</h1>
        <p className="page-subtitle">Explore our collection of study materials and books</p>
      </motion.div>

      {pdfCategories && pdfCategories.length > 0 && (
        <div className="relative mb-6 z-40">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border/50 shadow-sm rounded-lg hover:bg-muted/50 transition-all text-sm font-medium"
            aria-expanded={isFilterOpen}
            aria-haspopup="listbox"
            aria-label="Filter PDFs by category"
          >
            <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            {activeCategoryId
              ? pdfCategories.find((c: any) => c.id === activeCategoryId)?.name
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
                  aria-label="PDF categories"
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
                    {pdfCategories.map((cat: any) => (
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
        <div className="flex flex-col md:flex-row md:flex-wrap gap-6 w-full" role="status" aria-live="polite" aria-label="Loading PDFs">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-row gap-4 items-center w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-transparent">
              <div className="w-24 md:w-28 shrink-0 aspect-[2/3] bg-muted/20 animate-pulse rounded-lg" aria-hidden="true" />
              <div className="flex flex-col flex-1 justify-center gap-2">
                <div className="h-4 w-3/4 bg-muted/20 animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-muted/20 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-6 w-full" role="list" aria-label="PDFs list">
            {filtered.map((pdf: any, i: number) => (
              <motion.div
                key={pdf.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                onClick={() => {
                  const navParam = pdf.slug || pdf.id;
                  setSelectedSlug(navParam);
                  navigate(`/pdfs/${navParam}`, { replace: true });

                  supabase.from('pdfs')
                    .update({ clicks: (pdf.clicks || 0) + 1 })
                    .eq('id', pdf.id)
                    .then(({ error }: any) => {
                      if (error) console.error("Error updating PDF clicks:", error);
                    });
                }}
                className="flex flex-row gap-4 items-center w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-transparent cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                role="listitem"
                tabIndex={0}
                aria-label={`View ${pdf.title} PDF${isNewPdf(pdf.created_at) ? ' - New' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const navParam = pdf.slug || pdf.id;
                    setSelectedSlug(navParam);
                    navigate(`/pdfs/${navParam}`, { replace: true });
                  }
                }}
              >
                {/* Left: Cover Image */}
                <div className="relative w-24 md:w-28 shrink-0">
                  {isNewPdf(pdf.created_at) && (
                    <div className="absolute -top-1.5 -left-1.5 z-30" aria-label="New PDF">
                      <span className="relative flex h-5 w-12 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30" aria-hidden="true"></span>
                        <span className="relative inline-flex rounded-full h-5 w-12 items-center justify-center bg-blue-50 border border-blue-400 text-[9px] font-bold text-white uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                          New
                        </span>
                      </span>
                    </div>
                  )}
                  {pdf.cover_image_url ? (
                    <img
                      src={pdf.cover_image_url}
                      alt={pdf.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg shadow-md block group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted/20 rounded-lg shadow-md border border-border/30">
                      <BookOpen className="h-6 w-6 text-primary/40" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Right: Text Content */}
                <div className="flex flex-col flex-1 justify-center min-w-0">
                  <h3 className="font-bold text-sm md:text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {pdf.title}
                  </h3>
                  {pdf.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {pdf.description}
                    </p>
                  )}
                  {pdf.created_at && (
                    <span className="text-[11px] text-muted-foreground mt-1">
                      {new Date(pdf.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {isFetching && !isLoading && (
            <div className="flex justify-center py-8" role="status" aria-live="polite" aria-label="Loading more PDFs">
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
              You've reached the end of PDFs
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center" role="status">
          <div className="inline-flex p-4 rounded-2xl mb-4 bg-muted/30 border border-border/30">
            <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground">No PDFs found.</p>
        </div>
      )}
    </div>
    </>
  );
}