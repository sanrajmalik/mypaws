export interface CreateBreederApplicationDto {
    businessName: string;
    kennelName?: string;
    yearsExperience: number;
    description: string;
    businessPhone: string;
    businessEmail: string; // Optional in backend but good to have
    websiteUrl?: string;
    cityId: string;
    address: string;
    pincode: string;
    breedIds: string[];
    documentUrls: Record<string, string>; // e.g., { "id_proof": "url", "address_proof": "url" }
    agreeToEthicalStandards: boolean;
}

export interface BreederApplicationDto {
    id: string;
    status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'InfoRequested';
    reviewNotes?: string; // JSON
    createdAt: string;
}

export interface CreateBreederListingDto {
    petId?: string;
    newPet?: BreederCreatePetDto;
    title: string;
    price: number;
    priceNegotiable: boolean;
    availableCount: number;
    expectedDate?: string;
    includes: string[];
}

export interface BreederCreatePetDto {
    name: string;
    petTypeId: string;
    breedId?: string;
    gender: 'male' | 'female';
    dateOfBirth?: string;
    ageYears?: number;
    ageMonths?: number;
    color?: string;
    sizeCategory?: string;
    isNeutered?: boolean;
    isVaccinated?: boolean;
    vaccinationDetails?: string;
    temperament?: BreederPetTemperamentDto;
    funFacts?: string[];
    rescueStory?: string;
    description?: string;
    images?: string[];
}

export interface BreederPetTemperamentDto {
    goodWithKids?: boolean | null;
    goodWithDogs?: boolean | null;
    goodWithCats?: boolean | null;
    energyLevel?: string | null;
    trainingLevel?: string | null;
    traits?: string[];
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
    gender: string;
    ageDisplay: string;
    color?: string;
    description?: string;
    images: string[];
    breederId: string;
    breederName: string;
    cityName: string;
    stateName: string;

    // Contact
    businessPhone?: string;
    businessEmail?: string;
    websiteUrl?: string;
}

export interface BreederProfileDto {
    id: string;
    businessName: string;
    slug: string;
    kennelName?: string;
    description?: string;
    yearsExperience: number;
    businessPhone?: string;
    businessEmail?: string;
    websiteUrl?: string;
    cityId: string;
    cityName: string;
    stateName: string;
    logoUrl?: string;
    coverImageUrl?: string;
    galleryUrls: string[];
    isVerified: boolean;
    verificationBadge?: string;
    activeListingsCount: number;
    viewCount: number;
    totalListingViews: number;
    avgRating: number;
    reviewCount: number;
    breeds: { id: string; name: string; slug: string }[];
}
