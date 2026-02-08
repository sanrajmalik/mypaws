'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getClient } from '@/lib/client-api';
import {
    PencilSquareIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

interface Listing {
    id: string;
    slug: string;
    title: string;
    status: string;
    pet: {
        name: string;
        petType: string;
        breed: string | null;
        city: string;
        primaryImage: string | null;
    };
    viewCount: number;
    inquiryCount: number;
    createdAt: string;
}

export default function MyListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        async function fetchListings() {
            setLoading(true);
            try {
                const client = getClient();
                // We fetch all and filter client-side for now, or update API to support multiple statuses
                // The API supports ?status=... but let's just fetch all and filter in UI for better UX if list is small
                // Or we can use the API. Let's use the API query param if it's 'active' or 'draft'.
                // But 'inactive' might mean draft, pending, rejected.

                let query = '/v1/adoption-listings/my-listings';
                // If specific status needed, we could append ?status=...
                // For now, let's fetch all (default) and filter in UI to handle "Inactive" group

                const { data } = await client.get<any>(query);
                if (data?.data) {
                    setListings(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch listings', err);
            } finally {
                setLoading(false);
            }
        }

        fetchListings();
    }, []); // Run once on mount

    const filteredListings = listings.filter(l => {
        if (filter === 'all') return true;
        if (filter === 'active') return l.status.toLowerCase() === 'active';
        if (filter === 'inactive') return l.status.toLowerCase() !== 'active';
        return true;
    });

    const getStatusBadge = (statusStr: string) => {
        const status = statusStr.toLowerCase();
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-3 h-3 mr-1" /> Active
                    </span>
                );
            case 'pending_review':
            case 'pendingreview':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="w-3 h-3 mr-1" /> Pending Review
                    </span>
                );
            case 'pendingpayment':
            case 'pending_payment':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <ClockIcon className="w-3 h-3 mr-1" /> Pending Payment
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <PencilSquareIcon className="w-3 h-3 mr-1" /> Draft
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="w-3 h-3 mr-1" /> {statusStr}
                    </span>
                );
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading listings...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                <Link
                    href="/dashboard/create-listing"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                    Create New Listing
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <div className="sm:hidden">
                    <select
                        id="tabs"
                        name="tabs"
                        className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Listings</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="hidden sm:block">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button
                            onClick={() => setFilter('all')}
                            className={`${filter === 'all'
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-500 hover:text-gray-700'
                                } px-3 py-2 font-medium text-sm rounded-md`}
                        >
                            All Listings
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`${filter === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-500 hover:text-gray-700'
                                } px-3 py-2 font-medium text-sm rounded-md`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilter('inactive')}
                            className={`${filter === 'inactive'
                                ? 'bg-gray-100 text-gray-700'
                                : 'text-gray-500 hover:text-gray-700'
                                } px-3 py-2 font-medium text-sm rounded-md`}
                        >
                            Inactive
                        </button>
                    </nav>
                </div>
            </div>

            {filteredListings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <PencilSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter === 'all'
                            ? "Get started by creating your first pet adoption listing."
                            : `You don't have any ${filter} listings.`}
                    </p>
                    {filter === 'all' && (
                        <div className="mt-6">
                            <Link
                                href="/dashboard/create-listing"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Create Listing
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {filteredListings.map((listing) => (
                            <li key={listing.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-16 w-16 relative rounded-md overflow-hidden bg-gray-100">
                                                {listing.pet.primaryImage ? (
                                                    <Image
                                                        src={listing.pet.primaryImage}
                                                        alt={listing.pet.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                        <span className="text-xs">No img</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-primary-600 truncate">{listing.title}</h3>
                                                <div className="flex mt-1 text-sm text-gray-500">
                                                    <p>{listing.pet.name} ({listing.pet.petType})</p>
                                                    <span className="mx-2">&bull;</span>
                                                    <p>{listing.pet.city}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            {getStatusBadge(listing.status)}
                                            {(listing.status.toLowerCase() === 'pendingpayment' || listing.status.toLowerCase() === 'pending_payment') && (
                                                <Link
                                                    href={`/dashboard/pricing?listingId=${listing.id}&type=adoption`}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    Complete Payment
                                                </Link>
                                            )}
                                            <div className="text-sm text-gray-500">
                                                {listing.viewCount} views &bull; {listing.inquiryCount} inquiries
                                            </div>
                                            <Link
                                                href={`/dashboard/edit/${listing.id}`}
                                                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                            >
                                                Edit Listing &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
