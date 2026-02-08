'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PetCard from '@/components/pets/PetCard';
import FilterPanel, { FilterState } from '@/components/pets/FilterPanel';
import { AdoptionListingCard, Breed, City, PaginatedResponse, getAdoptionListings } from '@/lib/public-api';

interface Props {
    initialListings: PaginatedResponse<AdoptionListingCard>;
    breeds: Breed[];
    cities: City[];
    initialFilters: FilterState;
    petType?: 'dog' | 'cat';
}

export default function AdoptionListingsPage({ initialListings, breeds, cities, initialFilters }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [listings, setListings] = useState(initialListings);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const updateURL = useCallback((newFilters: FilterState) => {
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        router.push(`/adopt-a-pet?${params.toString()}`, { scroll: false });
    }, [router]);

    const handleFilterChange = async (newFilters: FilterState) => {
        setFilters(newFilters);
        updateURL(newFilters);
        setLoading(true);

        try {
            // Map age string to range
            let ageMin: number | undefined;
            let ageMax: number | undefined;

            if (newFilters.age) {
                switch (newFilters.age) {
                    case 'puppy': // 0-1 year (0-12 months)
                        ageMin = 0;
                        ageMax = 12;
                        break;
                    case 'young': // 1-3 years (12-36 months)
                        ageMin = 12;
                        ageMax = 36;
                        break;
                    case 'adult': // 3-7 years (36-84 months)
                        ageMin = 36;
                        ageMax = 84;
                        break;
                    case 'senior': // 7+ years (84+ months)
                        ageMin = 84;
                        break;
                }
            }

            const result = await getAdoptionListings({
                city: newFilters.city,
                breed: newFilters.breed,
                petType: newFilters.petType,
                gender: newFilters.gender,
                size: newFilters.size,
                ageMin,
                ageMax,
                page: 1,
                limit: 20,
            });
            setListings(result);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = async (page: number) => {
        setLoading(true);
        updateURL({ ...filters });

        try {
            // Map age string to range
            let ageMin: number | undefined;
            let ageMax: number | undefined;

            if (filters.age) {
                switch (filters.age) {
                    case 'puppy': ageMin = 0; ageMax = 12; break;
                    case 'young': ageMin = 12; ageMax = 36; break;
                    case 'adult': ageMin = 36; ageMax = 84; break;
                    case 'senior': ageMin = 84; break;
                }
            }

            const result = await getAdoptionListings({
                ...filters,
                ageMin,
                ageMax,
                page,
                limit: 20,
            });
            setListings(result);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Failed to fetch page:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const { data: pets, pagination } = listings;

    return (
        <div className="listings-page">
            <FilterPanel
                breeds={breeds}
                cities={cities}
                filters={filters}
                onChange={handleFilterChange}
            />

            {loading ? (
                <div className="loading-grid">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton-card" />
                    ))}
                </div>
            ) : pets.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state__icon">🐾</span>
                    <h3 className="empty-state__title">No pets found</h3>
                    <p className="empty-state__text">
                        Try adjusting your filters or check back later for new listings
                    </p>
                </div>
            ) : (
                <>
                    <div className="results-header">
                        <p className="results-count">
                            {pagination.totalItems} pet{pagination.totalItems !== 1 ? 's' : ''} available
                        </p>
                    </div>

                    <div className="pet-grid">
                        {pets.map((listing) => (
                            <PetCard
                                key={listing.id}
                                listing={listing}
                                onFavorite={toggleFavorite}
                                isFavorite={favorites.has(listing.id)}
                            />
                        ))}
                    </div>

                    {pagination.totalPages > 1 && (
                        <nav className="pagination">
                            <button
                                className="pagination__btn"
                                disabled={pagination.page === 1}
                                onClick={() => handlePageChange(pagination.page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination__info">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                className="pagination__btn"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => handlePageChange(pagination.page + 1)}
                            >
                                Next
                            </button>
                        </nav>
                    )}
                </>
            )}

            <style jsx>{`
        .listings-page {
          min-height: 400px;
        }
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .results-count {
          font-size: 14px;
          color: #6b7280;
        }
        
        .pet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        
        .skeleton-card {
          height: 320px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .empty-state {
          padding: 80px 20px;
          text-align: center;
        }
        
        .empty-state__icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }
        
        .empty-state__title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }
        
        .empty-state__text {
          color: #6b7280;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 40px;
          padding: 20px;
        }
        
        .pagination__btn {
          padding: 10px 20px;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .pagination__btn:hover:not(:disabled) {
          background: #6d28d9;
        }
        
        .pagination__btn:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .pagination__info {
          color: #6b7280;
          font-size: 14px;
        }
        
        @media (max-width: 640px) {
          .pet-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
