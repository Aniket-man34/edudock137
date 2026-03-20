import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
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
  const [form, setForm] = useState<UpdateForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: updates } = useQuery({
    queryKey: ['updates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        headline: form.headline.trim(),
        content: form.content || null,
        image_url: form.image_url || null,
        external_link: form.external_link || null,
      };
      if (editId) {
        const { error } = await supabase.from('updates').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('updates').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['updates'] });
      setForm(emptyForm);
      setEditId(null);
      toast.success(editId ? 'Update edited' : 'Update created');
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
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="glass-card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Headline *</label>
          <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} required className="bg-muted/50" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Content (supports emojis 🎉)</label>
          <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-muted/50" rows={5} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">External Link</label>
          <Input value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} className="bg-muted/50" placeholder="https://..." />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Image</label>
          <ImageUpload bucket="update-images" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending} className="gap-1.5">
            <Plus className="h-4 w-4" /> {editId ? 'Update' : 'Add Update'}
          </Button>
          {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</Button>}
        </div>
      </form>

      <div className="space-y-2">
        {filtered?.map((update) => (
          <div key={update.id} className="glass-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {update.image_url && <img src={update.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
              <p className="font-medium truncate">{update.headline}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditId(update.id);
                  setForm({ headline: update.headline, content: update.content || '', image_url: update.image_url || '', external_link: update.external_link || '' });
                }}
                className="p-2 rounded-lg hover:bg-muted/50 text-primary transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (window.confirm(`Delete "${update.headline}"?`)) remove.mutate(update.id); }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && <p className="text-muted-foreground text-center py-8">No updates found.</p>}
      </div>
    </div>
  );
}
