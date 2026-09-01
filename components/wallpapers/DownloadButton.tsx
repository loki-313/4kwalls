'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { cn, glassIcon, getProxiedImageUrl, handleDownload, triggerHaptic } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { notifyError, notifySuccess } from '@/components/common/Notifications';
import { incrementDownloadCount } from '@/lib/supabase';

interface DownloadButtonProps {
    wallpaperId: number;
    imageUrl: string;
    filename: string;
    variant?: 'button' | 'link' | 'glass';
    className?: string;
    showText?: boolean;
    label?: string;
}

export function DownloadButton({
    wallpaperId,
    imageUrl,
    filename,
    variant = 'button',
    className,
    showText = true,
    label
}: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();

        if (isDownloading) return;

        if (variant === 'link') {
            triggerHaptic('light');
            setIsDownloading(true);
            await incrementDownloadCount(wallpaperId);
            triggerHaptic('success');
            setTimeout(() => setIsDownloading(false), 1500);
            return;
        }

        triggerHaptic('light');
        setIsDownloading(true);

        try {
            await handleDownload(imageUrl, filename);
            await incrementDownloadCount(wallpaperId);
            notifySuccess('Download started!');
            triggerHaptic('success');
        } catch (error) {
            console.error("Download failed", error);
            notifyError('Download failed. Please try again.');
            triggerHaptic('error');
        } finally {
            setIsDownloading(false);
        }
    };

    const baseClasses = cn(
        'flex items-center gap-2 rounded-full font-medium',
        glassIcon(),
        isDownloading ? 'bg-white/5 cursor-wait' : '',
        className
    );

    const content = (
        <>
            <AnimatePresence mode="wait">
                {isDownloading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Loader2 size={variant === 'button' ? 18 : 16} className="animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="download"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Download size={variant === 'button' ? 18 : 16} />
                    </motion.div>
                )}
            </AnimatePresence>
            {showText && !isDownloading && (
                <span className={cn('text-sm ml-2', variant === 'link' && 'hidden sm:inline')}>
                    {label || 'Download'}
                </span>
            )}
        </>
    );

    if (variant === 'link') {
        return (
            <a
                href={getProxiedImageUrl(imageUrl)}
                download={filename}
                onClick={handleClick}
                className={cn('h-10 px-4', baseClasses)}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isDownloading}
            className={cn(baseClasses, 'px-5 py-3')}
        >
            {content}
        </button>
    );
}
