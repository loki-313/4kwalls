'use client';

import { toast } from 'sonner';
import { LogIn, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn, glass } from '@/utils/helpers';

const glassToastClass = cn(
    glass(),
    "flex items-start gap-4 p-4 rounded-xl",
    "border border-white/20 shadow-2xl backdrop-blur-xl w-full max-w-sm"
);

export const areNotificationsEnabled = () => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('notifications_enabled');
    return saved === null ? true : saved === 'true';
};

export function notifyLoginRequired(action: string, onLogin: () => void) {
    toast.custom((t) => (
        <div className={glassToastClass}>
            <div className="p-2 bg-white/10 rounded-full shrink-0">
                <LogIn className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-white text-base mb-1">Login Required</h3>
                <p className="text-white/70 text-sm mb-3">
                    You need to sign in to {action} wallpapers.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t);
                            onLogin();
                        }}
                        className="flex-1 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    ), { duration: 5000 });
}

export function notifySuccess(message: string) {
    if (!areNotificationsEnabled()) return;
    toast.custom((t) => (
        <div className={cn(
            glass(),
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "border border-white/10 shadow-lg backdrop-blur-md min-w-[300px]"
        )}>
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <span className="text-sm font-medium text-white">{message}</span>
            <button
                onClick={() => toast.dismiss(t)}
                className="ml-auto text-white/40 hover:text-white transition-colors"
            >
                ✕
            </button>
        </div>
    ));
}

export function notifyError(message: string) {
    if (!areNotificationsEnabled()) return;
    toast.custom((t) => (
        <div className={cn(
            glass(),
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "border border-white/10 shadow-lg backdrop-blur-md min-w-[300px]"
        )}>
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-sm font-medium text-white">{message}</span>
            <button
                onClick={() => toast.dismiss(t)}
                className="ml-auto text-white/40 hover:text-white transition-colors"
            >
                ✕
            </button>
        </div>
    ));
}

export function notifyInfo(message: string) {
    if (!areNotificationsEnabled()) return;
    toast.custom((t) => (
        <div className={cn(
            glass(),
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "border border-white/10 shadow-lg backdrop-blur-md min-w-[300px]"
        )}>
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="text-sm font-medium text-white">{message}</span>
            <button
                onClick={() => toast.dismiss(t)}
                className="ml-auto text-white/40 hover:text-white transition-colors"
            >
                ✕
            </button>
        </div>
    ));
}
