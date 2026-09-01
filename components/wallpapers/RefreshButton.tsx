'use client';

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn, triggerHaptic } from '@/utils/helpers';

interface RefreshButtonProps {
    onRefresh: () => void;
    isLoading: boolean;
}

export function RefreshButton({ onRefresh, isLoading }: RefreshButtonProps) {
    const handleClick = () => {
        triggerHaptic('medium');
        onRefresh();
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                rotate: isLoading ? 360 : 0
            }}
            transition={{
                rotate: isLoading
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : { duration: 0 },
                default: { duration: 0.3 }
            }}
            whileHover={isLoading ? {} : { scale: 1.1 }}
            whileTap={isLoading ? {} : { scale: 0.9 }}
            onClick={handleClick}
            disabled={isLoading}
            className={cn(
                "fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 p-4 md:p-5 rounded-full",
                "bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md",
                "text-white shadow-lg border border-white/10"
            )}
            title="Refresh & Shuffle"
        >
            <RefreshCw size={32} />
        </motion.button>
    );
}
