'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { breederApi } from '@/lib/breeder-api';
import { BreederApplicationDto, BreederProfileDto, BreederListingDto } from '@/types/breeder';
import { useAuthStore } from '@/stores/authStore';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PlusIcon,
    PencilSquareIcon,
    ArrowTopRightOnSquareIcon,
    CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

export default function BreederDashboardPage() {
    const router = useRouter();
    const { user, refreshUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState<BreederApplicationDto | null>(null);
    const [profile, setProfile] = useState<BreederProfileDto | null>(null);
    const [listings, setListings] = useState<BreederListingDto[]>([]);

    const authRetryCount = useRef(0);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            try {
                // 1. Check Application Status
                const appRes = await breederApi.getApplicationStatus();

                if (!mounted) return;

                if (appRes.data) {
                    setApplication(appRes.data);

                    // 2. If approved, fetch Profile and Listings
                    if (appRes.data.status === 'Approved') {

                        // Fix for Redirect Loop: detailed check
                        // If user is approved but local state says not a breeder, refresh auth silently
                        // Limit retries to 3 to prevent infinite loop
                        if (user && !user.isBreeder && authRetryCount.current < 3) {
                            console.log('User approved but isBreeder false, refreshing auth...', authRetryCount.current);
                            authRetryCount.current += 1;
                            // Use silent refresh to avoid global loading state (which unmounts this component)
                            await refreshUser();
                        }

                        const [profileRes, listingsRes] = await Promise.all([
                            breederApi.getMyProfile(),
                            breederApi.getMyListings()
                        ]);

                        if (mounted) {
                            if (profileRes.data) setProfile(profileRes.data);
                            if (listingsRes.data) setListings(listingsRes.data);
                        }
                    }
                }
            } catch (err: any) {
                // Ignore 404 (means no application)
                if (err?.error?.message !== 'No application found') {
                    console.error('Error fetching breeder data', err);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        // Only run if user is loaded
        // We do NOT include refreshUser in deps as it's stable, and even if it wasn't, we don't want to re-run
        if (user || loading) {
            fetchData();
        }

        return () => { mounted = false; };
    }, [user?.isBreeder, user?.id]); // Removed checkAuth/refreshUser from deps to be safe, though they should be stable

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // STATE 1: No Application
    if (!application) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto mt-10">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🐾</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Become a Verified Breeder</h2>
                <p className="text-gray-600 mb-8">
                    Join our community of ethical breeders. List your puppies/kittens, manage your profile, and connect with loving families.
                </p>
                <Link
                    href="/breeders/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                    Start Application
                </Link>
            </div>
        );
    }

    // STATE 2: Pending
    if (application.status === 'Pending' || application.status === 'InfoRequested') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-8 text-center max-w-2xl mx-auto mt-10">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
                <p className="text-gray-600 mb-6">
                    Thank you for applying! Our team is reviewing your details to ensure they meet our ethical standards.
                    This usually takes 24-48 hours.
                </p>
                <div className="text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-full inline-block">
                    Reference ID: #{application.id.substring(0, 8)}
                </div>
            </div>
        );
    }

    // STATE 3: Rejected
    if (application.status === 'Rejected') {
        let reason = "Doesn't meet criteria";
        try {
            if (application.reviewNotes) {
                const notes = JSON.parse(application.reviewNotes);
                reason = notes.Reason || reason;
            }
        } catch { }

        return (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center max-w-2xl mx-auto mt-10">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Updates Required</h2>
                <p className="text-gray-600 mb-6">
                    Unfortunately, we couldn't approve your application at this time.
                </p>
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-left">
                    <h4 className="font-semibold text-red-800 mb-1">Feedback:</h4>
                    <p className="text-red-700">{reason}</p>
                </div>
                <Link
                    href="/breeders/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                    Update & Re-apply
                </Link>
            </div>
        );
    }

    // STATE 4: Approved (Dashboard)
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">{profile?.businessName}</h1>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" /> Verified Breeder
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        {profile?.cityName}, {profile?.stateName} • Member since {new Date().getFullYear()}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href={`/breeders/${profile?.slug}`}
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                        View Public Profile
                    </Link>
                    <button className="inline-flex items-center px-4 py-2 border border-primary-600 shadow-sm text-sm font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50">
                        <PencilSquareIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                    </button>
                    <Link
                        href="/dashboard/breeder/listings/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Post New Litter
                    </Link>
                </div>
            </div>

            {/* Stats / Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Active Listings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{profile?.activeListingsCount || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Profile Views</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{profile?.viewCount || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Listing Views</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{profile?.totalListingViews || 0}</p>
                </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Listings</h2>

                {listings.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500 mb-4">No active listings. Post your first litter!</p>
                        <Link
                            href="/dashboard/breeder/listings/create"
                            className="text-primary-600 font-medium hover:text-primary-700"
                        >
                            + Create a new listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative h-48">
                                    {listing.imageUrl ? (
                                        <img
                                            src={listing.imageUrl}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-4xl">🐾</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${listing.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            listing.status === 'PendingPayment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {listing.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-medium text-gray-900 truncate">{listing.title}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mt-1 mb-3">
                                        <span>{listing.breedName}</span>
                                        <span className="mx-1">•</span>
                                        <span>{listing.gender}</span>
                                        <span className="mx-1">•</span>
                                        <span>{listing.ageDisplay}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-lg font-bold text-primary-600 flex items-center">
                                            <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                                            {listing.price.toLocaleString('en-IN')}
                                        </span>

                                        <div className="flex gap-2">
                                            {listing.status === 'PendingPayment' && (
                                                <Link
                                                    href={`/dashboard/pricing?listingId=${listing.id}&type=breeder`}
                                                    className="text-sm font-medium text-white bg-primary-600 px-3 py-1 rounded hover:bg-primary-700"
                                                >
                                                    Pay Now
                                                </Link>
                                            )}
                                            <Link
                                                href={`/dashboard/breeder/listings/${listing.slug}/edit`}
                                                className="text-sm font-medium text-gray-600 hover:text-primary-600 py-1"
                                            >
                                                Manage
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
