import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Update } from '@/types';

export function useUpdates(page = 1, itemsPerPage = 9) {
    return useQuery({
        queryKey: ['updates', page],
        queryFn: async () => {
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            const { data, error } = await supabase
                .from('updates')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return data || [];
        },
    });
}

export function useTrendingUpdates(limit = 6) {
    return useQuery({
        queryKey: ['trending-updates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('updates')
                .select('*')
                .order('clicks', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
    });
}

export function useNewUpdates(limit = 6) {
    return useQuery({
        queryKey: ['new-updates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('updates')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
    });
}