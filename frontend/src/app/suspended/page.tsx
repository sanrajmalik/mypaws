'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { AlertTriangle, LogOut, Mail } from 'lucide-react';

export default function SuspendedPage() {
    const { logout } = useAuthStore();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
            // Force redirect anyway
            window.location.href = '/login';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
                <div className="bg-red-50 p-6 flex flex-col items-center border-b border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Account Suspended</h1>
                </div>

                <div className="p-8 space-y-6">
                    <div className="text-center text-gray-600">
                        <p className="mb-4">
                            Your account has been suspended due to a violation of our Terms of Service or Community Guidelines.
                        </p>
                        <p className="text-sm">
                            If you believe this is a mistake, please contact our support team.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 border border-gray-200">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <a href="mailto:support@mypaws.in" className="text-indigo-600 font-medium hover:underline">
                            support@mypaws.in
                        </a>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            {loggingOut ? 'Signing out...' : 'Sign out and return to Home'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <Link href="/terms" className="hover:text-gray-900 underline">Terms of Service</Link>
                <span className="mx-2">•</span>
                <Link href="/privacy" className="hover:text-gray-900 underline">Privacy Policy</Link>
            </div>
        </div>
    );
}
