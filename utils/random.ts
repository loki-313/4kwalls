import { getRandomWallpapers, getTotalWallpaperCount, Wallpaper } from '@/lib/supabase';

const MAX_VIEWED_IDS = 500;
const SESSION_STORAGE_KEY = 'viewedWallpaperIds';

export function loadViewedIds(): Set<number> {
    if (typeof window === 'undefined') return new Set();
    try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            const parsedIds = JSON.parse(stored);
            const limitedIds = parsedIds.slice(-MAX_VIEWED_IDS);
            return new Set(limitedIds);
        }
    } catch {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    return new Set();
}

export function saveViewedIds(viewedIds: Set<number>): void {
    if (typeof window === 'undefined') return;
    try {
        const idsArray = Array.from(viewedIds).slice(-MAX_VIEWED_IDS);
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(idsArray));
    } catch {}
}

export function clearViewedIds(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function fetchUniqueWallpapers(
    limit: number,
    viewedIds: Set<number>
): Promise<Wallpaper[]> {
    const hintExcludedIds = Array.from(viewedIds).slice(-100);
    return await getRandomWallpapers(limit, hintExcludedIds);
}

export function updateViewedIds(
    currentViewedIds: Set<number>,
    newWallpapers: Wallpaper[]
): Set<number> {
    const newSet = new Set(currentViewedIds);
    for (const w of newWallpapers) {
        newSet.add(w.id);
    }
    const idsArray = Array.from(newSet);
    if (idsArray.length > MAX_VIEWED_IDS) {
        return new Set(idsArray.slice(-MAX_VIEWED_IDS));
    }
    return newSet;
}

export function shouldStopFetching(
    viewedIdsSize: number,
    totalCount: number,
    lastPageLength: number,
    requestedLimit: number
): boolean {
    return (totalCount > 0 && viewedIdsSize >= totalCount * 0.95) || lastPageLength < requestedLimit;
}

export async function fetchTotalWallpaperCount(): Promise<number> {
    return await getTotalWallpaperCount();
}
