import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project')
);

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
);

export interface Wallpaper {
    id: number;
    name: string;
    image_url: string;
    download_count: number;
    fav_count: number;
    width: number;
    height: number;
    file_size: string;
    format: string;
}

export async function getRandomWallpapers(
    limit: number = 12,
    excludeIds: number[] = []
): Promise<Wallpaper[]> {
    if (!isSupabaseConfigured) return [];

    const limitedExcludeIds = excludeIds.slice(-500);
    const { data, error } = await supabase
        .rpc('get_random_wallpapers', {
            batch_size: limit,
            excluded_ids: limitedExcludeIds
        });

    if (error) {
        console.error('Error fetching random wallpapers:', error.message || error);
        return [];
    }

    return (data || []) as Wallpaper[];
}

export async function getTotalWallpaperCount(): Promise<number> {
    if (!isSupabaseConfigured) return 0;

    const { count, error } = await supabase
        .from('wallpapers')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching total wallpaper count:', error.message || error);
        return 0;
    }

    return count || 0;
}

export async function getWallpapersByIds(ids: number[]) {
    if (!isSupabaseConfigured || !ids.length) return [];

    const { data, error } = await supabase
        .from('wallpapers')
        .select('*')
        .in('id', ids)
        .order('id', { ascending: false });

    if (error) {
        console.error('Error fetching favorite wallpapers:', error.message || error);
        return [];
    }

    return data as Wallpaper[];
}

export async function getWallpaperById(id: number): Promise<Wallpaper | null> {
    if (!isSupabaseConfigured) return null;
    const wallpapers = await getWallpapersByIds([id]);
    return wallpapers.length > 0 ? wallpapers[0] : null;
}

export async function getAllWallpaperIds(): Promise<number[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
        .from('wallpapers')
        .select('id')
        .order('id', { ascending: false })
        .limit(50000);

    if (error) {
        console.error('Error fetching wallpaper IDs:', error.message || error);
        return [];
    }

    return data.map(w => w.id);
}

export async function getCategoryWallpapers(
    category: string,
    seed: string,
    offset: number = 0,
    limit: number = 24
): Promise<Wallpaper[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
        .rpc('get_category_wallpapers', {
            category_text: category,
            seed_val: seed,
            page_offset: offset,
            page_limit: limit
        });

    if (error) {
        console.error('Error fetching category wallpapers:', error.message || error);
        return [];
    }

    return (data || []) as Wallpaper[];
}

export async function incrementDownloadCount(wallpaperId: number): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.rpc('increment_download', {
        row_id: wallpaperId,
    });
    if (error) {
        console.error('Failed to increment download count:', error.message);
    }
}

export async function incrementFavoriteCount(wallpaperId: number): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.rpc('increment_fav', {
        row_id: wallpaperId,
    });
    if (error) {
        console.error('Failed to increment fav count:', error.message);
    }
}
