import { getClient } from './client-api';
import {
    BreederApplicationDto,
    BreederListingDto,
    BreederProfileDto,
    CreateBreederApplicationDto,
    CreateBreederListingDto
} from '../types/breeder';

const client = getClient();

export const breederApi = {
    // Application
    apply: async (data: CreateBreederApplicationDto) => {
        return client.post<BreederApplicationDto>('/v1/breeders/apply', data);
    },

    getApplicationStatus: async () => {
        return client.get<BreederApplicationDto>('/v1/breeders/application');
    },

    // Profile
    getMyProfile: async () => {
        return client.get<BreederProfileDto>('/v1/breeders/me');
    },

    updateProfile: async (data: any) => {
        return client.put<BreederProfileDto>('/v1/breeders/me', data);
    },

    getProfileBySlug: async (slug: string) => {
        return client.get<BreederProfileDto>(`/v1/breeders/public/slug/${slug}`);
    },

    getProfileById: async (id: string) => {
        return client.get<BreederProfileDto>(`/v1/breeders/public/${id}`);
    },

    // Listings
    createListing: async (data: CreateBreederListingDto) => {
        return client.post<BreederListingDto>('/v1/breeders/listings', data);
    },

    getMyListings: async () => {
        return client.get<BreederListingDto[]>('/v1/breeders/listings');
    },

    // Public Listings
    getBreederListings: async (breederId: string) => {
        return client.get<BreederListingDto[]>(`/v1/breeders/public/${breederId}/listings`);
    },

    getListingBySlug: async (slug: string) => {
        return client.get<BreederListingDto>(`/v1/breeders/listings/${slug}`);
    }
};
