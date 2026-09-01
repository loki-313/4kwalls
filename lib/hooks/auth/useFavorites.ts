import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { notifySuccess, notifyError } from '@/components/common/Notifications';
import { STALE_TIME } from '@/lib/constants';

export function useFavorites() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const queryKey = ['favorites', user?.id];

    const { data: favoriteIds = [] } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user || !isSupabaseConfigured) return [];
            const { data, error } = await supabase
                .from('user_favorites')
                .select('wallpaper_id')
                .eq('user_id', user.id);

            if (error) throw error;
            return data.map((fav: { wallpaper_id: number }) => fav.wallpaper_id);
        },
        enabled: !!user && isSupabaseConfigured,
        staleTime: STALE_TIME.FAVORITES,
    });

    const toggleMut = useMutation({
        mutationFn: async (wallpaperId: number) => {
            if (!user) throw new Error("User not logged in");
            if (!isSupabaseConfigured) return;
            const isFavorite = favoriteIds.includes(wallpaperId);

            if (isFavorite) {
                const { error } = await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('wallpaper_id', wallpaperId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('user_favorites')
                    .insert({ user_id: user.id, wallpaper_id: wallpaperId });

                if (error) throw error;
            }
        },
        onMutate: async (wallpaperId) => {
            await queryClient.cancelQueries({ queryKey });

            const previousFavorites = queryClient.getQueryData<number[]>(queryKey);

            queryClient.setQueryData<number[]>(queryKey, (old = []) => {
                return old.includes(wallpaperId)
                    ? old.filter((id) => id !== wallpaperId)
                    : [...old, wallpaperId];
            });

            return { previousFavorites };
        },
        onError: (_err, _newTodo, context) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(queryKey, context.previousFavorites);
            }
            notifyError('Failed to update favorites');
        },
        onSuccess: (_data, wallpaperId) => {
            const isFavorite = queryClient.getQueryData<number[]>(queryKey)?.includes(wallpaperId);
            if (isFavorite) {
                notifySuccess('Added to favorites');
            } else {
                notifySuccess('Removed from favorites');
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const isFavorite = (wallpaperId: number) => favoriteIds.includes(wallpaperId);

    return {
        favoriteIds,
        isFavorite,
        toggleFavorite: toggleMut.mutate,
        isToggling: toggleMut.isPending,
    };
}
