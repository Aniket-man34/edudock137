import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RotateCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// 1. Updated interface to include clicks
interface Tool {
  id: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  image_url: string | null;
  website_url: string | null;
  clicks?: number; 
}

export default function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const [flipped, setFlipped] = useState(false);

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    // 2. Added 'as any' to bypass VS Code TypeScript errors
    (supabase.from('tools' as any) as any)
      .update({ clicks: ((tool as any).clicks || 0) + 1 })
      .eq('id', tool.id)
      .then(({ error }: any) => {
        if (error) console.error("Error updating clicks:", error);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="h-60 cursor-pointer group"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
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
              <img src={tool.image_url} alt={tool.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
              <span className="text-primary font-display font-bold text-lg">{tool.name[0]}</span>
            </div>
          )}
          <h3 className="font-display font-semibold text-base leading-snug">{tool.name}</h3>
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
          <h3 className="font-display font-semibold text-base mb-3">{tool.name}</h3>
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-6 flex-1">
            {tool.long_description || tool.short_description || 'No description available.'}
          </p>
          {tool.website_url && (
            <a
              href={tool.website_url}
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