import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Share2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function UpdateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch Update Data
  const { data: update, isLoading } = useQuery({
    queryKey: ['update', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Handle Sharing with Supabase Edge Function URL
  const handleShare = async () => {
    const projectId = "qxuxvhzgmrwpngvmsume";
    const shareUrl = `https://${projectId}.supabase.co/functions/v1/og-meta/updates/${id}`;
    
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

  // Loading State (Glassmorphism Skeleton)
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex justify-center items-center p-4">
        <div className="bg-white/5 border border-white/10 w-full max-w-3xl rounded-2xl animate-pulse overflow-hidden">
          <div className="aspect-video bg-white/5" />
          <div className="p-8 space-y-4">
            <div className="h-8 bg-white/10 rounded-lg w-3/4" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!update) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex justify-center items-center">
        <div className="bg-white/10 border border-white/20 p-8 rounded-2xl text-center">
          <p className="text-white text-lg font-medium mb-4">Update not found.</p>
          <button onClick={() => navigate('/updates')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex justify-center items-center p-4 md:p-8">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-[#0f172a]/90 border border-white/10 backdrop-blur-xl w-full max-w-3xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col scrollbar-hide"
      >
        
        {/* --- Top Sticky Header (Actions) --- */}
        <div className="sticky top-0 right-0 w-full flex justify-end items-center gap-3 p-4 z-20 bg-gradient-to-b from-[#0f172a] to-transparent">
          
          {/* WhatsApp Direct Share Button */}
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(`Check out this EduDock update: ${update.headline} \n\nhttps://qxuxvhzgmrwpngvmsume.supabase.co/functions/v1/og-meta/updates/${id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-full shadow-lg transition"
            title="Share to WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path></svg>
          </a>

          {/* Native Share Button */}
          <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white p-2.5 rounded-full shadow-lg backdrop-blur-md transition" title="Share via Device">
            <Share2 className="h-5 w-5" />
          </button>
          
          {/* Close Button */}
          <button onClick={() => navigate('/updates')} className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-white p-2.5 rounded-full shadow-lg backdrop-blur-md transition" title="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* --- Main Content (Diagram Sequence) --- */}
        <div className="flex flex-col pb-10">
          
          {/* 1. Image at Top */}
          {update.image_url && (
            <div className="w-full relative -mt-16 z-10">
              <img 
                src={update.image_url} 
                alt={update.headline} 
                className="w-full object-cover max-h-[45vh] md:max-h-[55vh]" 
              />
              <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#0f172a]/90 to-transparent" />
            </div>
          )}

          <div className="px-6 md:px-10 pt-6 space-y-6 z-20">
            {/* 2. Headline & Text */}
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              {update.headline}
            </h1>
            
            {update.content && (
              <p className="text-slate-300 whitespace-pre-wrap text-base md:text-lg leading-relaxed">
                {update.content}
              </p>
            )}

            {/* 3. External Link (Bottom) */}
            {update.external_link && (
              <div className="pt-8 border-t border-white/10 mt-8">
                <a
                  href={update.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                >
                  Visit Linked Resource <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}