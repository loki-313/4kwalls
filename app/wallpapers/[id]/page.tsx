import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getWallpaperById, Wallpaper } from '@/lib/supabase';
import { getModalImageUrl, cn, getSiteUrl } from '@/utils/helpers';
import { DownloadButton } from '@/components/wallpapers/DownloadButton';
import { WallpaperInfo } from '@/components/wallpapers/WallpaperInfo';
import { ShareButton } from '@/components/wallpapers/ShareButton';
import { Header } from '@/components/common/Header';
import { FavoriteButton } from '@/components/wallpapers/FavoriteButton';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const id = (await params).id;
    const wallpaper = await getWallpaperById(Number(id));

    if (!wallpaper) {
        return {
            title: 'Wallpaper Not Found - 4K Walls',
        };
    }

    const title = `${wallpaper.name} in 4K - 4kwalls`;
    const description = `Download ${wallpaper.name} wallpaper in ${wallpaper.width}x${wallpaper.height} 4K resolution. Premium ${wallpaper.format} wallpaper for desktop, iPhone, and Android.`;
    const url = `${getSiteUrl()}/wallpapers/${wallpaper.id}`;
    const images = [
        {
            url: getModalImageUrl(wallpaper.image_url),
            width: 1200,
            height: 630,
            alt: wallpaper.name,
        },
    ];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: '4kwalls',
            images,
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [images[0].url],
        },
        alternates: {
            canonical: url,
        },
    };
}

export default async function WallpaperPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const wallpaper = await getWallpaperById(Number(id));

    if (!wallpaper) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white font-sans relative flex flex-col">
            <Header />

            <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-0 md:p-8 animate-in fade-in duration-500">
                <div className="relative w-full max-w-6xl aspect-[2/3] md:aspect-video bg-black/50 md:rounded-2xl overflow-hidden md:shadow-2xl md:border md:border-white/10">
                    <Image
                        src={getModalImageUrl(wallpaper.image_url)}
                        alt={wallpaper.name}
                        fill
                        className="object-contain"
                        priority
                        quality={85}
                        unoptimized
                    />

                    <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    <div className="hidden md:flex absolute bottom-0 left-0 right-0 p-8 flex-row items-center justify-between gap-4 pointer-events-auto">
                        <ControlsContent wallpaper={wallpaper} />
                    </div>
                </div>

                <div className="md:hidden w-full px-5 py-6 flex flex-col gap-6 bg-black z-10">
                    <ControlsContent wallpaper={wallpaper} isMobile />
                </div>

                <div className="w-full max-w-6xl px-4 md:px-0 pb-8 md:pb-0 md:mt-8">
                    <WallpaperInfo wallpaper={wallpaper} isVisible={true} position="static" />
                </div>
            </div>
        </main>
    );
}

function ControlsContent({ wallpaper, isMobile }: { wallpaper: Wallpaper, isMobile?: boolean }) {
    return (
        <>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {wallpaper.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className='uppercase'>{wallpaper.format}</span>
                    <span>•</span>
                    <span>{wallpaper.width} x {wallpaper.height}</span>
                </div>
            </div>

            <div className={cn("flex items-center gap-3", isMobile ? "justify-between w-full mt-2" : "")}>
                <div className="flex items-center gap-3">
                    <FavoriteButton wallpaper={wallpaper} />

                    <ShareButton
                        url={`${getSiteUrl()}/wallpapers/${wallpaper.id}`}
                        title={`Check out ${wallpaper.name} on 4K Walls!`}
                        imageUrl={getModalImageUrl(wallpaper.image_url)}
                        imageAlt={wallpaper.name}
                    />
                </div>

                <DownloadButton
                    wallpaperId={wallpaper.id}
                    imageUrl={wallpaper.image_url}
                    filename={`${wallpaper.name}.${wallpaper.format.toLowerCase()}`}
                    variant="glass"
                    label="Download 4K"
                    className={isMobile ? "flex-1 justify-center ml-2" : ""}
                />
            </div>
        </>
    );
}
