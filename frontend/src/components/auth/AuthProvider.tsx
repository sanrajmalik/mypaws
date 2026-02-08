'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

// Export useAuth hook alias for deprecated imports (compatibility)
export const useAuth = useAuthStore;

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { checkAuth, isLoading, isInitialized } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Show nothing while checking auth status on first load
    if (!isInitialized && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 text-sm">Loading mypaws...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
