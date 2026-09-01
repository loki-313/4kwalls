'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, Key } from 'lucide-react';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { notifySuccess } from '@/components/common/Notifications';
import { cn, glass, glassInput } from '@/utils/helpers';
import { LIMITS } from '@/lib/constants';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [otpToken, setOtpToken] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { signInWithOAuth, signInWithEmail, signUpWithEmail, verifyOtp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await signInWithEmail(email, password);
                notifySuccess('Welcome back!');
                onClose();
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (password.length < LIMITS.MIN_PASSWORD_LENGTH) {
                    throw new Error(`Password must be at least ${LIMITS.MIN_PASSWORD_LENGTH} characters`);
                }
                const data = await signUpWithEmail(email, password);
                if (data && !data.session) {
                    setVerificationStep(true);
                    notifySuccess("Confirmation code sent to your email");
                } else {
                    notifySuccess('Account created!');
                    onClose();
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Authentication failed';
            const errorMessage = message === 'Invalid login credentials'
                ? 'Wrong email or password'
                : message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await verifyOtp(email, otpToken);
            notifySuccess("Email verified successfully!");
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Invalid code";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'github') => {
        try {
            await signInWithOAuth(provider);
        } catch (err) {
            console.error(err);
            setError((err as Error).message || 'OAuth authentication failed');
        }
    };

    React.useEffect(() => {
        if (!isOpen) {
            setVerificationStep(false);
            setOtpToken('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError(null);
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
                        className="absolute inset-0 bg-black/80"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className={cn(
                            glass(),
                            "w-full max-w-md p-6 md:p-8 rounded-2xl shadow-2xl relative",
                            "overflow-y-auto max-h-[90vh] transform-gpu z-10"
                        )}
                    >
                        <button
                            onClick={onClose}
                            className={cn(
                                "absolute top-3 right-3 md:top-4 md:right-4",
                                "w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full",
                                "text-gray-400 hover:text-white active:bg-white/10 transition-colors"
                            )}
                        >
                            <X size={22} className="md:hidden" />
                            <X size={20} className="hidden md:block" />
                        </button>

                        <div className="text-center mb-6 md:mb-8 mt-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {verificationStep ? 'Enter Code' : (isLogin ? 'Welcome Back' : 'Create Account')}
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base">
                                {verificationStep
                                    ? `We sent a code to ${email}`
                                    : (isLogin ? 'Enter your details to sign in' : 'Sign up to get started')}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm mb-6">
                                {error}
                            </div>
                        )}

                        {verificationStep ? (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">Verification Code</label>
                                    <div className="relative group">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={otpToken}
                                            onChange={(e) => setOtpToken(e.target.value)}
                                            className={cn(
                                                "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4",
                                                "text-white placeholder:text-gray-500 focus:outline-none",
                                                "focus:border-white/30 focus:bg-white/10 transition-all",
                                                "tracking-widest text-center font-mono text-lg"
                                            )}
                                            placeholder="123456"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full bg-white text-black font-bold py-3.5 rounded-xl",
                                        "hover:bg-gray-200 transition-all duration-300",
                                        "flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setVerificationStep(false)}
                                    className="w-full text-gray-400 hover:text-white text-sm py-2"
                                >
                                    Back to Sign Up
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={glassInput()}
                                            placeholder="hello@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={glassInput()}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            <label className="text-sm text-gray-400 ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    className={cn(
                                                        "w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4",
                                                        "text-white placeholder:text-gray-500 focus:outline-none",
                                                        "focus:border-white/30 focus:bg-white/10 transition-all"
                                                    )}
                                                    placeholder="••••••••"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full bg-white text-black font-bold py-3.5 rounded-xl",
                                        "hover:bg-gray-200 transition-all duration-300",
                                        "flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                                </button>
                            </form>
                        )}

                        {!verificationStep && (
                            <>
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-black/40 text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleOAuth('google')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-3 md:py-2.5 rounded-xl",
                                            "bg-white/5 border border-white/10 text-white",
                                            "hover:bg-white/10 active:bg-white/20 hover:border-white/20 transition-all duration-300"
                                        )}
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleOAuth('github')}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-3 md:py-2.5 rounded-xl",
                                            "bg-white/5 border border-white/10 text-white",
                                            "hover:bg-white/10 active:bg-white/20 hover:border-white/20 transition-all duration-300"
                                        )}
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        GitHub
                                    </button>
                                </div>

                                <div className="mt-6 text-center">
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError(null);
                                        }}
                                        className="text-gray-400 hover:text-white text-sm transition-colors"
                                    >
                                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
