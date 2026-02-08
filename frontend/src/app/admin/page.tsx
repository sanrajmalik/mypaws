'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    ClockIcon,
    UserGroupIcon,
    CurrencyRupeeIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface AdminStats {
    PendingApplications: number;
    TotalUsers: number;
    Revenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data: any = await api.getAdminStats();
                setStats({
                    PendingApplications: data.pendingApplications || 0,
                    TotalUsers: data.totalUsers || 0,
                    Revenue: data.revenue || 0
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { name: 'Pending Approvals', value: stats?.PendingApplications ?? '-', icon: ClockIcon, color: 'bg-yellow-500', href: '/admin/breeders' },
        { name: 'Total Users', value: stats?.TotalUsers ?? '-', icon: UserGroupIcon, color: 'bg-blue-500', href: '/admin/users' },
        { name: 'Active Breeders', value: '12', icon: CheckBadgeIcon, color: 'bg-green-500', href: '/admin/breeders/verified' },
        { name: 'Revenue', value: '₹0', icon: CurrencyRupeeIcon, color: 'bg-purple-500', href: '/admin/revenue' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Link key={card.name} href={card.href} className="block group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.name}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${card.color} bg-opacity-10 text-${card.color.replace('bg-', '')}`}>
                                    <card.icon className={`h-8 w-8 text-${card.color.replace('bg-', '')}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <span className="text-green-500 font-medium flex items-center">
                                    ↑ 12%
                                </span>
                                <span className="ml-2">vs last month</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">U</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">New User Registration</p>
                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Database connection</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">API Latency</span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">45ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
