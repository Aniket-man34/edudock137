import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, ExternalLink, BookOpen, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ContextType = { searchQuery: string };

export default function Pdfs() {
  const { searchQuery } = useOutletContext<ContextType>();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(id || null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const isNewPdf = (createdAt: string) => {
    if (!createdAt) return false;
    const uploadDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - uploadDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">PDF Library</h1>
        <p className="page-subtitle">Explore our collection of study materials and books</p>
      </motion.div>

      {/* Dropdown Category Filter */}
      {pdfCategories && pdfCategories.length > 0 && (
        <div className="relative mb-6 z-40">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border/50 shadow-sm rounded-lg hover:bg-muted/50 transition-all text-sm font-medium"
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
            {activeCategoryId 
              ? pdfCategories.find(c => c.id === activeCategoryId)?.name 
              : 'All Categories'}
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsFilterOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-background border border-border/50 z-40 overflow-hidden"
                >
                  {/* Scrollable inner container */}
                  <div className="max-h-[50vh] overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <button
                      onClick={() => {
                        setActiveCategoryId(null);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                        activeCategoryId === null ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                      }`}
                    >
                      All Categories
                    </button>
                    {pdfCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategoryId(cat.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                          activeCategoryId === cat.id ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                        }`}
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

                (supabase.from('pdfs' as any) as any)
                  .update({ clicks: ((pdf as any).clicks || 0) + 1 })
                  .eq('id', pdf.id)
                  .then(({ error }: any) => {
                    if (error) console.error("Error updating PDF clicks:", error);
                  });
              }}
              className="relative aspect-[3/4] glass-card overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              
              {isNewPdf(pdf.created_at) && (
                <div className="absolute top-3 left-3 z-30">
                  <span className="relative flex h-5 w-12 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-30"></span>
                    <span className="relative inline-flex rounded-full h-5 w-12 items-center justify-center bg-blue-500 border border-blue-400 text-[9px] font-bold text-white uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                      New
                    </span>
                  </span>
                </div>
              )}

              {pdf.cover_image_url ? (
                <>
                  <img src={pdf.cover_image_url} alt={pdf.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10" />
                  
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16 z-20 transition-opacity duration-300">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug drop-shadow-md">
                      {pdf.name}
                    </h3>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3 relative z-10">
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
              className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header with Share Buttons */}
              <div className="flex items-center justify-end gap-2 p-3 border-b border-border/30">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this EduDock PDF: ${selectedPdf.name} \n\nhttps://edudock.in/share/pdfs/${selectedId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                  title="Share to WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </a>
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

                {/* --- COMPACT Community Join Block --- */}
                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Get Notified</p>
                    <p className="text-[10px] text-muted-foreground">Join for new study materials</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <a 
                      href="https://whatsapp.com/channel/0029VbBdBJj3gvWfZFIEUw1J" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-xs font-medium border border-[#25D366]/20"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      WhatsApp
                    </a>
                    <a 
                      href="https://t.me/edudock" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors text-xs font-medium border border-[#0088cc]/20"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      Telegram
                    </a>
                  </div>
                </div>
                {/* --- End Community Block --- */}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}