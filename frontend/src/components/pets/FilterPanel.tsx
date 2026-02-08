'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import type { Breed, City } from '@/lib/public-api';

interface FilterPanelProps {
    breeds: Breed[];
    cities: City[];
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    petType?: 'dog' | 'cat';
}

export interface FilterState {
    city?: string;
    breed?: string;
    petType?: string;
    gender?: string;
    size?: string;
    age?: string;
}

const AGE_OPTIONS = [
    { value: '', label: 'Any Age' },
    { value: 'puppy', label: 'Puppy/Kitten (0-1 year)' },
    { value: 'young', label: 'Young (1-3 years)' },
    { value: 'adult', label: 'Adult (3-7 years)' },
    { value: 'senior', label: 'Senior (7+ years)' },
];

const SIZE_OPTIONS = [
    { value: '', label: 'Any Size' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'giant', label: 'Giant' },
];

const GENDER_OPTIONS = [
    { value: '', label: 'Any Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

export default function FilterPanel({ breeds, cities, filters, onChange, petType }: FilterPanelProps) {
    const [citySearch, setCitySearch] = useState('');
    const [breedSearch, setBreedSearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showBreedDropdown, setShowBreedDropdown] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.filter-dropdown')) {
                setShowCityDropdown(false);
                setShowBreedDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCities = cities.filter(c =>
        c.name.toLowerCase().includes(citySearch.toLowerCase())
    );

    const filteredBreeds = breeds
        .filter(b => petType ? b.petType.toLowerCase() === petType : true)
        .filter(b => b.name.toLowerCase().includes(breedSearch.toLowerCase()));

    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    const clearFilters = () => {
        onChange({});
        setCitySearch('');
        setBreedSearch('');
    };

    return (
        <div className="filter-panel">
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
                                onClick={() => {
                                    onChange({ ...filters, city: undefined });
                                    setCitySearch('');
                                }}
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
                                        onChange({ ...filters, city: city.slug });
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

            {/* Breed Dropdown */}
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
                                onClick={() => {
                                    onChange({ ...filters, breed: undefined });
                                    setBreedSearch('');
                                }}
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
                                    onChange({ ...filters, breed: undefined });
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
                                        onChange({ ...filters, breed: breed.slug });
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
                    value={filters.gender || ''}
                    onChange={(e) => onChange({ ...filters, gender: e.target.value || undefined })}
                    className="filter-select"
                >
                    {GENDER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Size */}
            <div className="filter-group">
                <label className="filter-label">Size</label>
                <select
                    value={filters.size || ''}
                    onChange={(e) => onChange({ ...filters, size: e.target.value || undefined })}
                    className="filter-select"
                >
                    {SIZE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Age */}
            <div className="filter-group">
                <label className="filter-label">Age</label>
                <select
                    value={filters.age || ''}
                    onChange={(e) => onChange({ ...filters, age: e.target.value || undefined })}
                    className="filter-select"
                >
                    {AGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
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
        }
        
        .filter-group {
          flex: 1;
          min-width: 150px;
          max-width: 200px;
          position: relative;
        }
        
        .filter-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
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
