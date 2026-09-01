'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/hooks/auth/useFavorites';
import { Wallpaper, incrementFavoriteCount } from '@/lib/supabase';
import { cn, triggerHaptic } from '@/utils/helpers';

interface DoubleTapLikeOverlayProps {
    wallpaper: Wallpaper;
    children: React.ReactNode;
    onSingleTap?: () => void;
    className?: string;
}

export function DoubleTapLikeOverlay({
    wallpaper,
    children,
    onSingleTap,
    className
}: DoubleTapLikeOverlayProps) {
    const [showHeart, setShowHeart] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();

    const lastTap = useRef<number>(0);
    const timer = useRef<NodeJS.Timeout | null>(null);

    const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('button, a')) {
            return;
        }

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
            }

            const currentlyFavorited = isFavorite(wallpaper.id);

            if (!currentlyFavorited) {
                incrementFavoriteCount(wallpaper.id);
                toggleFavorite(wallpaper.id);
                triggerHaptic('success');
            } else {
                triggerHaptic('medium');
            }

            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);

            lastTap.current = 0;
        } else {
            lastTap.current = now;

            if (onSingleTap) {
                timer.current = setTimeout(() => {
                    onSingleTap();
                    lastTap.current = 0;
                }, DOUBLE_TAP_DELAY);
            }
        }
    }, [isFavorite, toggleFavorite, onSingleTap, wallpaper.id]);

    return (
        <div
            className={cn("relative w-full h-full touch-manipulation", className)}
            onClick={handleTap}
        >
            {children}

            <AnimatePresence>
                {showHeart && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                        <motion.div
                            initial={{ scale: 0, opacity: 0, rotate: -15 }}
                            animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, y: -50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Heart
                                size={100}
                                className="fill-white text-white drop-shadow-2xl"
                                strokeWidth={0}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
