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

  const handleShare = async () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const ogUrl = `https://${projectId}.supabase.co/functions/v1/og-meta/pdfs/${selectedId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedPdf?.name || 'EduDock PDF', url: ogUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(ogUrl);
      toast.success('Link copied to clipboard!');
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
              {/* Header */}
              <div className="flex items-center justify-end gap-1.5 p-3 border-b border-border/30">
                <button onClick={handleShare} className="btn-icon" title="Share">
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
