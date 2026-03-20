import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsForm {
  page: string;
  visitor_count: string;
  month: string;
  year: string;
}

const emptyForm: AnalyticsForm = { page: '', visitor_count: '0', month: '', year: new Date().getFullYear().toString() };

export default function AnalyticsManager({ search }: { search: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<AnalyticsForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.from('analytics').select('*').order('year').order('month');
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        page: form.page.trim(),
        visitor_count: parseInt(form.visitor_count) || 0,
        month: form.month.trim(),
        year: parseInt(form.year) || new Date().getFullYear(),
      };
      if (editId) {
        const { error } = await supabase.from('analytics').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('analytics').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-analytics'] });
      setForm(emptyForm);
      setEditId(null);
      toast.success(editId ? 'Entry updated' : 'Entry created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('analytics').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success('Entry deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = analytics?.filter((a) => !search || a.page.toLowerCase().includes(search.toLowerCase()) || a.month.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Page *</label>
            <Input value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} required className="bg-muted/50" placeholder="home" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Month *</label>
            <Input value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required className="bg-muted/50" placeholder="Jan" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Year *</label>
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required className="bg-muted/50" type="number" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Visitors *</label>
            <Input value={form.visitor_count} onChange={(e) => setForm({ ...form, visitor_count: e.target.value })} required className="bg-muted/50" type="number" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending} className="gap-1.5">
            <Plus className="h-4 w-4" /> {editId ? 'Update' : 'Add Entry'}
          </Button>
          {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</Button>}
        </div>
      </form>

      <div className="space-y-2">
        {filtered?.map((a) => (
          <div key={a.id} className="glass-card p-4 flex items-center justify-between">
            <div>
              <span className="font-medium">{a.page}</span>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="text-muted-foreground text-sm">{a.month} {a.year}</span>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="text-primary font-semibold">{a.visitor_count} visitors</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditId(a.id);
                  setForm({ page: a.page, visitor_count: a.visitor_count.toString(), month: a.month, year: a.year.toString() });
                }}
                className="p-2 rounded-lg hover:bg-muted/50 text-primary transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (window.confirm('Delete this entry?')) remove.mutate(a.id); }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && <p className="text-muted-foreground text-center py-8">No analytics entries found.</p>}
      </div>
    </div>
  );
}
