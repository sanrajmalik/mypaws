'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getClient } from '@/lib/client-api';
import ListingForm, { ListingFormData, INITIAL_FORM_DATA } from '@/components/dashboard/ListingForm';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [notFound, setNotFound] = useState(false);
    const [initialData, setInitialData] = useState<ListingFormData>(INITIAL_FORM_DATA);

    useEffect(() => {
        async function fetchListing() {
            try {
                const client = getClient();
                const { data, error } = await client.get<any>(`/v1/adoption-listings/${id}`);

                if (error || !data) {
                    setNotFound(true);
                    return;
                }

                // Transform API response to form data
                setInitialData({
                    title: data.title || '',
                    cityId: data.pet?.cityId || data.cityId || '',
                    adoptionFee: data.adoptionFee || null,
                    feeIncludes: data.feeIncludes || [],
                    adopterRequirements: data.adopterRequirements || '',
                    homeCheckRequired: data.homeCheckRequired || false,
                    submitForReview: true,
                    faqs: data.faqs || [],
                    pet: {
                        name: data.pet?.name || '',
                        petTypeId: data.pet?.petTypeId || '',
                        breedId: data.pet?.breedId || null,
                        gender: data.pet?.gender || 'male',
                        ageYears: data.pet?.ageYears || 0,
                        ageMonths: data.pet?.ageMonths || 0,
                        color: data.pet?.color || '',
                        sizeCategory: data.pet?.sizeCategory || 'medium',
                        description: data.pet?.description || '',
                        isNeutered: data.pet?.isNeutered || false,
                        isVaccinated: data.pet?.isVaccinated || false,
                        vaccinationDetails: data.pet?.vaccinationDetails || '',
                        rescueStory: data.pet?.rescueStory || '',
                        funFacts: data.pet?.funFacts || [],
                        temperament: data.pet?.temperament || {
                            goodWithKids: null,
                            goodWithDogs: null,
                            goodWithCats: null,
                            energyLevel: null,
                            trainingLevel: null,
                            traits: [],
                        },
                        images: data.pet?.images || [],
                    },
                    // Add city object for form pre-population
                    ...(data.city ? { city: data.city } : {})
                } as ListingFormData);
            } catch (err) {
                console.error("Failed to load listing", err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchListing();
        }
    }, [id]);

    const handleSubmit = async (formData: ListingFormData) => {
        setSubmitting(true);
        setError('');

        try {
            const client = getClient();

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

            const response = await client.put(`/v1/adoption-listings/${id}`, submissionData);

            if (response.error) {
                throw new Error(response.error.message || 'Failed to update listing');
            }

            router.push('/dashboard/listings');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
                    <div className="h-96 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
                <p className="text-gray-600 mb-6">The listing you're trying to edit doesn't exist or you don't have permission to edit it.</p>
                <button
                    onClick={() => router.push('/dashboard/listings')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                    Back to My Listings
                </button>
            </div>
        );
    }

    return (
        <>
            <title>Edit Listing | mypaws</title>

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Listing
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Update your pet's adoption listing details below.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6 rounded-r-lg">
                        <p className="font-medium">Error updating listing</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <ListingForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                    submitLabel="Update Listing"
                />
            </div>
        </>
    );
}
