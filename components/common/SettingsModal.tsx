'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, User, Lock, LogOut, Loader2, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { notifySuccess, notifyError } from '@/components/common/Notifications';
import { cn, glass, glassInput } from '@/utils/helpers';
import Image from 'next/image';
import { deleteAccount, deleteAllFavorites } from '@/utils/auth-actions';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { LIMITS } from '@/lib/constants';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'profile' | 'security' | 'danger';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user, signOut, updateProfile, updatePassword, signInWithEmail } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteFavoritesConfirm, setShowDeleteFavoritesConfirm] = useState(false);

    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    if (!user) return null;

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile({ full_name: displayName });
            notifySuccess('Profile updated successfully');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            notifyError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            notifyError('New passwords do not match');
            return;
        }
        if (newPassword.length < LIMITS.MIN_PASSWORD_LENGTH) {
            notifyError(`Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters`);
            return;
        }

        setIsLoading(true);
        try {
            if (user.email) {
                await signInWithEmail(user.email, oldPassword);
            } else {
                throw new Error("User email not found");
            }
            await updatePassword(newPassword);
            notifySuccess('Password updated successfully');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update password. Check old password.';
            notifyError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={cn(
                            glass(),
                            "relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden",
                            "flex flex-col md:flex-row",
                            "max-h-[90vh] md:h-[500px]",
                            "bg-black/90 md:bg-black/40 z-10"
                        )}
                    >
                        <button
                            onClick={onClose}
                            className={cn(
                                "md:hidden absolute top-3 right-3 z-20",
                                "w-10 h-10 flex items-center justify-center rounded-full",
                                "text-gray-400 hover:text-white active:bg-white/10 transition-colors"
                            )}
                        >
                            <X size={22} />
                        </button>

                        <div className={cn(
                            "w-full md:w-64 bg-black/20",
                            "border-b md:border-b-0 md:border-r border-white/10",
                            "p-4 md:p-6 flex flex-col gap-2",
                            "overflow-x-auto md:overflow-visible"
                        )}>
                            <div className="hidden md:flex mb-6 flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 mb-3 relative">
                                    {user.user_metadata?.avatar_url ? (
                                        <Image
                                            src={user.user_metadata.avatar_url}
                                            alt="Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                            <User size={32} className="text-white/50" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-white truncate w-full">
                                    {user.user_metadata?.display_name || user.user_metadata?.full_name || 'User'}
                                </h3>
                                <p className="text-xs text-gray-400 truncate w-full">{user.email}</p>
                            </div>

                            <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0">
                                <TabButton
                                    icon={<User size={18} />}
                                    label="Profile"
                                    isActive={activeTab === 'profile'}
                                    onClick={() => setActiveTab('profile')}
                                />

                                {user?.app_metadata?.provider === 'email' && (
                                    <TabButton
                                        icon={<Lock size={18} />}
                                        label="Security"
                                        isActive={activeTab === 'security'}
                                        onClick={() => setActiveTab('security')}
                                    />
                                )}
                            </div>

                            <div className="hidden md:block mt-auto">
                                <button
                                    onClick={() => setActiveTab('danger')}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                                        "text-sm font-medium transition-all text-left mb-2",
                                        activeTab === 'danger'
                                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                            : "text-red-400/80 hover:text-red-400 hover:bg-red-500/5"
                                    )}
                                >
                                    <AlertTriangle size={18} />
                                    Danger Zone
                                </button>
                            </div>

                            <button
                                onClick={() => setActiveTab('danger')}
                                className={cn(
                                    "md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl",
                                    "text-sm font-medium transition-all whitespace-nowrap",
                                    activeTab === 'danger'
                                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                        : "text-red-400/80 active:bg-red-500/10"
                                )}
                            >
                                <AlertTriangle size={18} />
                            </button>
                        </div>

                        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                            <button
                                onClick={onClose}
                                className="hidden md:block absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6">
                                {activeTab === 'profile' ? 'Profile Settings' :
                                    activeTab === 'security' ? 'Security Settings' :
                                        'Danger Zone'}
                            </h2>

                            {activeTab === 'profile' && (
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-sm">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Display Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className={glassInput()}
                                                placeholder="Your Name"
                                                maxLength={LIMITS.MAX_DISPLAY_NAME_LENGTH}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={cn(
                                            "px-6 py-2 bg-cyan-400 text-black font-semibold rounded-lg",
                                            "hover:bg-cyan-300 transition-colors disabled:opacity-50",
                                            "flex items-center gap-2"
                                        )}
                                    >
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-sm">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Current Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                            <input
                                                type="password"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className={glassInput()}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="border-t border-white/10 pt-4 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className={glassInput()}
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={LIMITS.MIN_PASSWORD_LENGTH}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Confirm New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                                <input
                                                    type="password"
                                                    value={confirmNewPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    className={glassInput()}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={cn(
                                            "px-6 py-2 bg-red-500 text-white font-semibold rounded-lg",
                                            "hover:bg-red-600 transition-colors disabled:opacity-50",
                                            "flex items-center gap-2 shadow-lg shadow-red-500/20"
                                        )}
                                    >
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Update Password
                                    </button>
                                </form>
                            )}

                            {activeTab === 'danger' && (
                                <div className="space-y-6 max-w-sm">
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                            <div>
                                                <h3 className="text-red-500 font-semibold mb-1">Danger Zone</h3>
                                                <p className="text-red-400/80 text-sm">
                                                    Manage destructive actions for your account.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={() => {
                                                signOut();
                                                onClose();
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                                                "bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                                            )}
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>

                                        <button
                                            onClick={() => setShowDeleteFavoritesConfirm(true)}
                                            disabled={isLoading}
                                            className={cn(
                                                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                                                "bg-red-500 hover:bg-red-600 text-white font-semibold",
                                                "transition-colors shadow-lg shadow-red-500/20"
                                            )}
                                        >
                                            <Trash2 size={18} />
                                            Delete All Favorites
                                        </button>

                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-gray-400 text-sm mb-3">
                                                Permanently delete your account and all data.
                                            </p>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className={cn(
                                                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                                                    "bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium",
                                                    "transition-colors border border-red-500/20"
                                                )}
                                            >
                                                <AlertTriangle size={18} />
                                                Delete My Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <DeleteConfirmationModal
                        isOpen={showDeleteConfirm}
                        onClose={() => setShowDeleteConfirm(false)}
                        requiresPassword={user.app_metadata.provider === 'email'}
                        onConfirm={async (password) => {
                            try {
                                if (user.app_metadata.provider === 'email') {
                                    await signInWithEmail(user.email!, password!);
                                }

                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session?.access_token) {
                                    throw new Error('No active session found');
                                }

                                const result = await deleteAccount(session.access_token);

                                if (result.success) {
                                    await signOut();
                                    window.location.href = '/';
                                    notifySuccess('Account deleted successfully');
                                } else {
                                    notifyError(result.error || 'Failed to delete account');
                                    throw new Error(result.error || 'Failed');
                                }
                            } catch (error: unknown) {
                                const message = error instanceof Error ? error.message : 'Verification failed';
                                notifyError(message);
                                throw error;
                            }
                        }}
                    />

                    <DeleteFavoritesModal
                        isOpen={showDeleteFavoritesConfirm}
                        onClose={() => setShowDeleteFavoritesConfirm(false)}
                        onConfirm={async () => {
                            try {
                                if (user) {
                                    queryClient.setQueryData(['favorites', user.id], []);
                                }

                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session?.access_token) throw new Error('No session');

                                const result = await deleteAllFavorites(session.access_token);
                                if (result.success) {
                                    notifySuccess('All favorites deleted');
                                    setShowDeleteFavoritesConfirm(false);
                                    if (user) {
                                        queryClient.invalidateQueries({ queryKey: ['favorites', user.id] });
                                    }
                                } else {
                                    notifyError('Failed to delete favorites');
                                    if (user) {
                                        queryClient.invalidateQueries({ queryKey: ['favorites', user.id] });
                                    }
                                }
                            } catch {
                                notifyError('Error deleting favorites');
                                if (user) {
                                    queryClient.invalidateQueries({ queryKey: ['favorites', user.id] });
                                }
                            }
                        }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl",
                "text-sm font-medium transition-all text-left whitespace-nowrap",
                isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
            )}
        >
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, requiresPassword }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password?: string) => Promise<void>;
    requiresPassword?: boolean;
}) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setIsLoading(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, y: 10, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 10, opacity: 0 }}
                        className={cn(
                            glass(),
                            "relative w-full max-w-sm p-6 rounded-2xl",
                            "border border-red-500/30 shadow-2xl",
                            "flex flex-col items-center text-center space-y-6 z-10"
                        )}
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
                            <p className="text-gray-300 text-sm">
                                Are you sure you want to do this? You will not be able to recover your data and favorites if you click delete.
                            </p>
                        </div>

                        {requiresPassword && (
                            <div className="w-full space-y-2 text-left">
                                <label className="text-sm text-gray-400 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={glassInput()}
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 py-3 rounded-xl",
                                    "bg-red-500 hover:bg-red-600 text-white font-bold",
                                    "shadow-lg shadow-red-500/20 transition-colors",
                                    "flex items-center justify-center gap-2 disabled:opacity-50"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (requiresPassword && !password) {
                                        notifyError('Password is required');
                                        return;
                                    }
                                    setIsLoading(true);
                                    try {
                                        await onConfirm(password);
                                    } catch {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 py-3 rounded-xl",
                                    "bg-white/5 hover:bg-white/10 text-white font-medium",
                                    "transition-colors disabled:opacity-50",
                                    "flex items-center justify-center gap-2"
                                )}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function DeleteFavoritesModal({ isOpen, onClose, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, y: 10, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 10, opacity: 0 }}
                        className={cn(
                            glass(),
                            "relative w-full max-w-sm p-6 rounded-2xl",
                            "border border-red-500/30 shadow-2xl",
                            "flex flex-col items-center text-center space-y-6 z-10"
                        )}
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Trash2 size={32} className="text-red-500" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete All Favorites</h3>
                            <p className="text-gray-300 text-sm">
                                Are you sure? This will remove all your loved wallpapers. This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 py-3 rounded-xl",
                                    "bg-white/5 hover:bg-white/10 text-white font-medium",
                                    "transition-colors disabled:opacity-50"
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        await onConfirm();
                                    } catch {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 py-3 rounded-xl",
                                    "bg-red-500 hover:bg-red-600 text-white font-bold",
                                    "shadow-lg shadow-red-500/20 transition-colors",
                                    "flex items-center justify-center gap-2 disabled:opacity-50"
                                )}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
