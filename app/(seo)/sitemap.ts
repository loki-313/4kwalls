import { MetadataRoute } from 'next';
import { getAllWallpaperIds } from '@/lib/supabase';
import { getSiteUrl } from '@/utils/helpers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/wallpapers`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
    ];

    const wallpaperIds = await getAllWallpaperIds();

    const dynamicRoutes: MetadataRoute.Sitemap = wallpaperIds.map((id) => ({
        url: `${baseUrl}/wallpapers/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticRoutes, ...dynamicRoutes];
}
