'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ImmersiveCard } from '@/components/immersive/ImmersiveCard';
import { fetchUniqueWallpapers, updateViewedIds } from '@/utils/random';
import { glassIcon, cn } from '@/utils/helpers';
import { STALE_TIME } from '@/lib/constants';

export default function ImmersivePage() {
    const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setViewedIds(new Set());
            setIsHydrated(true);
        }
    }, []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['wallpapers', 'immersive', isHydrated ? 'active' : 'idle'],
        queryFn: async () => {
            const wallpapers = await fetchUniqueWallpapers(5, viewedIds);
            setViewedIds(prev => updateViewedIds(prev, wallpapers));
            return wallpapers;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.length > 0 ? 1 : undefined,
        staleTime: STALE_TIME.ZERO,
        enabled: isHydrated
    });

    const allWallpapers = data?.pages.flat() || [];

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 200) {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }
    };

    if (isLoading && !data) {
        return (
            <div className="h-screen w-full bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
        );
    }

    return (
        <main
            className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory"
            onScroll={handleScroll}
            style={{ overscrollBehaviorY: 'contain' }}
        >
            <Link
                href="/"
                className={cn(
                    glassIcon(),
                    "fixed top-6 left-6 z-50 p-3 rounded-full flex items-center justify-center !border-white/20 hover:!bg-white/20 active:scale-95 transition-all"
                )}
            >
                <ArrowLeft size={24} />
            </Link>

            {allWallpapers.map((wallpaper, index) => (
                <div key={`${wallpaper.id}-${index}`} className="h-screen w-full snap-start">
                    <ImmersiveCard wallpaper={wallpaper} priority={index < 3} />
                </div>
            ))}

            <div className="h-20 w-full flex items-center justify-center snap-center">
                <Loader2 className="animate-spin text-white/20" />
            </div>
        </main>
    );
}
