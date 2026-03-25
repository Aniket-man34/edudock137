import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

interface UpdateForm {
  headline: string;
  content: string;
  image_url: string;
  external_link: string;
}

const emptyForm: UpdateForm = { headline: '', content: '', image_url: '', external_link: '' };

export default function UpdatesManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<UpdateForm>(emptyForm); // For Adding
  const [editForm, setEditForm] = useState<UpdateForm>(emptyForm); // For Editing in Modal
  const [editId, setEditId] = useState<string | null>(null);

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
      toast.success('Update created successfully!');
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

  // Reusable Form Fields Component
  const UpdateFormFields = ({ formData, setFormData }: { formData: UpdateForm, setFormData: any }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Headline *</label>
        <Input value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} required className="bg-white/5 border-white/10" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Content (supports emojis 🎉)</label>
        <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="bg-white/5 border-white/10" rows={5} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">External Link</label>
        <Input value={formData.external_link} onChange={(e) => setFormData({ ...formData, external_link: e.target.value })} className="bg-white/5 border-white/10" placeholder="https://..." />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Image</label>
        <ImageUpload bucket="update-images" value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* SECTION 1: BIGGER ADD FORM (Left Side) */}
      <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/10 bg-[#0f172a]/80">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5 text-blue-500" /> Add New Update</h2>
        <form onSubmit={(e) => { e.preventDefault(); addUpdate.mutate(); }}>
          <UpdateFormFields formData={form} setFormData={setForm} />
          <Button type="submit" disabled={addUpdate.isPending} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white">
            Publish Update
          </Button>
        </form>
      </div>

      {/* SECTION 2: SMALLER UPLOADED LIST (Right Side) */}
      <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/10 bg-[#0f172a]/50 h-[800px] flex flex-col">
        <h2 className="text-xl font-bold mb-6">Published Updates</h2>
        <div className="overflow-y-auto pr-2 space-y-3 scrollbar-hide flex-1">
          {filtered?.map((update) => (
            <div key={update.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={update.image_url || '/image-placeholder.png'} className="w-12 h-10 rounded object-cover shrink-0 bg-black/20" alt="" />
                <p className="font-semibold text-sm truncate text-slate-200">{update.headline}</p>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditId(update.id);
                    setEditForm({ headline: update.headline, content: update.content || '', image_url: update.image_url || '', external_link: update.external_link || '' });
                  }} 
                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                ><Pencil className="h-4 w-4" /></button>
                <button 
                  onClick={() => { if (window.confirm(`Delete "${update.headline}"?`)) remove.mutate(update.id); }} 
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                ><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {(!filtered || filtered.length === 0) && <p className="text-center text-slate-500 text-sm py-10">No updates found.</p>}
        </div>
      </div>

      {/* EDIT MODAL POPUP */}
      <AnimatePresence>
        {editId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-xl font-bold">Edit Update</h2>
                <button onClick={() => setEditId(null)} className="p-2 hover:bg-white/10 rounded-full transition"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-5 overflow-y-auto">
                <form onSubmit={(e) => { e.preventDefault(); updateExisting.mutate(); }}>
                  <UpdateFormFields formData={editForm} setFormData={setEditForm} />
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    <Button type="submit" disabled={updateExisting.isPending} className="bg-blue-600 hover:bg-blue-500">Save Changes</Button>
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