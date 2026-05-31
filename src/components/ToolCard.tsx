import { useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Tool = Tables<'tools'>;

function ToolCardComponent({ tool, index }: { tool: Tool; index: number }) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    // prevent double navigation when clicking internal elements
    e.stopPropagation();

    if (tool?.id) {
      supabase.from('tools')
        .update({ clicks: (tool.clicks || 0) + 1 })
        .eq('id', tool.id)
        .then(({ error }) => {
          if (error) console.error('Error updating clicks:', error);
        });
    }
  }, [tool?.id, tool?.clicks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.36 }}
      className="cursor-pointer"
    >
      <a
        href={tool.url || '#'}
        target={tool.url ? '_blank' : undefined}
        rel={tool.url ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className="flex flex-col items-center justify-center gap-2 p-3 text-center bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md hover:border-blue-200 active:scale-95 aspect-square"
      >
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 flex-none rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
          {tool.image_url ? (
            <img src={tool.image_url} alt={tool.title} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
          ) : (
            <span className="font-bold text-lg">{tool.title?.[0] || '?'}</span>
          )}
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-tight">{tool.title}</h3>
      </a>
    </motion.div>
  );
}

const areEqual = (prevProps: { tool: Tool; index: number }, nextProps: { tool: Tool; index: number }) => {
  return prevProps.tool.id === nextProps.tool.id &&
    prevProps.tool.title === nextProps.tool.title &&
    prevProps.tool.image_url === nextProps.tool.image_url &&
    prevProps.tool.url === nextProps.tool.url &&
    prevProps.tool.clicks === nextProps.tool.clicks &&
    prevProps.index === nextProps.index;
};

const ToolCard = memo(ToolCardComponent, areEqual);
export default ToolCard;