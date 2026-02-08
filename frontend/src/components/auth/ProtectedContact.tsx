'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';

interface ProtectedContactProps {
    children: React.ReactNode;
    label?: string;
    className?: string;
}

export default function ProtectedContact({ children, label = "Login to View Contact Info", className = "" }: ProtectedContactProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleLoginRedirect = () => {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    };

    if (isLoading) {
        return <div className="animate-pulse h-10 bg-gray-100 rounded-lg w-full"></div>;
    }

    if (!isAuthenticated) {
        return (
            <button
                onClick={handleLoginRedirect}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm ${className}`}
            >
                <Lock className="w-4 h-4" />
                {label}
            </button>
        );
    }

    return <>{children}</>;
}
