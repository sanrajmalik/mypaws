// Types for API responses
export interface PetType {
    id: string;
    name: string;
    slug: string;
    pluralName: string;
    iconUrl?: string;
}

export interface Breed {
    id: string;
    name: string;
    slug: string;
    petType: string;
    sizeCategory?: string;
    imageUrl?: string;
    adoptionCount: number;
    breederCount: number;
    isPopular: boolean;
}

export interface City {
    id: string;
    name: string;
    slug: string;
    state: string;
    adoptionCount: number;
    breederCount: number;
    isFeatured: boolean;
}

export interface PetSummary {
    id: string;
    name: string;
    breed?: { id: string; name: string; slug: string };
    petType: { slug: string; name: string };
    gender: string;
    ageDisplay: string;
    primaryImage?: { thumbUrl: string; altText?: string };
}

export interface AdoptionListingCard {
    id: string;
    slug: string;
    title: string;
    pet: PetSummary;
    city: { name: string; slug: string };
    adoptionFee?: number;
    isFeatured: boolean;
    publishedAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// API functions for public endpoints
export function getInternalApiUrl_Client() {
    if (typeof window === 'undefined' && process.env.INTERNAL_API_URL) {
        return process.env.INTERNAL_API_URL;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

const API_URL = getInternalApiUrl_Client();

export async function getPetTypes(): Promise<PetType[]> {
    const res = await fetch(`${API_URL}/v1/public/pet-types`, {
        next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error('Failed to fetch pet types');
    return res.json();
}

export async function getBreeds(params?: {
    petType?: string;
    size?: string;
    popular?: boolean;
    search?: string;
    limit?: number;
}): Promise<PaginatedResponse<Breed>> {
    const searchParams = new URLSearchParams();
    if (params?.petType) searchParams.set('petType', params.petType);
    if (params?.size) searchParams.set('size', params.size);
    if (params?.popular) searchParams.set('popular', 'true');
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));

    const res = await fetch(`${API_URL}/v1/public/breeds?${searchParams}`, {
        next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch breeds');
    return res.json();
}

export async function getCities(params?: {
    state?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
}): Promise<PaginatedResponse<City>> {
    const searchParams = new URLSearchParams();
    if (params?.state) searchParams.set('state', params.state);
    if (params?.featured) searchParams.set('featured', 'true');
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));

    const res = await fetch(`${API_URL}/v1/public/cities?${searchParams}`, {
        next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
}

export async function getAdoptionListings(params?: {
    city?: string;
    breed?: string;
    petType?: string;
    gender?: string;
    ageMin?: number;
    ageMax?: number;
    size?: string;
    sort?: 'recent' | 'popular';
    page?: number;
    limit?: number;
}): Promise<PaginatedResponse<AdoptionListingCard>> {
    const searchParams = new URLSearchParams();
    if (params?.city) searchParams.set('city', params.city);
    if (params?.breed) searchParams.set('breed', params.breed);
    if (params?.petType) searchParams.set('petType', params.petType);
    if (params?.gender) searchParams.set('gender', params.gender);
    if (params?.ageMin) searchParams.set('ageMin', String(params.ageMin));
    if (params?.ageMax) searchParams.set('ageMax', String(params.ageMax));
    if (params?.size) searchParams.set('size', params.size);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const resolutionUrl = `${API_URL}/v1/public/adoption-listings?${searchParams}`;
    const res = await fetch(resolutionUrl, {
        cache: 'no-store' // Always fresh for listings
    });
    if (!res.ok) {
        console.error(`Fetch failed for ${resolutionUrl}: ${res.status} ${res.statusText}`);
        throw new Error('Failed to fetch listings');
    }
    return res.json();
}

export async function getAdoptionListing(slug: string) {
    const res = await fetch(`${API_URL}/v1/public/adoption-listings/${slug}`, {
        cache: 'no-store'
    });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch listing');
    }
    return res.json();
}

export async function getBreederListing(slug: string) {
    const res = await fetch(`${API_URL}/v1/breeders/listings/${slug}`, {
        cache: 'no-store'
    });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch breeder listing');
    }
    return res.json();
}

export interface BreederListingFilter {
    petType?: string;
    breedId?: string;
    breedSlug?: string;
    cityId?: string;
    citySlug?: string;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
}

export interface BreederListingDto {
    id: string;
    title: string;
    slug: string;
    price: number;
    priceNegotiable: boolean;
    status: string;
    createdAt: string;
    petId: string;
    petName: string;
    breedName: string;
    imageUrl: string;
    petType: string;
    gender: string;
    ageDisplay: string;
    color: string;
    breederId: string;
    breederName: string;
    cityName: string;
    stateName: string;

    // Contact
    businessPhone?: string;
    businessEmail?: string;
    websiteUrl?: string;
}

export async function searchBreederListings(filter: BreederListingFilter): Promise<BreederListingDto[]> {
    const params = new URLSearchParams();
    if (filter.petType) params.append('petType', filter.petType);
    if (filter.breedId) params.append('breedId', filter.breedId);
    if (filter.breedSlug) params.append('breedSlug', filter.breedSlug);
    if (filter.cityId) params.append('cityId', filter.cityId);
    if (filter.citySlug) params.append('citySlug', filter.citySlug);
    if (filter.gender) params.append('gender', filter.gender);
    if (filter.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());

    // Note: Assuming endpoint is /v1/breeders/listings/search
    const res = await fetch(`${API_URL}/v1/breeders/listings/search?${params.toString()}`, {
        cache: 'no-store'
    });

    if (!res.ok) {
        console.error(`Search failed: ${res.status}`);
        return [];
    }

    return res.json();
}
