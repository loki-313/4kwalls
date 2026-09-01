'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cn, glass, glassIcon, getThumbnailUrl } from '@/utils/helpers';
import { Wallpaper, getCategoryWallpapers } from '@/lib/supabase';
import { ImageModal } from '@/components/wallpapers/ImageModal';
import { WALLPAPER_CATEGORIES, INFINITE_SCROLL, STALE_TIME, IMAGE_CONFIG } from '@/lib/constants';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(null);
        }
    }, [isOpen]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center p-0 md:p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                            className={cn(
                                glass(),
                                "relative w-full max-w-4xl rounded-none md:rounded-2xl overflow-hidden",
                                "flex flex-col",
                                "h-full md:h-[85vh] md:max-h-[700px]",
                                "bg-black/95 md:bg-black/60 z-10"
                            )}
                        >
                            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                                <h2 className="text-xl md:text-2xl font-bold text-white">
                                    {selectedCategory
                                        ? WALLPAPER_CATEGORIES.find(c => c.id === selectedCategory)?.name
                                        : 'Browse Categories'}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {selectedCategory && (
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-sm font-medium",
                                                "bg-white/10 hover:bg-white/20 text-white transition-colors"
                                            )}
                                        >
                                            ← Back
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className={cn(
                                            glassIcon(),
                                            "w-10 h-10 flex items-center justify-center rounded-full"
                                        )}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {!selectedCategory ? (
                                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {WALLPAPER_CATEGORIES.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategory(category.id)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                                                    "bg-white/5 hover:bg-white/10 border border-white/10",
                                                    "text-white font-medium transition-all",
                                                    "hover:border-cyan-500/50 hover:text-cyan-400"
                                                )}
                                            >
                                                <span className="text-xl">{category.emoji}</span>
                                                <span className="text-sm">{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <CategoryFeed
                                    category={selectedCategory}
                                    onWallpaperClick={setSelectedWallpaper}
                                />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ImageModal wallpaper={selectedWallpaper} onClose={() => setSelectedWallpaper(null)} />
        </>
    );
}

interface CategoryFeedProps {
    category: string;
    onWallpaperClick: (wallpaper: Wallpaper) => void;
}

function CategoryFeed({ category, onWallpaperClick }: CategoryFeedProps) {
    const seed = useMemo(() => Math.random().toString(), []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['categoryWallpapers', category, seed],
        queryFn: async ({ pageParam = 0 }) => {
            const limit = INFINITE_SCROLL.BATCH_SIZE;
            const offset = pageParam * limit;
            return getCategoryWallpapers(category, seed, offset, limit);
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length >= INFINITE_SCROLL.BATCH_SIZE ? allPages.length : undefined;
        },
        staleTime: STALE_TIME.CATEGORIES,
    });

    const allWallpapers = data?.pages.flat() || [];

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 400 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/50" size={32} />
            </div>
        );
    }

    if (allWallpapers.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                No wallpapers found in this category.
            </div>
        );
    }

    return (
        <div className={cn(glass(), "flex flex-col flex-1 min-h-0 bg-black/80 shadow-2xl")}>
            <div
                className="flex-1 overflow-y-auto p-4 md:p-6"
                onScroll={handleScroll}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {allWallpapers.map((wallpaper: Wallpaper) => (
                        <motion.div
                            key={wallpaper.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                                "relative aspect-video rounded-lg overflow-hidden cursor-pointer",
                                "border border-white/5 hover:border-cyan-500/50 transition-all"
                            )}
                            onClick={() => onWallpaperClick(wallpaper)}
                        >
                            <Image
                                src={getThumbnailUrl(wallpaper.image_url, { width: IMAGE_CONFIG.THUMBNAIL_WIDTH })}
                                alt={wallpaper.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                unoptimized
                            />
                        </motion.div>
                    ))}
                </div>

                {isFetchingNextPage && (
                    <div className="flex justify-center py-6">
                        <Loader2 className="animate-spin text-white/50" size={24} />
                    </div>
                )}
            </div>
        </div>
    );
}
