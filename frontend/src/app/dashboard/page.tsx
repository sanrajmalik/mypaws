'use client';

import { useEffect, useState } from 'react';
import { getClient } from '@/lib/client-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
    CurrencyRupeeIcon,
    EyeIcon,
    ChatBubbleBottomCenterTextIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    activeListings: number;
    totalListings: number;
    totalViews: number;
    inquiries: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Redirect breeders to their specific dashboard
        if (user?.isBreeder) {
            router.replace('/dashboard/breeder');
            return;
        }

        async function fetchStats() {
            try {
                const client = getClient();
                const { data, error } = await client.get('/v1/dashboard/stats');

                if (!error && data) {
                    setStats(data as DashboardStats);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [user, router]);

    if (loading || user?.isBreeder) {
        return <div>Loading...</div>;
    }

    const statCards = [
        { name: 'Active Listings', value: stats?.activeListings || 0, icon: DocumentTextIcon, color: 'bg-blue-500' },
        { name: 'Total Views', value: stats?.totalViews || 0, icon: EyeIcon, color: 'bg-green-500' },
        { name: 'Inquiries', value: stats?.inquiries || 0, icon: ChatBubbleBottomCenterTextIcon, color: 'bg-yellow-500' },
        { name: 'Total Listings', value: stats?.totalListings || 0, icon: DocumentTextIcon, color: 'bg-purple-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map((item) => (
                    <div
                        key={item.name}
                        className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                        </dt>
                        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <Link
                        href="/dashboard/create-listing"
                        className="flex items-center justify-center px-4 py-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                        Post a New Pet
                    </Link>
                    <Link
                        href="/dashboard/listings"
                        className="flex items-center justify-center px-4 py-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Manage Listings
                    </Link>
                    <Link
                        href="/dashboard/favorites"
                        className="flex items-center justify-center px-4 py-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        View Favorites
                    </Link>
                </div>
            </div>
        </div>
    );
}
