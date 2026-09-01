'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Wallpaper } from '@/lib/supabase';
import { getThumbnailUrl, cn, glassIcon } from '@/utils/helpers';
import { WallpaperInfo } from './WallpaperInfo';
import { DownloadButton } from './DownloadButton';
import { FavoriteButton } from './FavoriteButton';
import { DoubleTapLikeOverlay } from './DoubleTapLikeOverlay';

interface CardProps {
    wallpaper: Wallpaper;
    onClick: (wallpaper: Wallpaper) => void;
    priority?: boolean;
}

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export function Card({ wallpaper, onClick, priority = false }: CardProps) {
    const [showInfo, setShowInfo] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { type: "spring", stiffness: 300, damping: 25 }
                },
                exit: {
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2, ease: "easeOut" }
                }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.05, zIndex: 10, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative aspect-[16/9] rounded-xl z-0",
                "bg-gray-900 border border-white/5 cursor-pointer"
            )}
        >
            <DoubleTapLikeOverlay
                wallpaper={wallpaper}
                onSingleTap={() => onClick(wallpaper)}
                className="w-full h-full rounded-xl overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoaded ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full h-full"
                    >
                        <Image
                            src={getThumbnailUrl(wallpaper.image_url)}
                            alt={wallpaper.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            priority={priority}
                            placeholder="blur"
                            blurDataURL={BLUR_DATA_URL}
                            unoptimized
                            onLoad={() => setImageLoaded(true)}
                        />
                    </motion.div>

                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    )} />
                </div>
            </DoubleTapLikeOverlay>

            <div className={cn(
                "absolute bottom-3 left-3 z-20",
                "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300",
                "md:transform md:translate-y-2 md:group-hover:translate-y-0"
            )}>
                <FavoriteButton
                    wallpaper={wallpaper}
                    className="p-3 min-w-[44px] min-h-[44px] hover:!text-red-500"
                />
            </div>

            <div className={cn(
                "absolute top-3 left-3 flex items-center gap-2 z-20",
                "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300",
                "md:transform md:translate-y-2 md:group-hover:translate-y-0"
            )}>
                <div
                    className="relative hidden md:block"
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(!showInfo);
                    }}
                >
                    <button
                        className={cn(
                            "p-3 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-md border",
                            "transition-all duration-300 shadow-lg",
                            showInfo
                                ? "bg-white text-black border-white"
                                : cn(glassIcon(), "text-white")
                        )}
                    >
                        <Info size={20} />
                    </button>

                    <WallpaperInfo
                        wallpaper={wallpaper}
                        isVisible={showInfo}
                        position="card"
                    />
                </div>

                <DownloadButton
                    wallpaperId={wallpaper.id}
                    imageUrl={wallpaper.image_url}
                    filename={`${wallpaper.name}.${wallpaper.format.toLowerCase()}`}
                    variant="button"
                />
            </div>
        </motion.div>
    );
}
