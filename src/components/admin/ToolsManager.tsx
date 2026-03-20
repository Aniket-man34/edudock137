import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

interface ToolForm {
  name: string;
  short_description: string;
  long_description: string;
  image_url: string;
  website_url: string;
  category_id: string;
}

const emptyForm: ToolForm = { name: '', short_description: '', long_description: '', image_url: '', website_url: '', category_id: '' };

export default function ToolsManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ToolForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: tools } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tools').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

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
      const payload = {
        name: form.name.trim(),
        short_description: form.short_description || null,
        long_description: form.long_description || null,
        image_url: form.image_url || null,
        website_url: form.website_url || null,
        category_id: form.category_id || null,
      };
      if (editId) {
        const { error } = await supabase.from('tools').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tools').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] });
      setForm(emptyForm);
      setEditId(null);
      toast.success(editId ? 'Tool updated' : 'Tool created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] });
      toast.success('Tool deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = tools?.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (tool: typeof tools extends (infer T)[] | undefined ? NonNullable<T> : never) => {
    setEditId(tool.id);
    setForm({
      name: tool.name,
      short_description: tool.short_description || '',
      long_description: tool.long_description || '',
      image_url: tool.image_url || '',
      website_url: tool.website_url || '',
      category_id: tool.category_id || '',
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-muted/50" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Short Description</label>
          <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="bg-muted/50" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Long Description</label>
          <Textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} className="bg-muted/50" rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Website URL</label>
          <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="bg-muted/50" placeholder="https://..." />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Image</label>
          <ImageUpload bucket="tool-images" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending} className="gap-1.5">
            <Plus className="h-4 w-4" /> {editId ? 'Update Tool' : 'Add Tool'}
          </Button>
          {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</Button>}
        </div>
      </form>

      <div className="space-y-2">
        {filtered?.map((tool) => (
          <div key={tool.id} className="glass-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {tool.image_url && <img src={tool.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
              <div className="min-w-0">
                <p className="font-medium truncate">{tool.name}</p>
                <p className="text-muted-foreground text-xs truncate">{tool.short_description}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(tool)} className="p-2 rounded-lg hover:bg-muted/50 text-primary transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (window.confirm(`Delete "${tool.name}"?`)) remove.mutate(tool.id); }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && <p className="text-muted-foreground text-center py-8">No tools found.</p>}
      </div>
    </div>
  );
}
