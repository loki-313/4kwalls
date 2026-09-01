import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IMAGE_CONFIG } from '@/lib/constants';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function glass(): string {
    return 'backdrop-blur-none md:backdrop-blur-sm bg-black/40 border border-white/10';
}

export function glassButton(): string {
    return cn(
        'bg-black/40 border border-white/10 backdrop-blur-none md:backdrop-blur-[2px]',
        'hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-400 hover:backdrop-blur-md transition-all duration-300'
    );
}

export function glassActive(): string {
    return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]';
}

export function glassIcon(): string {
    return cn(
        'bg-transparent backdrop-blur-none md:backdrop-blur-[2px] border border-white/30 text-white',
        'hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 hover:backdrop-blur-md transition-all duration-300'
    );
}

export function glassNavbar(): string {
    return 'backdrop-blur-none md:backdrop-blur-md border border-white/20';
}

export function glassInput(): string {
    return cn(
        'w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4',
        'text-white placeholder:text-gray-500 focus:outline-none',
        'focus:border-white/30 focus:bg-white/10 transition-all'
    );
}

export function formatFileSize(sizeStr: string): string {
    if (!sizeStr) return '0 MB';
    const num = parseFloat(sizeStr.replace(/[^0-9.]/g, ''));
    if (sizeStr.toUpperCase().includes('MB')) return sizeStr;
    return (num / 1024).toFixed(2) + ' MB';
}

export function getProxiedImageUrl(url: string): string {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('r2.dev')) {
            return `/images${urlObj.pathname}`;
        }
        return url;
    } catch {
        return url;
    }
}

interface ThumbnailOptions {
    width?: number;
    quality?: number;
}

export function getThumbnailUrl(url: string, options: ThumbnailOptions = {}): string {
    if (!url) return '';
    const { width = IMAGE_CONFIG.THUMBNAIL_WIDTH, quality = IMAGE_CONFIG.THUMBNAIL_QUALITY } = options;
    try {
        const proxyUrl = new URL('https://wsrv.nl/');
        proxyUrl.searchParams.set('url', url);
        proxyUrl.searchParams.set('w', width.toString());
        proxyUrl.searchParams.set('q', quality.toString());
        proxyUrl.searchParams.set('output', 'webp');
        proxyUrl.searchParams.set('fit', 'cover');
        return proxyUrl.toString();
    } catch {
        return url;
    }
}

export function getModalImageUrl(url: string): string {
    return getThumbnailUrl(url, { width: IMAGE_CONFIG.MODAL_WIDTH, quality: IMAGE_CONFIG.MODAL_QUALITY });
}

export function getSiteUrl(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'http://localhost:3000';
}

export async function handleDownload(url: string, filename: string): Promise<void> {
    const downloadUrl = getProxiedImageUrl(url);
    try {
        const response = await fetch(downloadUrl, {
            mode: 'cors',
            cache: 'no-cache',
        });
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
        switch (type) {
            case 'light':
                navigator.vibrate(15);
                break;
            case 'medium':
                navigator.vibrate(35);
                break;
            case 'heavy':
                navigator.vibrate(60);
                break;
            case 'success':
                navigator.vibrate([30, 40, 30]);
                break;
            case 'error':
                navigator.vibrate([40, 50, 40]);
                break;
        }
    } catch {}
}
