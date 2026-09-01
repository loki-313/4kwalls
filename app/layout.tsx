import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import "@fontsource/jetbrains-mono";
import "./globals.css";
import QueryProvider from '@/components/providers/QueryProvider';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  metadataBase: new URL("https://4kwalls.vercel.app"),
  title: "4kwalls - Premium 4K Wallpapers",
  keywords: [
    "4k wallpapers",
    "ultra hd backgrounds",
    "desktop wallpapers",
    "mobile wallpapers",
    "iphone wallpapers",
    "android backgrounds",
    "gaming wallpapers",
    "anime wallpapers",
    "nature wallpapers",
    "abstract art",
    "high resolution images",
    "free 4k wallpapers",
    "wallpaper engine",
    "pc setups",
    "wallpaper",
    "8k wallpapers",
    "1080p backgrounds",
    "minimalist wallpapers",
    "dark mode wallpapers",
    "amoled backgrounds",
    "cool wallpapers",
    "aesthetic backgrounds",
    "lock screen wallpapers",
    "home screen backgrounds",
    "best wallpaper app",
    "wallpaper downloader",
    "cyberpunk wallpapers",
    "neon backgrounds",
    "ultrawide wallpapers",
    "dual monitor backgrounds",
    "space backgrounds",
    "car wallpapers",
    "supercars wallpapers",
    "nature photography",
    "urban photography",
    "black and white wallpapers",
    "retro wallpapers",
    "vaporwave backgrounds",
    "mobile screensaver",
    "ipad wallpapers",
    "tablet backgrounds",
    "samsung wallpaper",
  ],
  description: "Discover and download high-quality 4K wallpapers for desktop and mobile.",
  verification: {
    google: "EavS72vxuMgymo1l9ghbz8dFTldlp83PnZ_zki1jMEA",
    other: {
      "msvalidate.01": "EBB797DAADD0E024846DED1153D2A347",
    },
  },
  openGraph: {
    title: "4kwalls - Premium 4K Wallpapers",
    description: "Discover and download high-quality 4K wallpapers for desktop and mobile.",
    url: "https://4kwalls.vercel.app",
    siteName: "4kwalls",
    images: [
      {
        url: "/logo2.png",
        width: 1200,
        height: 630,
        alt: "4kwalls Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "4kwalls - Premium 4K Wallpapers",
    description: "Discover and download high-quality 4K wallpapers for desktop and mobile.",
    images: ["/logo2.png"],
  },
  icons: {
    icon: '/logo2.png',
    shortcut: '/logo2.png',
    apple: '/logo2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "4kwalls",
              url: "https://4kwalls.vercel.app",
              description: "Premium 4K Wallpapers for Desktop and Mobile",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://4kwalls.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <Sidebar />
          <Toaster richColors position="top-center" toastOptions={{ style: { zIndex: 99999 } }} />
          <SpeedInsights />
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  );
}
