'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Heart, User, PawPrint, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <PawPrint className="h-8 w-8 text-orange-500" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                            mypaws
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Adopt Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center text-gray-600 hover:text-orange-500 transition-colors font-medium">
                                Adopt
                                <ChevronDown className="ml-1 w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pt-2 transform translate-y-[-10px] group-hover:translate-y-0">
                                <div className="py-1">
                                    <Link href="/adopt-a-dog" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                                        Adopt a Dog
                                    </Link>
                                    <Link href="/adopt-a-cat" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                                        Adopt a Cat
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Buy Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center text-gray-600 hover:text-orange-500 transition-colors font-medium">
                                Buy
                                <ChevronDown className="ml-1 w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pt-2 transform translate-y-[-10px] group-hover:translate-y-0">
                                <div className="py-1">
                                    <Link href="/buy-dogs" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                                        Buy a Dog
                                    </Link>
                                    <Link href="/buy-cats" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                                        Buy a Cat
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/about" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                            About Us
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/dashboard/favorites"
                                    className="text-gray-600 hover:text-orange-500 transition-colors"
                                >
                                    <Heart className="h-6 w-6" />
                                </Link>
                                <div className="relative group">
                                    <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <span className="hidden sm:inline font-medium">
                                            {user?.displayName?.split(' ')[0] || 'Account'}
                                        </span>
                                    </button>
                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                        <div className="py-2">
                                            {user?.isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50"
                                                >
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-gray-700 hover:bg-orange-50"
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                href={user?.isBreeder ? "/dashboard/breeder" : "/dashboard/listings"}
                                                className="block px-4 py-2 text-gray-700 hover:bg-orange-50"
                                            >
                                                My Listings
                                            </Link>
                                            <Link
                                                href="/dashboard/settings"
                                                className="block px-4 py-2 text-gray-700 hover:bg-orange-50"
                                            >
                                                Settings
                                            </Link>
                                            <hr className="my-2 border-gray-100" />
                                            <button
                                                onClick={() => logout()}
                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
                        <div className="px-4 py-2">
                            <h4 className="font-semibold text-gray-900 mb-2">Adopt</h4>
                            <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                                <Link href="/adopt-a-dog" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Adopt a Dog</Link>
                                <Link href="/adopt-a-cat" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Adopt a Cat</Link>
                            </div>
                        </div>
                        <div className="px-4 py-2">
                            <h4 className="font-semibold text-gray-900 mb-2">Buy</h4>
                            <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                                <Link href="/buy-dogs" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Buy a Dog</Link>
                                <Link href="/buy-cats" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Buy a Cat</Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
