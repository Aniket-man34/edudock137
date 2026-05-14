import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RotateCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Tool = Tables<'tools'>;

function ToolCardComponent({ tool, index }: { tool: Tool; index: number }) {
  const [flipped, setFlipped] = useState(false);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    supabase.from('tools')
      .update({ clicks: (tool.clicks || 0) + 1 })
      .eq('id', tool.id)
      .then(({ error }) => {
        if (error) console.error("Error updating clicks:", error);
      });
  }, [tool.id, tool.clicks]);

  const handleCardClick = useCallback(() => {
    setFlipped(prev => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="h-60 cursor-pointer group"
      style={{ perspective: '1000px' }}
      onClick={handleCardClick}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 28 }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 glass-card p-6 flex flex-col items-center justify-center text-center gap-3"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {tool.image_url ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center mb-1">
              <img src={tool.image_url} alt={tool.title} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
              <span className="text-primary font-display font-bold text-lg">{tool.title[0]}</span>
            </div>
          )}
          <h3 className="font-display font-semibold text-base leading-snug">{tool.title}</h3>
          {tool.short_description && (
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{tool.short_description}</p>
          )}
          <span className="text-primary/60 text-[10px] font-medium flex items-center gap-1 mt-auto">
            <RotateCw className="h-3 w-3" /> Tap to flip
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 glass-card p-6 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="font-display font-semibold text-base mb-3">{tool.title}</h3>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-6 flex-1">
            {tool.description || tool.short_description || 'No description available.'}
          </p>
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick} // <-- Tracker is attached here
              className="btn-primary text-xs mt-4 self-start"
            >
              Open Website <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: { tool: Tool; index: number }, nextProps: { tool: Tool; index: number }) => {
  // Only re-render if tool data actually changed
  return prevProps.tool.id === nextProps.tool.id &&
    prevProps.tool.title === nextProps.tool.title &&
    prevProps.tool.short_description === nextProps.tool.short_description &&
    prevProps.tool.description === nextProps.tool.description &&
    prevProps.tool.image_url === nextProps.tool.image_url &&
    prevProps.tool.url === nextProps.tool.url &&
    prevProps.tool.clicks === nextProps.tool.clicks &&
    prevProps.index === nextProps.index;
};

const ToolCard = memo(ToolCardComponent, areEqual);
export default ToolCard;