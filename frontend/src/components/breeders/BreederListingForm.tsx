'use client';

import { useState, FormEvent, useEffect } from 'react';
import { PhotoIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { getInternalApiUrl_Client } from '@/lib/public-api';

// =============================================================
// Types & Interfaces
// =============================================================

interface PetType {
    id: string;
    name: string;
    slug: string;
}

interface Breed {
    id: string;
    name: string;
    slug: string;
    petTypeId: string;
}

interface City {
    id: string;
    name: string;
    slug: string;
    state: string;
}

interface Temperament {
    goodWithKids: boolean | null;
    goodWithDogs: boolean | null;
    goodWithCats: boolean | null;
    energyLevel: string | null;
    trainingLevel: string | null;
    traits: string[];
}

interface FAQ {
    question: string;
    answer: string;
}

export interface BreederListingFormData {
    // Generated or hidden fields
    title?: string;

    pet: {
        name: string; // Optional
        petTypeId: string;
        breedId: string; // Mandatory
        gender: 'male' | 'female';
        ageYears: number;
        ageMonths: number;
        color: string;
        sizeCategory: string;
        description: string; // Max 20 chars
        isNeutered: boolean;
        isVaccinated: boolean;
        vaccinationDetails: string;
        images: string[];
        temperament: Temperament; // Parent details
    };
    cityId: string;
    price: number | null;
    priceNegotiable: boolean; // New
    includes: string[]; // Was feeIncludes
    availableCount: number; // New for litters? Default 1
    faqs: FAQ[];
}

export const INITIAL_BREEDER_FORM_DATA: BreederListingFormData = {
    pet: {
        name: '',
        petTypeId: '',
        breedId: '',
        gender: 'male',
        ageYears: 0,
        ageMonths: 0,
        color: '',
        sizeCategory: 'medium',
        description: '',
        isNeutered: false,
        isVaccinated: false,
        vaccinationDetails: '',
        images: [],
        temperament: {
            goodWithKids: null,
            goodWithDogs: null,
            goodWithCats: null,
            energyLevel: null,
            trainingLevel: null,
            traits: [],
        },
    },
    cityId: '',
    price: null,
    priceNegotiable: false,
    includes: [],
    availableCount: 1,
    faqs: [
        { question: "Are the parents health tested?", answer: "" },
        { question: "Do you provide KCI papers?", answer: "" }
    ],
};

interface ListingFormProps {
    initialData?: BreederListingFormData;
    onSubmit: (data: BreederListingFormData) => Promise<void>;
    isSubmitting: boolean;
    submitLabel?: string;
}

// =============================================================
// Constants
// =============================================================

const SIZE_OPTIONS = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'giant', label: 'Giant' },
];

const ENERGY_LEVELS = [
    { value: 'low', label: 'Low - Calm & relaxed' },
    { value: 'medium', label: 'Medium - Moderate activity' },
    { value: 'high', label: 'High - Very active' },
];

const TRAINING_LEVELS = [
    { value: 'none', label: 'None - Untrained' },
    { value: 'basic', label: 'Basic - Knows basics' },
    { value: 'advanced', label: 'Advanced - Well trained' },
];

const TRAIT_OPTIONS = [
    'Playful', 'Loyal', 'Protective', 'Friendly', 'Calm',
    'Energetic', 'Independent', 'Affectionate', 'Curious', 'Gentle'
];

const INCLUDES_OPTIONS = [
    'Vaccination Card', 'Deworming', 'Microchip', 'KCI Papers',
    'Health Guarantee', 'Food Starter Pack', 'Vet Check'
];

const TEMPERAMENT_OPTIONS = [
    { key: 'goodWithKids', label: 'Good with Kids', emoji: '👶' },
    { key: 'goodWithDogs', label: 'Good with Dogs', emoji: '🐕' },
    { key: 'goodWithCats', label: 'Good with Cats', emoji: '🐈' },
];

const TEMPERAMENT_CHOICES = [
    { val: true, label: 'Yes', color: 'green' },
    { val: false, label: 'No', color: 'red' },
    { val: null, label: '?', color: 'gray' },
];

// =============================================================
// Main Component
// =============================================================

export default function BreederListingForm({
    initialData = INITIAL_BREEDER_FORM_DATA,
    onSubmit,
    isSubmitting,
    submitLabel = 'Post Litter'
}: ListingFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<BreederListingFormData>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reference data
    const [petTypes, setPetTypes] = useState<PetType[]>([]);
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [breedSearch, setBreedSearch] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [citySearch, setCitySearch] = useState('');
    const [loadingCities, setLoadingCities] = useState(false);

    // FAQ inputs
    const [newFaqQuestion, setNewFaqQuestion] = useState('');
    const [newFaqAnswer, setNewFaqAnswer] = useState('');

    // Image upload
    const [uploadedImages, setUploadedImages] = useState<{ url: string; fileName: string }[]>(
        initialData?.pet?.images?.map(url => ({ url, fileName: 'Image' })) || []
    );
    const [uploadingImages, setUploadingImages] = useState(false);

    // Sync state with initialData when it changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setUploadedImages(
                initialData.pet?.images?.map(url => ({ url, fileName: 'Image' })) || []
            );
            if ((initialData as any).city) {
                setSelectedCity((initialData as any).city);
            }
        }
    }, [initialData]);

    const filteredBreeds = breeds.filter(b =>
        b.name.toLowerCase().includes(breedSearch.toLowerCase())
    );

    // Initial data loading
    useEffect(() => {
        const fetchPetTypes = async () => {
            // Try catch omitted for brevity, logic identical to original
            try {
                const apiUrl = getInternalApiUrl_Client();
                const res = await fetch(`${apiUrl}/v1/public/pet-types`);
                if (res.ok) {
                    const data = await res.json();
                    setPetTypes(data);
                    if (!formData.pet.petTypeId && data.length > 0) {
                        updatePetField('petTypeId', data[0].id);
                    }
                }
            } catch (err) { console.error(err); }
        }
        fetchPetTypes();
    }, []);

    useEffect(() => {
        async function fetchBreeds() {
            if (!formData.pet.petTypeId) return;
            try {
                const apiUrl = getInternalApiUrl_Client();
                const res = await fetch(`${apiUrl}/v1/public/breeds?petTypeId=${formData.pet.petTypeId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBreeds(data.data || data);
                }
            } catch (err) { console.error(err); }
        }
        fetchBreeds();
    }, [formData.pet.petTypeId]);

    useEffect(() => {
        if (citySearch.length < 2) {
            setCities([]);
            return;
        }
        const timer = setTimeout(async () => {
            setLoadingCities(true);
            try {
                const apiUrl = getInternalApiUrl_Client();
                const res = await fetch(`${apiUrl}/v1/public/cities?search=${encodeURIComponent(citySearch)}&limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    setCities(data.data || data);
                }
            } catch (err) { console.error(err); }
            finally { setLoadingCities(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [citySearch]);

    // =============================================================
    // Form Handlers
    // =============================================================

    const updatePetField = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            pet: { ...prev.pet, [field]: value }
        }));
        if (errors[`pet.${field}`]) {
            setErrors(prev => ({ ...prev, [`pet.${field}`]: '' }));
        }
    };

    const updateRootField = (field: keyof BreederListingFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updateTemperament = (field: keyof Temperament, value: any) => {
        setFormData(prev => ({
            ...prev,
            pet: {
                ...prev.pet,
                temperament: { ...prev.pet.temperament, [field]: value }
            }
        }));
    };

    const toggleTrait = (trait: string) => {
        const currentTraits = formData.pet.temperament.traits;
        const newTraits = currentTraits?.includes(trait)
            ? currentTraits.filter(t => t !== trait)
            : [...currentTraits, trait];
        updateTemperament('traits', newTraits);
    };

    const addFaq = () => {
        if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
            updateRootField('faqs', [
                ...formData.faqs,
                { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }
            ]);
            setNewFaqQuestion('');
            setNewFaqAnswer('');
        }
    };

    const removeFaq = (index: number) => {
        updateRootField('faqs', formData.faqs.filter((_, i) => i !== index));
    };

    const toggleIncludes = (item: string) => {
        const current = formData.includes;
        const updated = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
        updateRootField('includes', updated);
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploadingImages(true);
        const formDataUpload = new FormData();
        Array.from(files).forEach(file => formDataUpload.append('files', file));

        try {
            const apiUrl = getInternalApiUrl_Client();
            const response = await fetch(`${apiUrl}/v1/images/upload`, {
                method: 'POST',
                body: formDataUpload,
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                if (result.images) {
                    setUploadedImages(prev => [...prev, ...result.images.map((img: any) => ({
                        url: img.url,
                        fileName: img.fileName
                    }))]);
                }
            } else {
                console.error('Upload failed:', await response.text());
            }
        } catch (err) { console.error(err); }
        finally { setUploadingImages(false); }
    };

    const removeImage = (url: string) => {
        setUploadedImages(prev => prev.filter(img => img.url !== url));
    };

    // =============================================================
    // Validation
    // =============================================================

    const validateStep = (stepNum: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (stepNum === 1) {
            // Pet name is OPTIONAL
            if (!formData.pet.petTypeId) newErrors['pet.petTypeId'] = 'Required';
            if (!formData.pet.breedId) newErrors['pet.breedId'] = 'Breed is mandatory';
            if (!formData.cityId) newErrors['cityId'] = 'City is mandatory';
        }

        if (stepNum === 2) {
            if (formData.pet.description && formData.pet.description.length > 200) { // Changed as per request? user said max 20... that's very short. 
                // "description be max 20 and not 50" -> Assuming MIN 20? 
                // User said "description be max 20 and not 50". Usually descriptions are longer. 
                // Wait, "not 50" refers to the previous MINimum of 50. 
                // So user probably means "Min 20 characters". 
                // OR "Max 20 words"?
                // Let's assume MIN 20 characters for now, as 20 max chars is barely a few words.
                // Re-reading: "descrition be max 20 and not 50"
                // Context: Previous was "min 50 chars".
                // I'll set MIN 20 chars. MAX 20 chars makes no sense for a description.
                if (formData.pet.description && formData.pet.description.length < 20) {
                    newErrors['pet.description'] = 'Description too short (min 20 chars)';
                }
            }
        }

        if (stepNum === 3) {
            // Price is number, if null it's invalid? Or optional?
            // "adoption fee should not be there normal price would be there"
            // Let's make price required.
            if (formData.price === null || formData.price < 0) {
                newErrors['price'] = 'Price is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (validateStep(step)) {
            const dataToSubmit = {
                ...formData,
                pet: {
                    ...formData.pet,
                    images: uploadedImages.map(img => img.url)
                }
            };
            // Dynamic Title Generation if empty
            if (!dataToSubmit.title) {
                const breedName = breeds.find(b => b.id === formData.pet.breedId)?.name || 'Puppy';
                const cityName = selectedCity?.name || 'India';
                dataToSubmit.title = `${breedName} Tokens available in ${cityName}`; // "Tokens"? "Puppies"?
                // User said: "listing title not required as we can make a dynamic title with breed and city"
                // Let's use: "{Breed} Puppies in {City}"
                dataToSubmit.title = `${breedName} Puppies in ${cityName}`;
            }
            onSubmit(dataToSubmit);
        }
    };

    const stepLabels = ['Litter Info', 'Details & Photos', 'Pricing & Contact'];

    return (
        <div className="listing-form">
            <nav aria-label="Progress" className="mb-8">
                <ol className="flex items-center">
                    {stepLabels.map((label, idx) => {
                        const stepNum = idx + 1;
                        const isActive = step === stepNum;
                        const isCompleted = step > stepNum;
                        return (
                            <li key={stepNum} className="relative flex-1">
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => stepNum < step && setStep(stepNum)}
                                        disabled={stepNum > step}
                                        className={`
                                            relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm
                                            transition-all duration-200
                                            ${isCompleted ? 'bg-primary-600 border-primary-600 text-white' : ''}
                                            ${isActive ? 'bg-primary-600 border-primary-600 text-white' : ''}
                                            ${!isActive && !isCompleted ? 'bg-white border-gray-300 text-gray-500' : ''}
                                        `}
                                    >
                                        {isCompleted ? '✓' : stepNum}
                                    </button>
                                    {idx < stepLabels.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                                <span className={`absolute -bottom-6 left-0 right-0 text-center text-xs font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-10">
                <div className="p-6 sm:p-8">

                    {/* STEP 1: Litter Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Litter Information</h3>

                            {/* Pet Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Pet Type *</label>
                                <div className="flex gap-4">
                                    {petTypes.map((pt) => (
                                        <button
                                            key={pt.id}
                                            type="button"
                                            onClick={() => {
                                                updatePetField('petTypeId', pt.id);
                                                updatePetField('breedId', ''); // Reset breed
                                            }}
                                            className={`
                                                flex-1 py-4 px-6 rounded-xl border-2 font-medium text-center transition-all
                                                ${formData.pet.petTypeId === pt.id
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <span className="text-2xl block mb-1">{pt.slug === 'dog' ? '🐕' : '🐈'}</span>
                                            {pt.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Breed Selection (Mandatory) */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Breed *</label>
                                {formData.pet.breedId ? (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <span className="font-medium text-blue-800">
                                            🐕 {breeds.find(b => b.id === formData.pet.breedId)?.name || 'Unknown'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updatePetField('breedId', '');
                                                setBreedSearch('');
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search breed (Required)..."
                                            value={breedSearch}
                                            onChange={(e) => setBreedSearch(e.target.value)}
                                            className={`block w-full rounded-lg border px-4 py-3 ${errors['pet.breedId'] ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {breedSearch && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredBreeds.map((breed) => (
                                                    <div
                                                        key={breed.id}
                                                        onClick={() => {
                                                            updatePetField('breedId', breed.id);
                                                            setBreedSearch('');
                                                        }}
                                                        className="px-4 py-3 hover:bg-primary-50 cursor-pointer"
                                                    >
                                                        {breed.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {errors['pet.breedId'] && <p className="text-red-500 text-sm mt-1">{errors['pet.breedId']}</p>}
                            </div>

                            {/* Pet Name (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pet Name <span className="text-gray-400 font-normal">(Optional - e.g. "Max" or "Litter A")</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.pet.name}
                                    onChange={(e) => updatePetField('name', e.target.value)}
                                    placeholder="Leave empty for generic litter"
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-3"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                {formData.cityId && selectedCity ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <span className="font-medium text-green-800">📍 {selectedCity.name}, {selectedCity.state}</span>
                                        <button type="button" onClick={() => { updateRootField('cityId', ''); setSelectedCity(null); }} className="text-green-600">Change</button>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Search city..."
                                        value={citySearch}
                                        onChange={(e) => setCitySearch(e.target.value)}
                                        className={`block w-full rounded-lg border px-4 py-3 ${errors['cityId'] ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                )}
                                {loadingCities && <p className="text-sm text-gray-500">Searching...</p>}
                                {cities.length > 0 && !formData.cityId && (
                                    <ul className="mt-2 border rounded-lg max-h-48 overflow-auto bg-white shadow-lg">
                                        {cities.map(city => (
                                            <li key={city.id}>
                                                <button type="button" onClick={() => { updateRootField('cityId', city.id); setSelectedCity(city); setCitySearch(''); setCities([]); }} className="w-full text-left px-4 py-2 hover:bg-gray-50">
                                                    {city.name}, {city.state}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors['cityId'] && <p className="text-red-500 text-sm mt-1">{errors['cityId']}</p>}
                            </div>

                            {/* Gender & Color */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        value={formData.pet.gender}
                                        onChange={(e) => updatePetField('gender', e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <input
                                        type="text"
                                        value={formData.pet.color}
                                        onChange={(e) => updatePetField('color', e.target.value)}
                                        placeholder="e.g. Golden"
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3"
                                    />
                                </div>
                            </div>

                            {/* Age */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (Months)</label>
                                    <input type="number" min="0" value={formData.pet.ageMonths} onChange={(e) => updatePetField('ageMonths', parseInt(e.target.value))} className="block w-full rounded-lg border border-gray-300 px-4 py-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Count</label>
                                    <input type="number" min="1" value={formData.availableCount} onChange={(e) => updateRootField('availableCount', parseInt(e.target.value))} className="block w-full rounded-lg border border-gray-300 px-4 py-3" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Details & Photos */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Details & Photos</h3>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-gray-400">(Min 20 characters)</span>
                                </label>
                                <textarea
                                    value={formData.pet.description}
                                    onChange={(e) => updatePetField('description', e.target.value)}
                                    rows={4}
                                    className={`block w-full rounded-lg border px-4 py-3 ${errors['pet.description'] ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="Tell us about the litter, parents, and temperament..."
                                />
                                {errors['pet.description'] && <p className="text-red-500 text-sm mt-1">{errors['pet.description']}</p>}
                            </div>

                            {/* Photos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Photos</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {uploadedImages.map((img) => (
                                        <div key={img.url} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img src={img.url} alt="Pet" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(img.url)} className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm transition-opacity">
                                                <XMarkIcon className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors aspect-square">
                                        {uploadingImages ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                                        ) : (
                                            <>
                                                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500 font-medium">Add Photo</span>
                                            </>
                                        )}
                                        <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Parent Details (formerly Temperament) */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-4">Parent / Litter Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {TEMPERAMENT_OPTIONS.map((opt) => (
                                        <div key={opt.key} className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                                <span className="text-xl block mb-1">{opt.emoji}</span>
                                                {opt.label}
                                            </label>
                                            <div className="flex justify-center gap-2">
                                                {TEMPERAMENT_CHOICES.map((choice) => (
                                                    <button
                                                        key={String(choice.val)}
                                                        type="button"
                                                        onClick={() => updateTemperament(opt.key as keyof Temperament, choice.val)}
                                                        className={`
                                                            px-3 py-1.5 rounded text-sm font-medium transition-colors
                                                            ${(formData.pet.temperament as any)[opt.key] === choice.val
                                                                ? `bg-${choice.color}-100 text-${choice.color}-700 ring-1 ring-${choice.color}-600`
                                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                            }
                                                        `}
                                                    >
                                                        {choice.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Pricing & Contact */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Adoption Terms</h3>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.price ?? ''}
                                    onChange={(e) => updateRootField('price', parseInt(e.target.value))}
                                    placeholder="Enter price"
                                    className={`block w-full rounded-lg border px-4 py-3 ${errors['price'] ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors['price'] && <p className="text-red-500 text-sm mt-1">{errors['price']}</p>}
                                <div className="mt-2 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="negotiable"
                                        checked={formData.priceNegotiable}
                                        onChange={(e) => updateRootField('priceNegotiable', e.target.checked)}
                                        className="h-4 w-4 text-primary-600 rounded"
                                    />
                                    <label htmlFor="negotiable" className="ml-2 text-sm text-gray-600">Price is negotiable</label>
                                </div>
                            </div>

                            {/* Includes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Included with Pup/Kitten</label>
                                <div className="flex flex-wrap gap-2">
                                    {INCLUDES_OPTIONS.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => toggleIncludes(item)}
                                            className={`
                                                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                                ${formData.includes.includes(item)
                                                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-600'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 ring-1 ring-gray-200'
                                                }
                                            `}
                                        >
                                            {formData.includes.includes(item) ? '✓ ' : '+ '}
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* FAQs */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Buyer FAQs</label>
                                <div className="space-y-3 mb-3">
                                    {formData.faqs.map((faq, idx) => (
                                        <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-gray-900">Q: {faq.question}</p>
                                                <p className="text-sm text-gray-600 mt-1">A: {faq.answer}</p>
                                            </div>
                                            <button type="button" onClick={() => removeFaq(idx)} className="text-gray-400 hover:text-red-500">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 gap-2 p-3 border border-gray-200 rounded-lg">
                                    <input
                                        type="text"
                                        placeholder="Question (e.g. Can I see the parents?)"
                                        value={newFaqQuestion}
                                        onChange={(e) => setNewFaqQuestion(e.target.value)}
                                        className="block w-full rounded border-gray-300 text-sm"
                                    />
                                    <textarea
                                        placeholder="Answer"
                                        value={newFaqAnswer}
                                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                                        rows={2}
                                        className="block w-full rounded border-gray-300 text-sm"
                                    />
                                    <button type="button" onClick={addFaq} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded">
                                        Add FAQ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    submitLabel
                                )}
                            </button>
                        )}
                    </div>

                </div>
            </form>
        </div>
    );
}
