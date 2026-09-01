'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, incrementDownloadCount, incrementFavoriteCount } from '@/lib/supabase';

export { incrementDownloadCount, incrementFavoriteCount };

interface WallpaperStats {
    download_count: number;
    fav_count: number;
}

export function useWallpaperStats(wallpaperId: number, initialStats?: WallpaperStats) {
    const [stats, setStats] = useState<WallpaperStats>({
        download_count: initialStats?.download_count ?? 0,
        fav_count: initialStats?.fav_count ?? 0,
    });

    useEffect(() => {
        if (initialStats) {
            setStats({
                download_count: initialStats.download_count,
                fav_count: initialStats.fav_count,
            });
        }
    }, [wallpaperId, initialStats?.download_count, initialStats?.fav_count]);

    useEffect(() => {
        if (!wallpaperId || !isSupabaseConfigured) return;

        const channel = supabase
            .channel(`wallpaper-stats-${wallpaperId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'wallpapers',
                    filter: `id=eq.${wallpaperId}`,
                },
                (payload) => {
                    const newData = payload.new as WallpaperStats;
                    setStats({
                        download_count: newData.download_count,
                        fav_count: newData.fav_count,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [wallpaperId]);

    return { stats };
}
