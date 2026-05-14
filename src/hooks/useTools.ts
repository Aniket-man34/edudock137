import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tool } from '@/types';

export function useTools(page = 1, itemsPerPage = 12) {
    return useQuery({
        queryKey: ['tools', page],
        queryFn: async () => {
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            
            const { data, error, count } = await supabase
                .from('tools')
                .select('*, categories(name)', { count: 'exact' })
                .order('title')
                .range(from, to);

            if (error) throw new Error(error.message);
            return {
                data: data || [],
                total: count || 0
            };
        },
        staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes
        retry: 2, // Retry failed requests twice
        refetchOnWindowFocus: false, // Don't refetch on window focus
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

            if (error) throw new Error(error.message);
            return data || [];
        },
        staleTime: 2 * 60 * 1000, // Trending data stays fresh for 2 minutes
        gcTime: 5 * 60 * 1000, // Cache persists for 5 minutes
        refetchOnWindowFocus: false,
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

            if (error) throw new Error(error.message);
            return data || [];
        },
        enabled: !!categoryId,
        staleTime: 3 * 60 * 1000, // Category data stays fresh for 3 minutes
        gcTime: 7 * 60 * 1000, // Cache persists for 7 minutes
        refetchOnWindowFocus: false,
    });
}