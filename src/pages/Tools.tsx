import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOutletContext } from 'react-router-dom';
import ToolCard from '@/components/ToolCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Filter } from 'lucide-react';
import { useState } from 'react';

type ContextType = { searchQuery: string };

export default function Tools() {
  const { searchQuery } = useOutletContext<ContextType>();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: tools, isLoading } = useQuery<any[]>({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('tools').select('*, tool_categories(name)').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: toolCategories } = useQuery<any[]>({
    queryKey: ['tool_categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('tool_categories').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = tools?.filter((t: any) => {
    const matchesSearch =
      !searchQuery ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !activeCategoryId || t.tool_category_id === activeCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header">All Tools</h1>
        <p className="page-subtitle">Browse our curated collection of educational tools</p>
      </motion.div>

      {/* Dropdown Category Filter */}
      {toolCategories && toolCategories.length > 0 && (
        <div className="relative mb-6 z-40">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border/50 shadow-sm rounded-lg hover:bg-muted/50 transition-all text-sm font-medium"
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
            {activeCategoryId 
              ? toolCategories.find((c: any) => c.id === activeCategoryId)?.name 
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
                    {toolCategories.map((cat: any) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-60 glass-card animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((tool: any, i: number) => (
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