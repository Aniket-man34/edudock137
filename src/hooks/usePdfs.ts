import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Pdf } from '@/types';

export function usePdfs(page = 1, itemsPerPage = 12) {
    return useQuery({
        queryKey: ['pdfs', page],
        queryFn: async () => {
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            const { data, error } = await supabase
                .from('pdfs')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return data || [];
        },
    });
}

export function useTrendingPdfs(limit = 8) {
    return useQuery({
        queryKey: ['trending-pdfs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pdfs')
                .select('*')
                .order('clicks', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
    });
}

export function useNewPdfs(limit = 6) {
    return useQuery({
        queryKey: ['new-pdfs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pdfs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
    });
}

export function usePdfsByCategory(categoryId: string) {
    return useQuery({
        queryKey: ['pdfs', 'category', categoryId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pdfs')
                .select('*, categories(name)')
                .eq('category_id', categoryId)
                .order('title');

            if (error) throw error;
            return data || [];
        },
        enabled: !!categoryId,
    });
}