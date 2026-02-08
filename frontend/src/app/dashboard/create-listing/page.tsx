'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getClient } from '@/lib/client-api';
import ListingForm, { ListingFormData } from '@/components/dashboard/ListingForm';

export default function CreateListingPage() {
    const router = useRouter();
    const { user, isLoading } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && user && !user.phone) {
            router.push('/dashboard/settings?prompt=phone');
        }
    }, [isLoading, user, router]);

    const handleSubmit = async (formData: ListingFormData) => {
        setSubmitting(true);
        setError('');

        try {
            const client = getClient();

            // Transform form data to match backend DTO
            const submissionData = {
                title: formData.title,
                cityId: formData.cityId,
                adoptionFee: formData.adoptionFee,
                feeIncludes: formData.feeIncludes.length > 0 ? formData.feeIncludes : null,
                adopterRequirements: formData.adopterRequirements || null,
                homeCheckRequired: formData.homeCheckRequired,
                submitForReview: formData.submitForReview,
                pet: {
                    name: formData.pet.name,
                    petTypeId: formData.pet.petTypeId,
                    breedId: formData.pet.breedId || null,
                    gender: formData.pet.gender,
                    ageYears: formData.pet.ageYears || null,
                    ageMonths: formData.pet.ageMonths || null,
                    color: formData.pet.color || null,
                    sizeCategory: formData.pet.sizeCategory || null,
                    isNeutered: formData.pet.isNeutered,
                    isVaccinated: formData.pet.isVaccinated,
                    vaccinationDetails: formData.pet.vaccinationDetails || null,
                    temperament: formData.pet.temperament.energyLevel ? formData.pet.temperament : null,
                    funFacts: formData.pet.funFacts.length > 0 ? formData.pet.funFacts : null,
                    rescueStory: formData.pet.rescueStory || null,
                    description: formData.pet.description || null,
                    images: formData.pet.images,
                },
                faqs: formData.faqs.length > 0 ? formData.faqs : null,
            };

            const response = await client.post<any>('/v1/adoption-listings', submissionData);

            if (response.error) {
                throw new Error(response.error.message || 'Failed to create listing');
            }

            // If PendingPayment, we MUST pay.
            // If Active, we redirect to pricing for Upsell opportunity (Featured).
            router.push(`/dashboard/pricing?listingId=${response.data.id}&type=adoption${response.data.status === 'PendingPayment' ? '' : '&new=true'}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* SEO metadata handled by layout/metadata export in real SSR */}
            <title>Create Adoption Listing | mypaws</title>

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create Adoption Listing
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Help your pet find their forever home. Fill out the details below.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6 rounded-r-lg">
                        <p className="font-medium">Error creating listing</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <ListingForm onSubmit={handleSubmit} isSubmitting={submitting} />
            </div>
        </>
    );
}
