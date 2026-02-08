'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import BreederListingForm, { BreederListingFormData } from '@/components/breeders/BreederListingForm';
import { breederApi } from '@/lib/breeder-api';
import { CreateBreederListingDto } from '@/types/breeder';

export default function CreateBreederListingPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    // Protect Route
    if (!isLoading && (!isAuthenticated || !user?.isBreeder)) {
        router.push(isAuthenticated ? '/dashboard/breeder' : '/login');
    }

    const handleSubmit = async (data: BreederListingFormData) => {
        try {
            // Map BreederListingFormData to CreateBreederListingDto with NewPet
            const dto: CreateBreederListingDto = {
                title: data.title || 'Pet Listing', // Fallback, though form ensures title generation
                price: data.price || 0,
                priceNegotiable: data.priceNegotiable,
                availableCount: data.availableCount,
                includes: data.includes,

                // Create new pet on the fly
                newPet: {
                    name: data.pet.name || 'Litter', // Default if empty
                    petTypeId: data.pet.petTypeId,
                    breedId: data.pet.breedId || undefined,
                    gender: data.pet.gender,
                    ageYears: data.pet.ageYears,
                    ageMonths: data.pet.ageMonths,
                    color: data.pet.color,
                    sizeCategory: data.pet.sizeCategory,
                    isNeutered: data.pet.isNeutered,
                    isVaccinated: data.pet.isVaccinated,
                    vaccinationDetails: data.pet.vaccinationDetails,
                    description: data.pet.description,
                    rescueStory: '', // Not used for breeders
                    images: data.pet.images,
                    funFacts: [], // Not used for breeders
                    temperament: {
                        goodWithKids: data.pet.temperament.goodWithKids,
                        goodWithDogs: data.pet.temperament.goodWithDogs,
                        goodWithCats: data.pet.temperament.goodWithCats,
                        energyLevel: data.pet.temperament.energyLevel,
                        trainingLevel: data.pet.temperament.trainingLevel,
                        traits: data.pet.temperament.traits
                    }
                }
            };

            const response = await breederApi.createListing(dto);

            if (response.error) {
                throw new Error(response.error.message || 'Failed to create listing');
            }

            // Limit Enforcement
            if (response.data?.status === 'PendingPayment') {
                router.push(`/dashboard/pricing?listingId=${response.data.id}&type=breeder`);
                return;
            }

            router.push('/dashboard/breeder?success=listing-created');
        } catch (err: any) {
            console.error('Failed to create listing', err);
            alert(err.message || 'Failed to create listing');
        }
    };

    if (isLoading) return <div className="p-12 text-center">Loading...</div>;
    if (!isAuthenticated || !user?.isBreeder) return null;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Litter</h1>
            <BreederListingForm
                isSubmitting={false}
                onSubmit={handleSubmit}
                submitLabel="Post Listing"
            />
        </div>
    );
}

// NOTE: This now uses the specialized BreederListingForm.
// Title is auto-generated in the form handleSubmit before passing here,
// so data.title should be consistent with "{Breed} Puppies in {City}".
