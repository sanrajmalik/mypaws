'use client';

import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Squares2X2Icon,
    UserGroupIcon,
    ShieldCheckIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
            router.push('/login'); // Or a dedicated admin login
        }
    }, [isAuthenticated, user, isLoading, router]);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    if (!isAuthenticated || !user?.isAdmin) return null;

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: Squares2X2Icon },
        { name: 'Breeder Queue', href: '/admin/breeders', icon: UserGroupIcon },
        { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
        // { name: 'Listings', href: '/admin/listings', icon: DocumentTextIcon }, // Future
        // { name: 'Reports', href: '/admin/reports', icon: FlagIcon }, // Future
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`bg-gray-900 text-white ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    {isSidebarOpen && <span className="text-xl font-bold text-primary-400">Admin Panel</span>}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-gray-800">
                        {isSidebarOpen ? '←' : '→'}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-2 px-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center p-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="h-6 w-6" />
                                        {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => logout()}
                        className="flex items-center w-full p-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                        {isSidebarOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {navItems.find(i => i.href === pathname)?.name || 'Admin'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{user?.email}</span>
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                            {user?.displayName?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
