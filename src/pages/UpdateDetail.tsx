import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function UpdateDetail() {
  // 1. DUAL-CATCH: Grab slug from URL
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // 🚨 THE SCROLL FIX: Instantly scroll to the top whenever a new post is opened 🚨
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch Update Data
  const { data: update, isLoading } = useQuery({
    queryKey: ['update', slug],
    queryFn: async () => {
      // 2. DUAL CATCH SAFETY: Detect if it's an old ID or a new Slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug || '');
      const searchColumn = isUUID ? 'id' : 'slug';

      // Bypass TypeScript errors for new slug column
      const { data, error } = await (supabase as any)
        .from('updates')
        .select('*')
        .eq(searchColumn, slug)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') return null; // Safe fallback if missing
        throw error;
      }
      return data;
    },
    enabled: !!slug,
  });

  // Fetch recent updates SAFELY using the actual post ID
  const { data: recentUpdates } = useQuery({
    queryKey: ['recent_updates_suggestions', update?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('updates')
        .select('*')
        .neq('id', update.id) // Safely exclude the current post by its exact ID
        .order('created_at', { ascending: false })
        .limit(4); // Show up to 4 suggestions
      if (error) throw error;
      return data;
    },
    enabled: !!update?.id, // Only run this after the main update is successfully loaded
  });

  // Track Clicks when an update is successfully viewed
  useEffect(() => {
    if (update && update.id) {
      (supabase as any).from('updates')
        .update({ clicks: ((update as any).clicks || 0) + 1 })
        .eq('id', update.id)
        .then(({ error }: any) => {
          if (error) console.error("Error updating click count:", error);
        });
    }
  }, [update]);

  // Handle Sharing
  const handleShare = async () => {
    // 3. Share URL updated to use slug or fallback to ID
    const shareUrl = `https://edudock.in/share/updates/${update?.slug || update?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: update?.headline || 'EduDock Update', 
          url: shareUrl 
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  // Format the Supabase date
  const formattedDate = update?.created_at 
    ? new Date(update.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse min-h-screen">
        <div className="h-6 bg-muted rounded w-64 mb-8" />
        <div className="h-64 bg-muted rounded-2xl w-full" />
      </div>
    );
  }

  // Not Found State
  if (!update) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <div className="bg-white/10 border border-white/20 p-8 rounded-2xl text-center">
          <p className="text-foreground text-lg font-medium mb-4">Update not found.</p>
          <button onClick={() => navigate('/updates')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main UI - Full Page Native Blog Layout (No Card/Grid styling wrapping the post)
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <Link to="/updates" className="hover:text-primary transition-colors">Updates</Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[400px]">
          {update.headline}
        </span>
      </nav>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl mx-auto flex flex-col"
      >
        <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold font-display text-foreground tracking-tight leading-[1.25] mb-6">
          {update.headline}
        </h1>

        {/* Author & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <img 
              src={update.author_avatar_url || '/favicon.svg'} 
              alt="Author" 
              className="w-12 h-12 rounded-full object-cover border border-border/50 bg-muted/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[16px] font-bold text-foreground">
                  {update.author_name || 'EduDock Official'}
                </p>
                
                {/* 🚨 EXACT X/TWITTER BLUE TICK (Two-tone SVG) 🚨 */}
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mt-0.5 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.846 3.45-.043.196-.064.398-.064.6 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.818 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.202-.02-.404-.064-.6 1.106-.704 1.846-1.99 1.846-3.45z" fill="#1D9BF0"/>
                  <path d="M12.044 18.354l-5.048-5.048 2.122-2.122 2.926 2.926 6.777-6.777 2.122 2.121-8.899 8.899z" fill="#FFFFFF"/>
                </svg>
              </div>
              
              {/* BIGGER BLUE HIGHLIGHTED DATE ANIMATION */}
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

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this EduDock update: ${update.headline} \n\nhttps://edudock.in/share/updates/${update.slug || update.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
              title="Share to WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </a>
            <a 
              href="https://t.me/edudock" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
            <button 
              onClick={handleShare} 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors" 
              title="Copy Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* UNCROPPED IMAGE (`object-contain`) */}
        {update.image_url && (
          <div className="w-full mb-10 overflow-hidden bg-transparent rounded-2xl">
            <img 
              src={update.image_url} 
              alt={update.headline} 
              className="w-full h-auto object-contain max-h-[700px] border border-border/20 shadow-sm" 
            />
          </div>
        )}

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {update.content && (
            <p className="whitespace-pre-wrap text-[16px] md:text-[18px] text-foreground/80 leading-[1.9] mb-10">
              {update.content}
            </p>
          )}

          {update.external_link && (
            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Official Resource</h3>
              <p className="text-base text-muted-foreground mb-6">Click below to visit the official website or resource related to this update.</p>
              <a
                href={update.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                Visit Official Link <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          )}
        </div>

        {/* Community Block */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-foreground">Get Notified First 🚀</p>
            <p className="text-sm text-muted-foreground">Join for fresh updates & resources</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
            <a 
              href="https://whatsapp.com/channel/0029VbCi3v5DZ4LZBkI0470b" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors font-semibold border border-[#25D366]/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
            <a 
              href="https://t.me/edudock" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors font-semibold border border-[#0088cc]/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </a>
          </div>
        </div>

        {/* 🚨 RECENT UPDATES SUGGESTIONS BLOCK (UNCROPPED THUMBNAILS) 🚨 */}
        {recentUpdates && recentUpdates.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border/40">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Recent Updates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentUpdates.map((item: any) => (
                <Link 
                  to={`/updates/${item.slug || item.id}`} 
                  key={item.id} 
                  className="flex gap-4 group items-center bg-card p-3 rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-md"
                >
                  {/* 🚨 UNCROPPED THUMBNAIL (object-contain) 🚨 */}
                  <div className="w-24 h-20 rounded-xl bg-muted/30 overflow-hidden shrink-0 border border-border/50 flex items-center justify-center p-1">
                    <img 
                      src={item.image_url || '/placeholder.svg'} 
                      alt="" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary leading-snug line-clamp-2 transition-colors">
                      {item.headline}
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
  );
}