import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, ExternalLink, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

type ContextType = { searchQuery: string };

export default function Pdfs() {
  const { searchQuery } = useOutletContext<ContextType>();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(id || null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const { data: pdfs, isLoading } = useQuery({
    queryKey: ['pdfs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pdfs').select('*, pdf_categories(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: pdfCategories } = useQuery({
    queryKey: ['pdf_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pdf_categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (id) setSelectedId(id);
  }, [id]);

  const selectedPdf = pdfs?.find((p) => p.id === selectedId);

  const filtered = pdfs?.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategoryId || p.pdf_category_id === activeCategoryId;
    return matchesSearch && matchesCategory;
  });

  const handleClose = () => {
    setSelectedId(null);
    if (id) navigate('/pdfs');
  };

  // UPDATED: Using the clean Netlify redirect link
  const handleShare = async () => {
    const shareUrl = `https://edudock.in/share/pdfs/${selectedId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedPdf?.name || 'EduDock PDF', url: shareUrl });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('PDF Link copied to clipboard!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">PDF Library</h1>
        <p className="page-subtitle">Explore our collection of study materials and books</p>
      </motion.div>

      {/* Category filter chips */}
      {pdfCategories && pdfCategories.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant={activeCategoryId === null ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5 text-sm transition-colors"
            onClick={() => setActiveCategoryId(null)}
          >
            All
          </Badge>
          {pdfCategories.map((cat) => (
            <Badge
              key={cat.id}
              variant={activeCategoryId === cat.id ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 text-sm transition-colors"
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4] glass-card animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((pdf, i) => (
            <motion.div
              key={pdf.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              onClick={() => {
                setSelectedId(pdf.id);
                navigate(`/pdfs/${pdf.id}`, { replace: true });
              }}
              className="aspect-[3/4] glass-card overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
            >
              {pdf.cover_image_url ? (
                <img src={pdf.cover_image_url} alt={pdf.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
                  <BookOpen className="h-8 w-8 text-primary/40" />
                  <span className="font-display font-semibold text-sm text-center leading-snug">{pdf.name}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="glass-card inline-flex p-4 rounded-2xl mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p>No PDFs found.</p>
        </div>
      )}

      {/* PDF Modal */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              {/* Header with Updated Share Buttons */}
              <div className="flex items-center justify-end gap-2 p-3 border-b border-border/30">
                
                {/* WhatsApp Direct Share Button with Clean Link */}
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this EduDock PDF: ${selectedPdf.name} \n\nhttps://edudock.netlify.app/share/pdfs/${selectedId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                  title="Share to WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path></svg>
                </a>

                {/* Native Share Button */}
                <button onClick={handleShare} className="btn-icon" title="Share via Device">
                  <Share2 className="h-4 w-4" />
                </button>
                
                <button onClick={handleClose} className="btn-icon" title="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {selectedPdf.cover_image_url && (
                  <div className="rounded-xl overflow-hidden bg-muted/20">
                    <img
                      src={selectedPdf.cover_image_url}
                      alt={selectedPdf.name}
                      className="w-full max-h-56 object-contain"
                    />
                  </div>
                )}
                <div>
                  <h2 className="font-display text-xl font-bold leading-snug">{selectedPdf.name}</h2>
                  {selectedPdf.description && (
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{selectedPdf.description}</p>
                  )}
                </div>
                <a
                  href={selectedPdf.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  Open / Download PDF <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}