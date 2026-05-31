import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import SocialShare from '@/components/updates/SocialShare';
import { generateArticleSchema, SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo';

// 🚨 HIGH-RES INTERCEPTOR FOR OLD POSTS 🚨
const getHighResAvatar = (url: string | null) => {
  if (!url) return '/favicon.svg';
  if (url.includes('googleusercontent.com') && url.includes('=s')) {
    return url.replace(/=s\d+-c/g, '=s500-c');
  }
  return url;
};

export default function UpdateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data: update, isLoading, isError, error, failureCount } = useQuery({
    queryKey: ['update', slug],
    queryFn: async ({ signal }) => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');
      const searchColumn = isUUID ? 'id' : 'slug';

      // Hard timeout: if Supabase hangs, force-reject after 8 seconds
      const TIMEOUT_MS = 8_000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS)
      );

      let aborted = false;
      signal?.addEventListener('abort', () => { aborted = true; });

      const fetchPromise = (async () => {
        try {
          const { data, error } = await supabase
            .from('updates')
            .select('*')
            .eq(searchColumn, slug)
            .single();

          if (aborted) throw new Error('Query aborted by React Query');

          if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
          }
          return data;
        } catch (err) {
          console.error('Error fetching update detail:', err);
          throw err;
        } finally {
          /* intentional no-op in finally to ensure promise resolution path is consistent */
        }
      })();

      return Promise.race([fetchPromise, timeoutPromise]);
    },
    enabled: !!slug,
    retry: 1,
    staleTime: 60_000,
  });

  const { data: recentUpdates } = useQuery({
    queryKey: ['recent_updates_suggestions', update?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .neq('id', update.id)
        .order('created_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!update?.id,
  });

  useEffect(() => {
    if (update && update.id) {
      supabase.from('updates')
        .update({ clicks: (update.clicks || 0) + 1 })
        .eq('id', update.id)
        .then(({ error }) => {
          if (error) console.error("Error updating click count:", error);
        });
    }
  }, [update]);

  const formattedDate = update?.created_at
    ? new Date(update.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : '';

  // Convert raw DB content (plain text with markdown-like syntax) into proper markdown
  const markdownContent = useMemo(() => {
    const raw = update?.content || '';
    if (!raw) return '';

    // The DB stores lines like "## Heading" or "<h2>Heading</h2>" or plain text
    // Convert <h2>/<h3> HTML tags to markdown ## / ### for ReactMarkdown
    return raw
      .replace(/^<h2>(.*)<\/h2>$/gim, '## $1')
      .replace(/^<h3>(.*)<\/h3>$/gim, '### $1');
  }, [update?.content]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse min-h-screen bg-white dark:bg-black">
        <div className="h-5 bg-muted rounded w-48 mb-6" />
        <div className="h-10 bg-muted rounded w-3/4 mb-4" />
        <div className="h-6 bg-muted rounded w-1/2 mb-8" />
        <div className="h-64 bg-muted rounded-xl w-full" />
      </div>
    );
  }

  if (isError) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error fetching data';
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center bg-white dark:bg-black min-h-screen">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-8 rounded-2xl text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">Failed to load update</p>
          <p className="text-sm text-muted-foreground mb-2 font-mono break-all">{errMsg}</p>
          {failureCount > 0 && (
            <p className="text-xs text-muted-foreground mb-5">Retry attempts: {failureCount}</p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition text-sm">
              Retry
            </button>
            <button onClick={() => navigate('/updates')} className="px-6 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-sm">
              Back to Updates
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center bg-white dark:bg-black min-h-screen">
        <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 p-8 rounded-2xl text-center">
          <p className="text-foreground text-lg font-medium mb-4">Update not found.</p>
          <button onClick={() => navigate('/updates')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const seoTitle = update.meta_title?.trim() || update.title + " | EduDock";
  const seoDescription = update.meta_description?.trim() || update.content?.replace(/\n/g, " ").substring(0, 160) || "Read the full update on EduDock.";
  const seoImage = update.image_url || "https://edudock.in/social.png";
  const canonicalUrl = `https://edudock.in/updates/${update.slug || update.id}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:site_name" content="EduDock" />
        <meta property="article:published_time" content={update.created_at || undefined} />
        <meta property="article:modified_time" content={update.updated_at || update.created_at || undefined} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {typeof update.schema_markup === 'object' ? JSON.stringify(update.schema_markup) : update.schema_markup || JSON.stringify(generateArticleSchema({ ...update, description: seoDescription }))}
        </script>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8 bg-white dark:bg-gray-950 min-h-screen">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <Link to="/updates" className="hover:text-primary transition-colors">Updates</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[400px]">
          {update.title}
        </span>
      </nav>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col"
      >
        {/* H1 Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mt-4 text-foreground">
          {update.title}
        </h1>

        {/* Meta + Social Share Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 mt-4">
          <div className="flex items-center gap-3">
            <img
              src={getHighResAvatar(update.author_avatar)}
              alt="Author"
              className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#111111] shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-bold text-foreground">
                  {update.author_name || 'EduDock Official'}
                </p>
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mt-0.5 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.846 3.45-.043.196-.064.398-.064.6 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.818 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.202-.02-.404-.064-.6 1.106-.704 1.846-1.99 1.846-3.45z" fill="#1D9BF0" />
                  <path d="M12.044 18.354l-5.048-5.048 2.122-2.122 2.926 2.926 6.777-6.777 2.122 2.121-8.899 8.899z" fill="#FFFFFF" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-[13px] font-semibold text-blue-600 tracking-wide uppercase">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>

          <SocialShare
            title={update.title}
            url={`https://edudock.in/share/updates/${update.slug || update.id}`}
          />
        </div>

        {/* Featured Image — pure inline block, no grid wrappers */}
        {update.image_url && (
          <img
            src={`${update.image_url}?t=${Date.now()}`}
            alt={update.title}
            className="w-full aspect-[1200/630] object-cover mt-6 mb-8 block"
            loading="lazy"
          />
        )}


        {/* Markdown Content */}
        <div className="prose prose-blue max-w-none md:prose-lg dark:prose-invert
          prose-headings:scroll-mt-24
          prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-600
          prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:text-left
          prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600
          prose-img:w-full prose-img:rounded-lg prose-img:my-6 prose-img:block prose-img:shadow-sm
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>

        {/* Official Resource */}
        {update.external_url && (
          <div className="mt-12 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2 text-foreground">Official Resource</h3>
            <p className="text-base text-muted-foreground mb-6">Click below to visit the official website or resource related to this update.</p>
            <a
              href={update.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              Visit Official Link <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        )}

        {/* Bottom Social Share */}
        <SocialShare
          title={update.title}
          url={`https://edudock.in/share/updates/${update.slug || update.id}`}
          className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800"
        />

        {/* Community Banner */}
          <div className="mt-10 bg-gray-50 dark:bg-[#111111] p-6 rounded-lg text-center border border-gray-200 dark:border-gray-800">
          <p className="text-lg font-bold text-foreground mb-1">Stay Updated! 🚀</p>
          <p className="text-sm text-muted-foreground mb-6">Join our groups for fresh updates & resources</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://whatsapp.com/channel/0029VbCi3v5DZ4LZBkI0470b"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors font-semibold text-sm shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
              WhatsApp
            </a>
            <a
              href="https://t.me/edudock"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0088cc] text-white hover:bg-[#0077b3] transition-colors font-semibold text-sm shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              Telegram
            </a>
          </div>
        </div>

        {/* Recent Updates — pure vertical stack, LARGE thumbnails */}
        {recentUpdates && recentUpdates.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-6 text-foreground">Recent Updates</h3>
            <div className="flex flex-col gap-6 w-full">
              {recentUpdates.map((item: any) => (
                <Link
                  to={`/updates/${item.slug || item.id}`}
                  key={item.id}
                  className="flex flex-row items-center gap-4 w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-sm"
                >
                  <Link
                    to={`/updates/${item.slug || item.id}`}
                    key={item.id}
                    className="flex flex-row items-center gap-4 w-full bg-gray-50 dark:bg-[#111111] p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-sm"
                  >
                  <img
                    src={item.image_url ? `${item.image_url}?t=${Date.now()}` : '/placeholder.svg'}
                    alt={item.title}
                      className="w-48 aspect-video object-cover rounded-lg shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#111111]"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary leading-snug line-clamp-2 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </motion.article>
    </div>
    </>
  );
}