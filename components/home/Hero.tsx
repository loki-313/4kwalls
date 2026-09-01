"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Github } from "lucide-react";
import { cn, glass, glassButton } from "@/utils/helpers";
import { Roboto } from "next/font/google";

const roboto = Roboto({
    weight: ["400", "500"],
    subsets: ["latin"],
});

export function Hero() {
    return (
        <div className={cn(
            "relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center",
            "overflow-hidden px-4 md:px-8 pt-20 pb-16"
        )}>
            <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={cn(
                        glass(),
                        "px-4 py-1.5 rounded-full flex items-center gap-2",
                        "text-sm font-medium text-cyan-300 border border-cyan-500/20"
                    )}
                >
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Premium 4K Collection</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className={cn(
                        "text-5xl md:text-7xl lg:text-8xl font-black text-white",
                        "tracking-tight leading-[1.1]"
                    )}
                >
                    Minimalism <br className="md:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        Elevated
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className={cn(
                        roboto.className,
                        "text-base md:text-lg text-gray-400 max-w-xl leading-relaxed tracking-wide"
                    )}
                >
                    Elevate your workspace with developer-grade visual perfection.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center gap-4 mt-4"
                >
                    <Link
                        href="/wallpapers"
                        className={cn(
                            glassButton(),
                            "group h-14 px-8 rounded-full text-lg font-bold",
                            "flex items-center gap-3 bg-white/10 hover:bg-white/20 border-white/20"
                        )}
                    >
                        Explore Collection
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="https://github.com/Ace-Bee/4kwalls"
                        target="_blank"
                        className={cn(
                            glassButton(),
                            "bg-transparent border-transparent",
                            "hover:bg-white/10 hover:border-white/10",
                            "h-14 px-8 rounded-full text-lg font-medium",
                            "text-gray-400 hover:text-white flex items-center gap-2"
                        )}
                    >
                        <Github size={20} />
                        GitHub
                    </Link>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute inset-0 z-0 pointer-events-none"
            />
        </div>
    );
}
