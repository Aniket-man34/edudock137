import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) return;
      if (editId) {
        const { error } = await supabase.from('categories').update({ name: name.trim() }).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert({ name: name.trim() });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setEditId(null);
      toast.success(editId ? 'Category updated' : 'Category created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = categories?.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
        className="glass-card p-4 flex gap-3"
      >
        <Input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-muted/50 flex-1"
          required
        />
        <Button type="submit" disabled={save.isPending} className="gap-1.5">
          <Plus className="h-4 w-4" /> {editId ? 'Update' : 'Add'}
        </Button>
        {editId && (
          <Button type="button" variant="outline" onClick={() => { setEditId(null); setName(''); }}>
            Cancel
          </Button>
        )}
      </form>

      <div className="space-y-2">
        {filtered?.map((cat) => (
          <div key={cat.id} className="glass-card p-4 flex items-center justify-between">
            <span className="font-medium">{cat.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditId(cat.id); setName(cat.name); }}
                className="p-2 rounded-lg hover:bg-muted/50 text-primary transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete category "${cat.name}"?`)) remove.mutate(cat.id);
                }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <p className="text-muted-foreground text-center py-8">No categories found.</p>
        )}
      </div>
    </div>
  );
}
