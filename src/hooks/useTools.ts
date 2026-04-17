import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tool } from '@/types';

export function useTools(page = 1, itemsPerPage = 12) {
    return useQuery({
        queryKey: ['tools', page],
        queryFn: async () => {
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            const { data, error } = await supabase
                .from('tools')
                .select('*, categories(name)')
                .order('title')
                .range(from, to);

            if (error) throw error;
            return data || [];
        },
    });
}

export function useTrendingTools(limit = 8) {
    return useQuery({
        queryKey: ['trending-tools'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tools')
                .select('*, categories(name)')
                .order('clicks', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
    });
}

export function useToolsByCategory(categoryId: string) {
    return useQuery({
        queryKey: ['tools', 'category', categoryId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tools')
                .select('*, categories(name)')
                .eq('category_id', categoryId)
                .order('title');

            if (error) throw error;
            return data || [];
        },
        enabled: !!categoryId,
    });
}