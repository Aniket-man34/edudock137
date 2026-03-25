import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PdfForm { name: string; description: string; cover_image_url: string; drive_link: string; pdf_category_id: string; }
// FIX 1: Default to 'none' instead of empty string
const emptyForm: PdfForm = { name: '', description: '', cover_image_url: '', drive_link: '', pdf_category_id: 'none' };

const PdfFormFields = ({ formData, setFormData, pdfCategories }: { formData: PdfForm, setFormData: any, pdfCategories: any }) => (
  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground">Name *</label>
      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-muted/50 focus:bg-background transition-colors" placeholder="e.g. HC Verma Physics Vol 1" />
    </div>
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground">Description</label>
      <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-muted/50 focus:bg-background transition-colors resize-none" rows={3} placeholder="Brief description of the PDF contents..." />
    </div>
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground">Drive Link *</label>
      <Input value={formData.drive_link} onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })} required className="bg-muted/50 focus:bg-background transition-colors" placeholder="https://drive.google.com/..." />
    </div>
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground">Category</label>
      <Select value={formData.pdf_category_id} onValueChange={(v) => setFormData({ ...formData, pdf_category_id: v })}>
        <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select a category" /></SelectTrigger>
        {/* FIX 2: Added z-[120] so it pops UP over the modal instead of hiding behind it */}
        <SelectContent className="z-[120]">
          <SelectItem value="none" className="text-muted-foreground italic">None</SelectItem>
          {pdfCategories?.map((cat: any) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <label className="text-sm font-medium mb-1.5 block text-foreground mb-2">Cover Image</label>
      <ImageUpload bucket="pdf-covers" value={formData.cover_image_url} onChange={(url) => setFormData({ ...formData, cover_image_url: url })} />
    </div>
  </div>
);

export default function PdfsManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<PdfForm>(emptyForm);
  const [editForm, setEditForm] = useState<PdfForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

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
          pdf_category_id: pdfToEdit.pdf_category_id || 'none' // FIX 3
        });
      }
    }
  }, [searchParams, pdfs]);

  const addPdf = useMutation({
    mutationFn: async () => {
      const payload = { 
        ...form, 
        name: form.name.trim(), 
        drive_link: form.drive_link.trim(),
        pdf_category_id: form.pdf_category_id === 'none' ? null : form.pdf_category_id || null
      };
      const { error } = await supabase.from('pdfs').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfs'] });
      setForm(emptyForm);
      setIsAddFormOpen(false);
      toast.success('PDF created successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePdf = useMutation({
    mutationFn: async () => {
      const payload = { 
        name: editForm.name.trim(), 
        description: editForm.description || null,
        cover_image_url: editForm.cover_image_url || null,
        drive_link: editForm.drive_link.trim(),
        pdf_category_id: editForm.pdf_category_id === 'none' || editForm.pdf_category_id === '' ? null : editForm.pdf_category_id
      };
      
      const { error } = await supabase.from('pdfs').update(payload).eq('id', editId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfs'], exact: true });
      setEditId(null);
      toast.success('PDF updated successfully!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pdfs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pdfs'] }); toast.success('PDF deleted'); },
  });

  const filtered = pdfs?.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Manage PDFs</h3>
            <p className="text-xs text-muted-foreground">{filtered?.length || 0} PDFs available</p>
          </div>
        </div>
        {!isAddFormOpen && (
          <Button onClick={() => setIsAddFormOpen(true)} className="gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" /> Add New PDF
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isAddFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 rounded-2xl border border-blue-500/20 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h4 className="font-bold text-blue-500">Upload New PDF</h4>
                <button type="button" onClick={() => { setIsAddFormOpen(false); setForm(emptyForm); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); addPdf.mutate(); }}>
                <PdfFormFields formData={form} setFormData={setForm} pdfCategories={pdfCategories} />
                <div className="flex gap-3 pt-6 border-t border-border/50 mt-6">
                  <Button type="submit" disabled={addPdf.isPending} className="flex-1 md:flex-none w-40 bg-blue-600 hover:bg-blue-700 text-white">
                    {addPdf.isPending ? 'Uploading...' : 'Upload PDF'}
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

      <div className="space-y-3">
        {filtered?.map((pdf) => (
          <div key={pdf.id} className="glass-card p-3 rounded-xl flex items-center justify-between gap-4 border border-border/40 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-4 min-w-0">
              <img src={pdf.cover_image_url || '/pdf-placeholder.png'} className="w-12 h-16 rounded-lg object-cover shrink-0 bg-muted border border-border/50 shadow-sm" alt="" />
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{pdf.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {pdf.pdf_categories?.name && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      {pdf.pdf_categories.name}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">{pdf.description || 'No description provided'}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditId(pdf.id);
                  setEditForm({ name: pdf.name, description: pdf.description || '', cover_image_url: pdf.cover_image_url || '', drive_link: pdf.drive_link, pdf_category_id: pdf.pdf_category_id || 'none' }); // FIX 4
                }} 
                className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors" title="Edit PDF"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button 
                onClick={() => { if (window.confirm(`Delete "${pdf.name}"?`)) remove.mutate(pdf.id); }} 
                className="p-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="Delete PDF"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <div className="py-20 text-center glass-card rounded-2xl border-dashed border-2 border-border/50">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No PDFs found matching your search.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <h2 className="text-xl font-bold text-foreground">Edit PDF Details</h2>
                <button onClick={() => setEditId(null)} className="p-2 hover:bg-muted rounded-full transition"><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="p-6 overflow-y-auto scrollbar-hide">
                <form onSubmit={(e) => { e.preventDefault(); updatePdf.mutate(); }}>
                  <PdfFormFields formData={editForm} setFormData={setEditForm} pdfCategories={pdfCategories} />
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                    <Button type="button" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    <Button type="submit" disabled={updatePdf.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
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