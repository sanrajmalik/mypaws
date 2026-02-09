'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { PawPrint, Mail, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// Google Client ID - TODO: Move to environment variable
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement | null, config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const { mockLogin, googleLogin, isLoading } = useAuthStore();
    const [email, setEmail] = useState('test@example.com');
    const [name, setName] = useState('Test User');
    const [error, setError] = useState('');
    const [googleLoaded, setGoogleLoaded] = useState(false);

    const handleGoogleCallback = useCallback(async (response: any) => {
        try {
            setError('');
            await googleLogin(response.credential);

            // Check current user from store to determine redirect
            // We need to wait a tick or re-fetch current user if store update is async/laggy
            // But authStore usually sets user immediately.
            const user = useAuthStore.getState().user;

            if (user?.isAdmin) {
                router.push('/admin');
            } else {
                router.push(redirect);
            }
        } catch (err: any) {
            console.error('Google login error:', err);
            if (err.message === 'account_suspended') {
                router.push('/suspended');
                return;
            }
            setError('Google login failed. Please try again.');
        }
    }, [googleLogin, redirect, router]);

    // Check if Google script is already loaded (navigating back to login)
    useEffect(() => {
        if (window.google?.accounts) {
            setGoogleLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (googleLoaded && GOOGLE_CLIENT_ID && window.google) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
            });

            const buttonDiv = document.getElementById('google-signin-button');
            if (buttonDiv) {
                window.google.accounts.id.renderButton(buttonDiv, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'continue_with',
                    shape: 'rectangular',
                });
            }
        }
    }, [googleLoaded, handleGoogleCallback]);

    const handleMockLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await mockLogin(email, name);
            const user = useAuthStore.getState().user;

            if (user?.isAdmin) {
                router.push('/admin');
            } else {
                router.push(redirect);
            }
        } catch (err: any) {
            if (err.message === 'account_suspended') {
                router.push('/suspended');
                return;
            }
            setError('Login failed. Please try again.');
        }
    };

    return (
        <>
            {/* Load Google Identity Services */}
            <Script
                src="https://accounts.google.com/gsi/client"
                onLoad={() => setGoogleLoaded(true)}
                strategy="lazyOnload"
            />

            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <PawPrint className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome to mypaws</h1>
                        <p className="text-gray-600 mt-2">Sign in to find your perfect pet</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        {/* Google Sign-In Button */}
                        {GOOGLE_CLIENT_ID ? (
                            <div className="mb-6">
                                <div
                                    id="google-signin-button"
                                    className="w-full flex justify-center"
                                />
                                {!googleLoaded && (
                                    <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse" />
                                )}
                            </div>
                        ) : (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-amber-800 text-sm">
                                    <strong>Google Sign-In not configured.</strong><br />
                                    Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> environment variable.
                                </p>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or use mock login</span>
                            </div>
                        </div>

                        {/* Mock Login Form */}
                        <form onSubmit={handleMockLogin} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in (Mock)'}
                            </button>
                        </form>

                        {/* Note */}
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Mock login is for development only. Use Google login in production.
                        </p>
                    </div>

                    {/* Terms */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        By signing in, you agree to our{' '}
                        <a href="/terms" className="text-orange-600 hover:underline">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-orange-600 hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
