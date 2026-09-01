'use client';

import { useState } from 'react';
import { Home, Image as ImageIcon, Maximize } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { cn, glassActive, glassNavbar, glassIcon } from '@/utils/helpers';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AuthModal } from './AuthModal';

export function Header() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                    "sticky top-0 w-full max-w-[1800px] mx-auto z-40",
                    "flex flex-row items-center justify-between",
                    "py-3 px-3 md:py-6 md:px-12",
                    "pointer-events-none transition-all duration-300"
                )}
            >
                <div className="flex items-center gap-1.5 md:gap-2 pointer-events-auto">
                    <Link href="/" className="flex items-center gap-1.5 md:gap-2 hover:opacity-80 transition-opacity">
                        <div className="relative w-8 h-8 md:w-10 md:h-10">
                            <Image
                                src="/logo2.png"
                                alt="4K Walls Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="text-cyan-400 font-bold text-lg md:text-2xl flex items-center gap-1">
                            <span className="tracking-tighter">4K <span className="text-white">Walls</span></span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
                    <nav className={cn(
                        glassNavbar(),
                        "hidden md:flex relative items-center p-0.5 md:p-1 rounded-full"
                    )}>
                        <Link
                            href="/"
                            className={cn(
                                "flex items-center justify-center gap-2 px-3 md:px-6 py-1.5 md:py-2",
                                "rounded-full text-sm font-medium transition-all duration-300",
                                pathname === '/'
                                    ? glassActive()
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Home size={16} />
                            <span className="hidden md:inline">Home</span>
                        </Link>
                        <Link
                            href="/wallpapers"
                            className={cn(
                                "flex items-center justify-center gap-2 px-3 md:px-6 py-1.5 md:py-2",
                                "rounded-full text-sm font-medium transition-all duration-300",
                                pathname === '/wallpapers'
                                    ? glassActive()
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <ImageIcon size={16} />
                            <span className="hidden md:inline">Wallpapers</span>
                        </Link>
                    </nav>

                    <Link href="/immersive" title="Immersive Mode" className="md:hidden">
                        <div className={cn(
                            glassIcon(),
                            "w-8 h-8 flex items-center justify-center rounded-full",
                            "text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        )}>
                            <Maximize size={18} />
                        </div>
                    </Link>

                    {loading ? (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 animate-pulse" />
                    ) : user ? (
                        <div className="relative z-50">
                            <div className={cn(
                                "w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/20",
                                "flex items-center justify-center bg-white/10 backdrop-blur-md"
                            )}>
                                {user.user_metadata?.avatar_url ? (
                                    <Image
                                        src={user.user_metadata.avatar_url}
                                        alt="User Avatar"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <Image
                                        src="https://github.com/shadcn.png"
                                        alt="User Avatar"
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        unoptimized
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className={cn(
                                "px-4 md:px-6 py-1.5 md:py-2 rounded-full",
                                "bg-white text-black text-xs md:text-sm font-semibold",
                                "hover:bg-gray-200 active:bg-gray-300 transition-colors shadow-lg"
                            )}
                        >
                            Login
                        </button>
                    )}
                </div>
            </motion.header>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
