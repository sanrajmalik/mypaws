'use client';

import { useState, useEffect } from 'react';
import { getInternalApiUrl_Client } from '@/lib/public-api';

export interface City {
    id: string;
    name: string;
    slug: string;
    state: string;
}

interface CitySelectProps {
    value?: City | null;
    onChange: (city: City | null) => void;
    error?: string;
    label?: string;
}

export default function CitySelect({ value, onChange, error, label = "City" }: CitySelectProps) {
    const [search, setSearch] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Initial value handling - if value provided, don't auto-search unless user types

    useEffect(() => {
        if (!search.trim() || (value && search === value.name)) {
            setCities([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const apiUrl = getInternalApiUrl_Client();
                const res = await fetch(`${apiUrl}/v1/public/cities?search=${encodeURIComponent(search)}&limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    setCities(data.data || data);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error('Failed to search cities', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, value]);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            {value ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <span className="font-medium text-gray-800">
                        📍 {value.name}, {value.state}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            onChange(null);
                            setSearch('');
                            setCities([]);
                        }}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for your city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => {
                            if (search.length >= 2) setShowDropdown(true);
                        }}
                        className={`
                            block w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-primary-500 font-sans
                            bg-white text-gray-900 placeholder-gray-500
                            ${error ? 'border-red-300' : 'border-gray-300'}
                        `}
                    />
                    {loading && (
                        <div className="absolute right-3 top-3.5">
                            <div className="animate-spin h-5 w-5 border-2 border-primary-500 rounded-full border-t-transparent"></div>
                        </div>
                    )}

                    {showDropdown && cities.length > 0 && (
                        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {cities.map((city) => (
                                <li key={city.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(city);
                                            setSearch('');
                                            setCities([]);
                                            setShowDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-primary-50 hover:text-primary-700 text-gray-900 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="font-medium">{city.name}</div>
                                        <div className="text-xs text-gray-500">{city.state}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {showDropdown && search.length >= 2 && !loading && cities.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                            No cities found matching "{search}"
                        </div>
                    )}
                </div>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
