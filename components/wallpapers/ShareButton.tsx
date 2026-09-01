'use client';

import { useState } from 'react';
import { Share2, Check, Loader2 } from 'lucide-react';
import { cn, glassIcon, getProxiedImageUrl, triggerHaptic } from '@/utils/helpers';
import { notifySuccess, notifyError } from '@/components/common/Notifications';

interface ShareButtonProps {
    url: string;
    title?: string;
    imageUrl?: string;
    imageAlt?: string;
    className?: string;
}

export function ShareButton({ url, title = 'Check out this 4K Wallpaper!', imageUrl, imageAlt = 'wallpaper', className }: ShareButtonProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (typeof navigator !== 'undefined' && navigator.share) {
            triggerHaptic('light');
            try {
                let shareData: ShareData = {
                    title: '4K Walls',
                    text: title,
                    url: url
                };

                if (imageUrl) {
                    setIsLoading(true);
                    const fetchUrl = getProxiedImageUrl(imageUrl);

                    try {
                        const response = await fetch(fetchUrl);
                        if (!response.ok) throw new Error('Failed to fetch image');

                        const blob = await response.blob();
                        const file = new File([blob], `${imageAlt}.webp`, { type: 'image/webp' });

                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            shareData = {
                                ...shareData,
                                files: [file]
                            };
                        }
                    } catch (fetchError) {
                        console.error('Failed to prepare image for sharing, falling back to link only', fetchError);
                    }
                }

                setIsLoading(false);
                await navigator.share(shareData);
                triggerHaptic('success');
                return;

            } catch (error) {
                setIsLoading(false);
                triggerHaptic('error');
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error sharing:', error);
                    notifyError('Share failed: ' + (error as Error).message);
                } else {
                    return;
                }
            }
        }

        setIsLoading(false);
        triggerHaptic('light');

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                notifySuccess('Link copied to clipboard!');
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    setIsCopied(true);
                    notifySuccess('Link copied to clipboard!');
                } else {
                    throw new Error('Clipboard access denied');
                }
            }

            triggerHaptic('success');
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            triggerHaptic('error');
            if (typeof window !== 'undefined' && !window.isSecureContext) {
                notifyError('Sharing requires HTTPS (or use localhost).');
            } else {
                notifyError('Failed to copy link');
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            disabled={isLoading}
            className={cn(glassIcon(), 'h-10 w-10 flex items-center justify-center rounded-full text-white', className)}
            aria-label="Share wallpaper"
            title="Share"
        >
            {isLoading ? (
                <Loader2 size={18} className="animate-spin text-white/70" />
            ) : isCopied ? (
                <Check size={18} className="text-green-400" />
            ) : (
                <Share2 size={18} />
            )}
        </button>
    );
}
