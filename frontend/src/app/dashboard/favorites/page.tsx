'use client';

import { useEffect, useState } from 'react';
import { getClient } from '@/lib/client-api';
import PetCard from '@/components/pets/PetCard';
import { HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const handleRemoveFavorite = async (listingId: string) => {
        try {
            const client = getClient();
            await client.delete(`/v1/favorites/${listingId}`);
            setFavorites(prev => prev.filter(f => f.adoptionListing.id !== listingId));
        } catch (err) {
            console.error('Failed to remove favorite', err);
        }
    };

    useEffect(() => {
        async function fetchFavorites() {
            try {
                const client = getClient();
                const { data } = await client.get<any[]>('/v1/favorites');
                if (data) {
                    setFavorites(data);
                }
            } catch (err) {
                console.error('Failed to fetch favorites', err);
            } finally {
                setLoading(false);
            }
        }

        fetchFavorites();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading favorites...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Favorites</h1>

            {favorites.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <HeartIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No favorites yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Save listings you're interested in while browsing.</p>
                    <div className="mt-6">
                        <Link
                            href="/adopt-a-pet"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Browse Pets
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {favorites.map((fav) => (
                        <PetCard
                            key={fav.adoptionListingId}
                            listing={fav.adoptionListing}
                            isFavorite={true}
                            onFavorite={handleRemoveFavorite}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
