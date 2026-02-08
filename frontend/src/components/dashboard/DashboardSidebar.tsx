'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    HomeIcon,
    QueueListIcon,
    HeartIcon,
    PlusCircleIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuthStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Adopter Navigation
    const adopterSections = [
        {
            title: 'My Activities',
            items: [
                { name: 'Overview', href: '/dashboard', icon: HomeIcon },
                { name: 'Manage Listings', href: '/dashboard/listings', icon: QueueListIcon },
                { name: 'Favorites', href: '/dashboard/favorites', icon: HeartIcon },
                { name: 'Settings', href: '/dashboard/settings', icon: UserCircleIcon },
            ]
        },
        {
            title: 'Adoption',
            items: [
                { name: 'Add Adoption Listing', href: '/dashboard/create-listing', icon: PlusCircleIcon },
                { name: 'Become a Breeder', href: '/dashboard/breeder', icon: BriefcaseIcon },
            ]
        }
    ];

    // Breeder Navigation
    const breederSections = [
        {
            title: 'Breeder Dashboard',
            items: [
                { name: 'My Listings', href: '/dashboard/breeder', icon: QueueListIcon },
                { name: 'Post New Litter', href: '/dashboard/breeder/listings/create', icon: PlusCircleIcon },
                { name: 'Settings', href: '/dashboard/settings', icon: UserCircleIcon },
            ]
        }
    ];

    const sections = user?.isBreeder ? breederSections : adopterSections;

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="md:hidden fixed top-20 left-4 z-40">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 bg-white rounded-md shadow-md text-gray-600 hover:text-primary-600"
                >
                    {isMobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                flex flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] top-16
            `}>
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    {sections.map((section, idx) => (
                        <div key={section.title} className={`px-3 ${idx > 0 ? 'mt-8' : ''}`}>
                            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {section.title}
                            </h3>
                            <nav className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                                                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                                ${isActive
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                                            `}
                                        >
                                            <item.icon
                                                className={`
                                                    mr-3 flex-shrink-0 h-5 w-5
                                                    ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                                                `}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <button
                        onClick={() => logout()}
                        className="flex-shrink-0 w-full group block"
                    >
                        <div className="flex items-center">
                            <ArrowLeftOnRectangleIcon className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    Sign Out
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
