import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PdfForm {
  name: string;
  description: string;
  cover_image_url: string;
  drive_link: string;
  pdf_category_id: string;
}

const emptyForm: PdfForm = { name: '', description: '', cover_image_url: '', drive_link: '', pdf_category_id: '' };

export default function PdfsManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<PdfForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: pdfs } = useQuery({
    queryKey: ['pdfs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pdfs').select('*, pdf_categories(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: pdfCategories } = useQuery({
    queryKey: ['pdf_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pdf_categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        cover_image_url: form.cover_image_url || null,
        drive_link: form.drive_link.trim(),
        pdf_category_id: form.pdf_category_id || null,
      };
      if (editId) {
        const { error } = await supabase.from('pdfs').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pdfs').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfs'] });
      setForm(emptyForm);
      setEditId(null);
      toast.success(editId ? 'PDF updated' : 'PDF created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pdfs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfs'] });
      toast.success('PDF deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = pdfs?.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="glass-card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Name *</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-muted/50" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-muted/50" rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Drive Link *</label>
          <Input value={form.drive_link} onChange={(e) => setForm({ ...form, drive_link: e.target.value })} required className="bg-muted/50" placeholder="https://drive.google.com/..." />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">PDF Category</label>
          <Select value={form.pdf_category_id} onValueChange={(v) => setForm({ ...form, pdf_category_id: v })}>
            <SelectTrigger className="bg-muted/50">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {pdfCategories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Cover Image</label>
          <ImageUpload bucket="pdf-covers" value={form.cover_image_url} onChange={(url) => setForm({ ...form, cover_image_url: url })} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending} className="gap-1.5">
            <Plus className="h-4 w-4" /> {editId ? 'Update PDF' : 'Add PDF'}
          </Button>
          {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</Button>}
        </div>
      </form>

      <div className="space-y-2">
        {filtered?.map((pdf) => (
          <div key={pdf.id} className="glass-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {pdf.cover_image_url && <img src={pdf.cover_image_url} alt="" className="w-10 h-14 rounded object-cover shrink-0" />}
              <div className="min-w-0">
                {/* Description removed from right below the name */}
                <p className="font-medium truncate text-lg">{pdf.name}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditId(pdf.id);
                  setForm({ name: pdf.name, description: pdf.description || '', cover_image_url: pdf.cover_image_url || '', drive_link: pdf.drive_link, pdf_category_id: pdf.pdf_category_id || '' });
                }}
                className="p-2 rounded-lg hover:bg-muted/50 text-primary transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (window.confirm(`Delete "${pdf.name}"?`)) remove.mutate(pdf.id); }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && <p className="text-muted-foreground text-center py-8">No PDFs found.</p>}
      </div>
    </div>
  );
}