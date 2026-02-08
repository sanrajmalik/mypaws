'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { breederApi } from '@/lib/breeder-api';
import ProtectedContact from '@/components/auth/ProtectedContact';
import { BreederProfileDto, BreederListingDto } from '@/types/breeder';
import {
    MapPinIcon,
    CheckBadgeIcon,
    StarIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon
} from '@heroicons/react/24/solid';

export default function BreederProfilePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<BreederProfileDto | null>(null);
    const [listings, setListings] = useState<BreederListingDto[]>([]);

    useEffect(() => {
        if (!slug) return;

        async function fetchData() {
            try {
                const profileRes = await breederApi.getProfileBySlug(slug);
                if (profileRes.data) {
                    setProfile(profileRes.data);

                    if (profileRes.data.id) {
                        const listingsRes = await breederApi.getBreederListings(profileRes.data.id);
                        if (listingsRes.data) {
                            setListings(listingsRes.data);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load breeder profile', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Breeder Not Found</h1>
                <p className="text-gray-600">The breeder profile you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Cover */}
            <div className="bg-white shadow">
                <div className="h-48 md:h-64 bg-gray-200 relative">
                    {profile.coverImageUrl ? (
                        <Image
                            src={profile.coverImageUrl}
                            alt="Cover"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-100 to-blue-100 flex items-center justify-center">
                            <span className="text-primary-300 text-6xl opacity-20">🐾</span>
                        </div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="-mt-16 sm:-mt-24 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                        {/* Logo */}
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                            {profile.logoUrl ? (
                                <Image
                                    src={profile.logoUrl}
                                    alt={profile.businessName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                                    🏢
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.businessName}</h1>
                                {profile.isVerified && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <CheckBadgeIcon className="w-4 h-4 mr-1 text-blue-600" />
                                        Verified Breeder
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center sm:justify-start text-gray-500 gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                    <MapPinIcon className="w-4 h-4" />
                                    {profile.cityName}, {profile.stateName}
                                </span>
                                <span className="flex items-center gap-1">
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                    {profile.yearsExperience} Years Exp.
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pb-4 flex gap-3">
                            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium shadow hover:bg-primary-700 transition">
                                Contact Breeder
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: About & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About {profile.businessName}</h2>
                        <div className="prose text-gray-600 max-w-none">
                            <p className="whitespace-pre-line">{profile.description || "No description provided."}</p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3">Breeds We Raise</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.breeds.map(breed => (
                                    <span key={breed.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                        🐾 {breed.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Active Listings */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Puppies & Kittens</h2>
                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {listings.map(listing => (
                                    <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative h-48">
                                            {listing.imageUrl ? (
                                                <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                                                <span className="text-green-600 font-bold">₹{listing.price.toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">{listing.breedName} • {listing.petName}</p>
                                            <button className="w-full py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p>No active listings at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Contact & Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                        <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Contact Information</h3>

                        <div className="space-y-4">
                            <ProtectedContact label="Login to View Contact Details">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <PhoneIcon className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                                            <p className="text-gray-900 font-medium">{profile.businessPhone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                                            <p className="text-gray-900 font-medium">{profile.businessEmail}</p>
                                        </div>
                                    </div>

                                    {profile.websiteUrl && (
                                        <div className="flex items-start gap-3">
                                            <GlobeAltIcon className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Website</p>
                                                <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                                    Visit Website
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center justify-center gap-2">
                                            <span className="text-lg">💬</span> Chat on WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </ProtectedContact>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
