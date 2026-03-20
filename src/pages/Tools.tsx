import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext } from 'react-router-dom';
import ToolCard from '@/components/ToolCard';
import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';

type ContextType = { searchQuery: string };

export default function Tools() {
  const { searchQuery } = useOutletContext<ContextType>();

  const { data: tools, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tools').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const filtered = tools?.filter(
    (t) =>
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">All Tools</h1>
        <p className="page-subtitle">Browse our curated collection of educational tools</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-60 glass-card animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="glass-card inline-flex p-4 rounded-2xl mb-4">
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>
          <p>No tools found.</p>
        </div>
      )}
    </div>
  );
}
