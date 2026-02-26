'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { PawPrint } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

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

    const { googleLogin, isLoading } = useAuthStore();
    const [error, setError] = useState('');
    const [googleLoaded, setGoogleLoaded] = useState(false);

    const handleGoogleCallback = useCallback(async (response: any) => {
        try {
            setError('');
            await googleLogin(response.credential);

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
                            <div>
                                <div
                                    id="google-signin-button"
                                    className="w-full flex justify-center"
                                />
                                {!googleLoaded && (
                                    <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse" />
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-amber-800 text-sm">
                                    <strong>Google Sign-In not configured.</strong><br />
                                    Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> environment variable.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                                {error}
                            </div>
                        )}
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
