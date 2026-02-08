'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, X } from 'lucide-react';
import type { Breed, City } from '@/lib/public-api';

interface FilterProps {
    breeds: Breed[];
    cities: City[];
}

export default function BreederListingFilter({ breeds, cities }: FilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const panelRef = useRef<HTMLDivElement>(null);

    const [filters, setFilters] = useState({
        breed: searchParams.get('breed') || '',
        city: searchParams.get('city') || '',
        gender: searchParams.get('gender') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
    });

    const [citySearch, setCitySearch] = useState('');
    const [breedSearch, setBreedSearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showBreedDropdown, setShowBreedDropdown] = useState(false);

    // Sync state with URL params
    useEffect(() => {
        setFilters({
            breed: searchParams.get('breed') || '',
            city: searchParams.get('city') || '',
            gender: searchParams.get('gender') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
        });
    }, [searchParams]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
                setShowBreedDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyFilters = (newFilters: typeof filters) => {
        const params = new URLSearchParams();
        if (newFilters.breed) params.set('breed', newFilters.breed);
        if (newFilters.city) params.set('city', newFilters.city);
        if (newFilters.gender) params.set('gender', newFilters.gender);
        if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
        if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);

        // Reset pagination
        params.delete('page');

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleFilterChange = (key: string, value: string) => {
        // If searching/clearing, we might want to update the search text too
        if (key === 'city' && value === '') setCitySearch('');
        if (key === 'breed' && value === '') setBreedSearch('');

        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            breed: '',
            city: '',
            gender: '',
            minPrice: '',
            maxPrice: ''
        };
        setFilters(emptyFilters);
        setCitySearch('');
        setBreedSearch('');
        applyFilters(emptyFilters);
    };

    // Filter available options based on search
    const filteredCities = cities.filter(c =>
        c.name.toLowerCase().includes(citySearch.toLowerCase())
    );

    const filteredBreeds = breeds.filter(b =>
        b.name.toLowerCase().includes(breedSearch.toLowerCase())
    );

    const activeFiltersCount = Object.values(filters).filter(val => val !== '').length;

    return (
        <div className="filter-panel" ref={panelRef}>
            {/* City Search */}
            <div className="filter-group">
                <label className="filter-label">Location</label>
                <div className="filter-dropdown">
                    <div className="filter-input-wrapper">
                        <Search className="filter-input-icon" />
                        <input
                            type="text"
                            placeholder="Search city..."
                            value={citySearch}
                            onChange={(e) => {
                                setCitySearch(e.target.value);
                                setShowCityDropdown(true);
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            className="filter-input"
                        />
                        {(filters.city || citySearch) && (
                            <button
                                onClick={() => handleFilterChange('city', '')}
                                className="filter-clear-btn"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {showCityDropdown && (
                        <div className="filter-dropdown-menu">
                            {filteredCities.slice(0, 10).map(city => (
                                <button
                                    key={city.id}
                                    className={`filter-dropdown-item ${filters.city === city.slug ? 'active' : ''}`}
                                    onClick={() => {
                                        handleFilterChange('city', city.slug);
                                        setCitySearch(city.name);
                                        setShowCityDropdown(false);
                                    }}
                                >
                                    <span>{city.name}</span>
                                    <span className="text-xs text-gray-400">{city.state}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Breed Search */}
            <div className="filter-group">
                <label className="filter-label">Breed</label>
                <div className="filter-dropdown">
                    <div className="filter-input-wrapper">
                        <input
                            type="text"
                            placeholder="All breeds..."
                            value={breedSearch}
                            onChange={(e) => {
                                setBreedSearch(e.target.value);
                                setShowBreedDropdown(true);
                            }}
                            onFocus={() => setShowBreedDropdown(true)}
                            className="filter-input filter-input--no-icon"
                        />
                        {(filters.breed || breedSearch) ? (
                            <button
                                onClick={() => handleFilterChange('breed', '')}
                                className="filter-clear-btn"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        ) : (
                            <ChevronDown className="filter-chevron" />
                        )}
                    </div>
                    {showBreedDropdown && (
                        <div className="filter-dropdown-menu">
                            <button
                                className={`filter-dropdown-item ${!filters.breed ? 'active' : ''}`}
                                onClick={() => {
                                    handleFilterChange('breed', '');
                                    setBreedSearch('');
                                    setShowBreedDropdown(false);
                                }}
                            >
                                All Breeds
                            </button>
                            {filteredBreeds.slice(0, 15).map(breed => (
                                <button
                                    key={breed.id}
                                    className={`filter-dropdown-item ${filters.breed === breed.slug ? 'active' : ''}`}
                                    onClick={() => {
                                        handleFilterChange('breed', breed.slug);
                                        setBreedSearch(breed.name);
                                        setShowBreedDropdown(false);
                                    }}
                                >
                                    <span>{breed.name}</span>
                                    {breed.isPopular && <span className="badge-popular">Popular</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Gender */}
            <div className="filter-group">
                <label className="filter-label">Gender</label>
                <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Any Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>

            {/* Min Price */}
            <div className="filter-group">
                <label className="filter-label">Min Price</label>
                <select
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Any</option>
                    <option value="5000">₹5,000</option>
                    <option value="10000">₹10,000</option>
                    <option value="20000">₹20,000</option>
                    <option value="30000">₹30,000</option>
                    <option value="50000">₹50,000</option>
                </select>
            </div>

            {/* Max Price */}
            <div className="filter-group">
                <label className="filter-label">Max Price</label>
                <select
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Any</option>
                    <option value="15000">₹15,000</option>
                    <option value="30000">₹30,000</option>
                    <option value="50000">₹50,000</option>
                    <option value="100000">₹1,00,000+</option>
                </select>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="filter-clear-all">
                    Clear All ({activeFiltersCount})
                </button>
            )}

            <style jsx>{`
                .filter-panel {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    padding: 20px;
                    background: #f9fafb;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    border: 1px solid #e5e7eb;
                }
                
                .filter-group {
                    flex: 1;
                    min-width: 150px;
                    max-width: 200px;
                    position: relative;
                }
                
                .filter-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 700;
                    color: #6b7280;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .filter-dropdown {
                    position: relative;
                }
                
                .filter-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .filter-input-icon {
                    position: absolute;
                    left: 10px;
                    width: 16px;
                    height: 16px;
                    color: #9ca3af;
                }
                
                .filter-input {
                    width: 100%;
                    padding: 10px 12px 10px 36px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    color: #1f2937;
                }
                
                .filter-input--no-icon {
                    padding-left: 12px;
                }
                
                .filter-input:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }
                
                .filter-chevron {
                    position: absolute;
                    right: 10px;
                    width: 16px;
                    height: 16px;
                    color: #9ca3af;
                    pointer-events: none;
                }
                
                .filter-clear-btn {
                    position: absolute;
                    right: 8px;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                }
                
                .filter-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 50;
                    margin-top: 4px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    max-height: 240px;
                    overflow-y: auto;
                }
                
                .filter-dropdown-item {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    padding: 10px 12px;
                    text-align: left;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.1s;
                    color: #374151;
                }
                
                .filter-dropdown-item:hover {
                    background: #f3f4f6;
                }
                
                .filter-dropdown-item.active {
                    background: #ede9fe;
                    color: #7c3aed;
                }
                
                .filter-select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    cursor: pointer;
                    color: #374151;
                }
                
                .filter-select:focus {
                    outline: none;
                    border-color: #8b5cf6;
                }
                
                .badge-popular {
                    font-size: 10px;
                    padding: 2px 6px;
                    background: #fef3c7;
                    color: #92400e;
                    border-radius: 4px;
                }
                
                .filter-clear-all {
                    align-self: flex-end;
                    padding: 10px 16px;
                    background: #fee2e2;
                    color: #991b1b;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .filter-clear-all:hover {
                    background: #fecaca;
                }
                
                @media (max-width: 768px) {
                    .filter-panel {
                        flex-direction: column;
                    }
                    
                    .filter-group {
                        max-width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
