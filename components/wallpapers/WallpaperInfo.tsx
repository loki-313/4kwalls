'use client';

import { Monitor, HardDrive, Download, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallpaper } from '@/lib/supabase';
import { formatFileSize, cn } from '@/utils/helpers';
import { useWallpaperStats } from '@/lib/hooks/useWallpaperStats';

interface WallpaperInfoProps {
    wallpaper: Wallpaper;
    isVisible: boolean;
    position?: 'card' | 'modal' | 'static';
}

export function WallpaperInfo({
    wallpaper,
    isVisible,
    position = 'card'
}: WallpaperInfoProps) {
    const { stats } = useWallpaperStats(wallpaper.id, {
        download_count: wallpaper.download_count,
        fav_count: wallpaper.fav_count,
    });

    let positionClasses = '';
    if (position === 'card') {
        positionClasses = 'absolute top-full left-0 mt-2 scale-85 origin-top-left';
    } else if (position === 'modal') {
        positionClasses = cn(
            'absolute',
            'bottom-full mb-3 left-0 origin-bottom-left',
            'md:top-full md:mt-2 md:left-0 md:translate-x-0 md:bottom-auto md:mb-0',
            'md:origin-top-left'
        );
    } else if (position === 'static') {
        positionClasses = 'relative mt-4 scale-100 origin-center';
    }

    const formatCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={cn(
                        positionClasses,
                        "p-3 bg-black/80 backdrop-blur-md border border-white/10",
                        "rounded-xl w-max shadow-2xl z-50 whitespace-nowrap"
                    )}
                >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex items-center gap-2 text-gray-200">
                            <Monitor size={14} className="text-cyan-400" />
                            <span className="font-['JetBrains_Mono'] text-xs font-medium">
                                {wallpaper.width}x{wallpaper.height}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                            <HardDrive size={14} className="text-emerald-400" />
                            <span className="font-['JetBrains_Mono'] text-xs text-gray-400 uppercase">
                                {formatFileSize(wallpaper.file_size)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-200">
                            <Download size={14} className="text-violet-400" />
                            <motion.span
                                key={stats.download_count}
                                initial={{ scale: 1.2, color: '#a78bfa' }}
                                animate={{ scale: 1, color: '#9ca3af' }}
                                className="font-['JetBrains_Mono'] text-xs font-medium"
                            >
                                {formatCount(stats.download_count)}
                            </motion.span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-200">
                            <Heart size={14} className="text-rose-400" />
                            <motion.span
                                key={stats.fav_count}
                                initial={{ scale: 1.2, color: '#fb7185' }}
                                animate={{ scale: 1, color: '#9ca3af' }}
                                className="font-['JetBrains_Mono'] text-xs font-medium"
                            >
                                {formatCount(stats.fav_count)}
                            </motion.span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
