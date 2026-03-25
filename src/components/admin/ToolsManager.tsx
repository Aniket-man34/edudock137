import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Plus, X, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from './ImageUpload';

interface ToolForm {
  name: string;
  short_description: string;
  long_description: string;
  image_url: string;
  website_url: string;
  category_id: string;
}

const emptyForm: ToolForm = { 
  name: '', 
  short_description: '', 
  long_description: '', 
  image_url: '', 
  website_url: '', 
  category_id: '' 
};

export default function ToolsManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ToolForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  
  // State to control whether the form is visible
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      setIsFormOpen(false); // Close the form automatically on success
      toast.success(editId ? 'Tool updated successfully' : 'Tool created successfully');
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
      toast.success('Tool deleted successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = tools?.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (tool: any) => {
    setEditId(tool.id);
    setForm({
      name: tool.name,
      short_description: tool.short_description || '',
      long_description: tool.long_description || '',
      image_url: tool.image_url || '',
      website_url: tool.website_url || '',
      category_id: tool.category_id || '',
    });
    setIsFormOpen(true); // Open the form when edit is clicked
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      
      {/* --- HEADER & ADD BUTTON --- */}
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Manage Tools</h3>
            <p className="text-xs text-muted-foreground">{filtered?.length || 0} tools available</p>
          </div>
        </div>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Add New Tool
          </Button>
        )}
      </div>

      {/* --- COLLAPSIBLE FORM --- */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="glass-card p-6 rounded-2xl border border-primary/20 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h4 className="font-bold text-primary">{editId ? 'Edit Tool' : 'Register New Tool'}</h4>
                <button type="button" onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tool Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Rank Predictor" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Tagline</label>
                <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Brief 1-sentence description" className="bg-muted/50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Description</label>
                <Textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} rows={4} placeholder="Explain how this tool works..." className="bg-muted/50 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." className="bg-muted/50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block mb-2">Tool Icon/Image</label>
                <ImageUpload bucket="tool-images" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/50">
                <Button type="submit" disabled={save.isPending} className="flex-1 md:flex-none w-36">
                  {save.isPending ? 'Saving...' : editId ? 'Update Tool' : 'Save Tool'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 md:flex-none w-24">
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOOL LIST --- */}
      <div className="space-y-3">
        {filtered?.map((tool) => (
          <div key={tool.id} className="glass-card p-4 rounded-xl flex items-center justify-between gap-4 border border-border/40 hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/50 shrink-0 border border-border/50 flex items-center justify-center">
                {tool.image_url ? (
                  <img src={tool.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-lg">{tool.name[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{tool.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{tool.short_description || 'No description provided'}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(tool)} className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button 
                onClick={() => { if (confirm(`Are you sure you want to delete "${tool.name}"?`)) remove.mutate(tool.id); }} 
                className="p-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <div className="py-16 text-center glass-card rounded-2xl border-dashed border-2 border-border/50">
            <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No tools found matching your search.</p>
          </div>
        )}
      </div>

    </div>
  );
}