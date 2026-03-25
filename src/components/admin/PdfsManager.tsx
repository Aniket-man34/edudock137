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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PdfForm { name: string; description: string; cover_image_url: string; drive_link: string; pdf_category_id: string; }
const emptyForm: PdfForm = { name: '', description: '', cover_image_url: '', drive_link: '', pdf_category_id: '' };

export default function PdfsManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<PdfForm>(emptyForm); // For Adding
  const [editForm, setEditForm] = useState<PdfForm>(emptyForm); // For Editing in Modal
  const [editId, setEditId] = useState<string | null>(null);

  const { data: pdfs } = useQuery({
    queryKey: ['pdfs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pdfs').select('*, pdf_categories(name)').order('created_at', { ascending: false });
      if (error) throw error; return data;
    },
  });

  const { data: pdfCategories } = useQuery({
    queryKey: ['pdf_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pdf_categories').select('*').order('name');
      if (error) throw error; return data;
    },
  });

  // Automatically open the edit modal if an ID is passed in the URL (from global search)
  useEffect(() => {
    const targetEditId = searchParams.get('edit');
    if (targetEditId && pdfs) {
      const pdfToEdit = pdfs.find(p => p.id === targetEditId);
      if (pdfToEdit) {
        setEditId(pdfToEdit.id);
        setEditForm({ 
          name: pdfToEdit.name, 
          description: pdfToEdit.description || '', 
          cover_image_url: pdfToEdit.cover_image_url || '', 
          drive_link: pdfToEdit.drive_link, 
          pdf_category_id: pdfToEdit.pdf_category_id || '' 
        });
      }
    }
  }, [searchParams, pdfs]);

  // Save (Add) Mutation
  const addPdf = useMutation({
    mutationFn: async () => {
      const payload = { ...form, name: form.name.trim(), drive_link: form.drive_link.trim() };
      const { error } = await supabase.from('pdfs').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfs'] });
      setForm(emptyForm);
      toast.success('PDF created successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Update (Edit) Mutation
  const updatePdf = useMutation({
    mutationFn: async () => {
      const payload = { ...editForm, name: editForm.name.trim(), drive_link: editForm.drive_link.trim() };
      const { error } = await supabase.from('pdfs').update(payload).eq('id', editId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfs'] });
      setEditId(null);
      toast.success('PDF updated successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Delete Mutation
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pdfs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pdfs'] }); toast.success('PDF deleted'); },
  });

  const filtered = pdfs?.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  // Reusable Form Component so we don't repeat code for Add and Edit
  const PdfFormFields = ({ formData, setFormData }: { formData: PdfForm, setFormData: any }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Name *</label>
        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-white/5 border-white/10" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Description</label>
        <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-white/5 border-white/10" rows={3} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Drive Link *</label>
        <Input value={formData.drive_link} onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })} required className="bg-white/5 border-white/10" placeholder="https://drive..." />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Category</label>
        <Select value={formData.pdf_category_id} onValueChange={(v) => setFormData({ ...formData, pdf_category_id: v })}>
          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select a category" /></SelectTrigger>
          <SelectContent>
            {pdfCategories?.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Cover Image</label>
        <ImageUpload bucket="pdf-covers" value={formData.cover_image_url} onChange={(url) => setFormData({ ...formData, cover_image_url: url })} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* SECTION 1: BIGGER ADD FORM (Left Side) */}
      <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/10 bg-[#0f172a]/80">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5 text-blue-500" /> Add New PDF</h2>
        <form onSubmit={(e) => { e.preventDefault(); addPdf.mutate(); }}>
          <PdfFormFields formData={form} setFormData={setForm} />
          <Button type="submit" disabled={addPdf.isPending} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white">
            Upload PDF
          </Button>
        </form>
      </div>

      {/* SECTION 2: SMALLER UPLOADED LIST (Right Side) */}
      <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/10 bg-[#0f172a]/50 h-[800px] flex flex-col">
        <h2 className="text-xl font-bold mb-6">Uploaded PDFs</h2>
        <div className="overflow-y-auto pr-2 space-y-3 scrollbar-hide flex-1">
          {filtered?.map((pdf) => (
            <div key={pdf.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={pdf.cover_image_url || '/pdf-placeholder.png'} className="w-10 h-14 rounded object-cover shrink-0 bg-black/20" alt="" />
                <p className="font-semibold text-sm truncate text-slate-200">{pdf.name}</p>
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditId(pdf.id);
                    setEditForm({ name: pdf.name, description: pdf.description || '', cover_image_url: pdf.cover_image_url || '', drive_link: pdf.drive_link, pdf_category_id: pdf.pdf_category_id || '' });
                  }} 
                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                ><Pencil className="h-4 w-4" /></button>
                <button 
                  onClick={() => { if (window.confirm(`Delete "${pdf.name}"?`)) remove.mutate(pdf.id); }} 
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                ><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {(!filtered || filtered.length === 0) && <p className="text-center text-slate-500 text-sm py-10">No PDFs found.</p>}
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
                <h2 className="text-xl font-bold">Edit PDF</h2>
                <button onClick={() => setEditId(null)} className="p-2 hover:bg-white/10 rounded-full transition"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-5 overflow-y-auto">
                <form onSubmit={(e) => { e.preventDefault(); updatePdf.mutate(); }}>
                  <PdfFormFields formData={editForm} setFormData={setEditForm} />
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    <Button type="submit" disabled={updatePdf.isPending} className="bg-blue-600 hover:bg-blue-500">Save Changes</Button>
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