'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, api } from '@/lib/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    login: (user: User) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    mockLogin: (email: string, name: string) => Promise<void>;
    googleLogin: (idToken: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            isInitialized: false,

            login: (user) => {
                set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
            },

            logout: async () => {
                try {
                    await api.logout();
                } catch (e) {
                    // Ignore logout errors
                }
                set({ user: null, isAuthenticated: false, isLoading: false });
            },

            checkAuth: async () => {
                if (get().isInitialized && !get().isAuthenticated) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    set({ isLoading: true });
                    const user = await api.getCurrentUser();
                    set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
                } catch (e) {
                    set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
                }
            },

            refreshUser: async () => {
                try {
                    // Silent refresh: no loading state change
                    const user = await api.getCurrentUser();
                    set({ user, isAuthenticated: true, isInitialized: true });
                } catch (e) {
                    // If refresh fails, keep existing state or handle error?
                    // For now, if it fails, we might be logged out, but let's not force logout on silent refresh 
                    // unless we are sure. api.getCurrentUser throws if 401.
                    console.error("Silent refresh failed", e);
                }
            },

            mockLogin: async (email: string, name: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.mockLogin(email, name);

                    if (response.user.status === 'suspended' || response.user.status === 'banned') {
                        await api.logout();
                        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
                        throw new Error('account_suspended');
                    }

                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                        isInitialized: true
                    });
                } catch (e) {
                    set({ isLoading: false });
                    throw e;
                }
            },

            googleLogin: async (idToken: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.googleLogin(idToken);

                    if (response.user.status === 'suspended' || response.user.status === 'banned') {
                        await api.logout();
                        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
                        throw new Error('account_suspended');
                    }

                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                        isInitialized: true
                    });
                } catch (e) {
                    set({ isLoading: false });
                    throw e;
                }
            },
        }),
        {
            name: 'mypaws-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
