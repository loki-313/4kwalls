import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: async () => {
            if (!isSupabaseConfigured) return null;
            const { data: { session } } = await supabase.auth.getSession();
            return session?.user ?? null;
        },
        staleTime: Infinity,
    });

    const signInWithOAuth = async (provider: 'google' | 'github') => {
        if (!isSupabaseConfigured) return;
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('login_success', 'true');
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent select_account',
                },
            },
        });
        if (error) console.error('Login failed:', error);
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUpWithEmail = async (email: string, password: string) => {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const verifyOtp = async (email: string, token: string) => {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup',
        });

        if (error) throw error;

        if (data.session) {
            queryClient.setQueryData(['auth', 'user'], data.user);
        }
        return data;
    };

    const signOut = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        queryClient.setQueryData(['auth', 'user'], null);
        queryClient.setQueryData(['favorites'], []);
    };

    const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
        if (!isSupabaseConfigured) return;
        const { data: { user }, error } = await supabase.auth.updateUser({ data });

        if (error) throw error;

        if (user) {
            queryClient.setQueryData(['auth', 'user'], user);
            await supabase.auth.refreshSession();
        }

        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    };

    const updatePassword = async (password: string) => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    };

    return {
        user,
        loading: isLoading,
        signInWithOAuth,
        signInWithEmail,
        signUpWithEmail,
        verifyOtp,
        signOut,
        updateProfile,
        updatePassword,
        isAuthenticated: !!user,
    };
}
