'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallpaper } from '@/lib/supabase';
import { RefreshButton } from '@/components/wallpapers/RefreshButton';
import { Card } from '@/components/wallpapers/Card';
import { Header } from '@/components/common/Header';
import { ImageModal } from '@/components/wallpapers/ImageModal';
import {
    loadViewedIds,
    saveViewedIds,
    clearViewedIds,
    fetchUniqueWallpapers,
    updateViewedIds,
    shouldStopFetching,
    fetchTotalWallpaperCount
} from '@/utils/random';

export default function WallpapersPage() {
    const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setViewedIds(loadViewedIds());
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        const timeoutId = setTimeout(() => {
            saveViewedIds(viewedIds);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [viewedIds, isHydrated]);

    useEffect(() => {
        fetchTotalWallpaperCount().then(setTotalCount);
    }, []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isRefetching,
        refetch
    } = useInfiniteQuery({
        queryKey: ['wallpapers', 'random'],
        queryFn: async () => {
            const wallpapers = await fetchUniqueWallpapers(32, viewedIds);
            setViewedIds(prev => updateViewedIds(prev, wallpapers));
            return wallpapers;
        },
        getNextPageParam: (lastPage, allPages) => {
            if (shouldStopFetching(viewedIds.size, totalCount, lastPage.length, 32)) {
                return undefined;
            }
            return allPages.length;
        },
        initialPageParam: 0,
        staleTime: Infinity,
        enabled: isHydrated,
    });

    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
                    fetchNextPage();
                }
            },
            {
                rootMargin: '600px',
                threshold: 0
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

    const allWallpapers = data?.pages.flat() || [];
    const wallpaperMap = new Map<number, Wallpaper>();
    for (const w of allWallpapers) {
        wallpaperMap.set(w.id, w);
    }
    const wallpapers = Array.from(wallpaperMap.values());

    const handleRefresh = async () => {
        setViewedIds(new Set());
        clearViewedIds();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await refetch();
    };

    if (isLoading && !data) {
        return (
            <main className="min-h-screen bg-black text-white font-sans relative">
                <Header />
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-white/50" size={32} />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans relative">
            <Header />

            <div className="p-4 md:p-8 pt-0 md:pt-4">
                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[6px] max-w-full mx-auto"
                >
                    {wallpapers.map((wallpaper: Wallpaper, index: number) => (
                        <Card
                            key={wallpaper.id}
                            wallpaper={wallpaper}
                            onClick={setSelectedWallpaper}
                            priority={index < 16}
                        />
                    ))}
                </motion.div>

                <div ref={observerRef} className="mt-8 pb-8 flex justify-center">
                    {isFetchingNextPage && <Loader2 className="animate-spin text-white/50" size={24} />}
                </div>

                {wallpapers.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 mt-20">No wallpapers found.</div>
                )}
            </div>

            <RefreshButton onRefresh={handleRefresh} isLoading={isLoading || isFetchingNextPage || isRefetching} />

            <ImageModal wallpaper={selectedWallpaper} onClose={() => setSelectedWallpaper(null)} />
        </main>
    );
}
