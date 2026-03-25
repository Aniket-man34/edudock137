import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, X, Bell } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

interface UpdateForm {
  headline: string;
  content: string;
  image_url: string;
  external_link: string;
}

const emptyForm: UpdateForm = { headline: '', content: '', image_url: '', external_link: '' };

// MOVED OUTSIDE to fix the "losing focus / keyboard closing" bug!
const UpdateFormFields = ({ formData, setFormData }: { formData: UpdateForm, setFormData: any }) => (
  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground">Headline *</label>
      <Input value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} required className="bg-muted/50 focus:bg-background transition-colors" placeholder="e.g. Exam Dates Announced!" />
    </div>
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground">Content (supports emojis 🎉)</label>
      <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="bg-muted/50 focus:bg-background transition-colors resize-none" rows={5} placeholder="Details about this update..." />
    </div>
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground">External Link</label>
      <Input value={formData.external_link} onChange={(e) => setFormData({ ...formData, external_link: e.target.value })} className="bg-muted/50 focus:bg-background transition-colors" placeholder="https://..." />
    </div>
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground mb-2">Cover Image</label>
      <ImageUpload bucket="update-images" value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} />
    </div>
  </div>
);

export default function UpdatesManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<UpdateForm>(emptyForm); // For Adding
  const [editForm, setEditForm] = useState<UpdateForm>(emptyForm); // For Editing in Modal
  const [editId, setEditId] = useState<string | null>(null);
  
  // State to control Add Form visibility
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const { data: updates } = useQuery({
    queryKey: ['updates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Automatically open the edit modal if an ID is passed in the URL (from global search)
  useEffect(() => {
    const targetEditId = searchParams.get('edit');
    if (targetEditId && updates) {
      const updateToEdit = updates.find(u => u.id === targetEditId);
      if (updateToEdit) {
        setEditId(updateToEdit.id);
        setEditForm({ 
          headline: updateToEdit.headline, 
          content: updateToEdit.content || '', 
          image_url: updateToEdit.image_url || '', 
          external_link: updateToEdit.external_link || '' 
        });
      }
    }
  }, [searchParams, updates]);

  const addUpdate = useMutation({
    mutationFn: async () => {
      const payload = {
        headline: form.headline.trim(),
        content: form.content || null,
        image_url: form.image_url || null,
        external_link: form.external_link || null,
      };
      const { error } = await supabase.from('updates').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['updates'] });
      setForm(emptyForm);
      setIsAddFormOpen(false); // Close form on success
      toast.success('Update published successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateExisting = useMutation({
    mutationFn: async () => {
      const payload = {
        headline: editForm.headline.trim(),
        content: editForm.content || null,
        image_url: editForm.image_url || null,
        external_link: editForm.external_link || null,
      };
      const { error } = await supabase.from('updates').update(payload).eq('id', editId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['updates'] });
      setEditId(null);
      toast.success('Update saved successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('updates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['updates'] });
      toast.success('Update deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = updates?.filter((u) => !search || u.headline.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* --- HEADER WITH ADD BUTTON --- */}
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Manage Updates</h3>
            <p className="text-xs text-muted-foreground">{filtered?.length || 0} updates published</p>
          </div>
        </div>
        {!isAddFormOpen && (
          <Button onClick={() => setIsAddFormOpen(true)} className="gap-2 shadow-lg bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4" /> Add New Update
          </Button>
        )}
      </div>

      {/* --- COLLAPSIBLE ADD FORM --- */}
      <AnimatePresence>
        {isAddFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 rounded-2xl border border-purple-500/20 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h4 className="font-bold text-purple-500">Create New Update</h4>
                <button type="button" onClick={() => { setIsAddFormOpen(false); setForm(emptyForm); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); addUpdate.mutate(); }}>
                <UpdateFormFields formData={form} setFormData={setForm} />
                <div className="flex gap-3 pt-6 border-t border-border/50 mt-6">
                  <Button type="submit" disabled={addUpdate.isPending} className="flex-1 md:flex-none w-40 bg-purple-600 hover:bg-purple-700 text-white">
                    {addUpdate.isPending ? 'Publishing...' : 'Publish Update'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsAddFormOpen(false); setForm(emptyForm); }} className="flex-1 md:flex-none w-24">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LIST OF UPDATES --- */}
      <div className="space-y-3">
        {filtered?.map((update) => (
          <div key={update.id} className="glass-card p-3 rounded-xl flex items-center justify-between gap-4 border border-border/40 hover:border-purple-500/30 transition-all group">
            <div className="flex items-center gap-4 min-w-0">
              <img src={update.image_url || '/image-placeholder.png'} className="w-16 h-12 rounded-lg object-cover shrink-0 bg-muted border border-border/50 shadow-sm" alt="" />
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{update.headline}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5 hidden sm:block">{update.content || 'No content'}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditId(update.id);
                  setEditForm({ headline: update.headline, content: update.content || '', image_url: update.image_url || '', external_link: update.external_link || '' });
                }} 
                className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors" title="Edit Update"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button 
                onClick={() => { if (window.confirm(`Delete "${update.headline}"?`)) remove.mutate(update.id); }} 
                className="p-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="Delete Update"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <div className="py-20 text-center glass-card rounded-2xl border-dashed border-2 border-border/50">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No updates found matching your search.</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL POPUP */}
      <AnimatePresence>
        {editId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <h2 className="text-xl font-bold text-foreground">Edit Update</h2>
                <button onClick={() => setEditId(null)} className="p-2 hover:bg-muted rounded-full transition"><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="p-6 overflow-y-auto scrollbar-hide">
                <form onSubmit={(e) => { e.preventDefault(); updateExisting.mutate(); }}>
                  <UpdateFormFields formData={editForm} setFormData={setEditForm} />
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                    <Button type="button" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    <Button type="submit" disabled={updateExisting.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">Save Changes</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}