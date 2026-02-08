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

export interface ListingFormData {
    title: string;
    pet: {
        name: string;
        petTypeId: string;
        breedId: string | null;
        gender: 'male' | 'female';
        ageYears: number;
        ageMonths: number;
        color: string;
        sizeCategory: string;
        description: string;
        isNeutered: boolean;
        isVaccinated: boolean;
        vaccinationDetails: string;
        rescueStory: string;
        funFacts: string[];
        images: string[];
        temperament: Temperament;
    };
    cityId: string;
    adoptionFee: number | null;
    feeIncludes: string[];
    adopterRequirements: string;
    homeCheckRequired: boolean;
    faqs: FAQ[];
    submitForReview: boolean;
}

export const INITIAL_FORM_DATA: ListingFormData = {
    title: '',
    pet: {
        name: '',
        petTypeId: '',
        breedId: null,
        gender: 'male',
        ageYears: 0,
        ageMonths: 0,
        color: '',
        sizeCategory: 'medium',
        description: '',
        isNeutered: false,
        isVaccinated: false,
        vaccinationDetails: '',
        rescueStory: '',
        funFacts: [],
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
    adoptionFee: null,
    feeIncludes: [],
    adopterRequirements: '',
    homeCheckRequired: false,
    faqs: [],
    submitForReview: true,
};

interface ListingFormProps {
    initialData?: ListingFormData;
    onSubmit: (data: ListingFormData) => Promise<void>;
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

const FEE_INCLUDES_OPTIONS = [
    'Vaccination', 'Deworming', 'Microchip', 'Spay/Neuter',
    'Health certificate', 'Food starter pack'
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

export default function ListingForm({
    initialData = INITIAL_FORM_DATA,
    onSubmit,
    isSubmitting,
    submitLabel = 'Create Listing'
}: ListingFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ListingFormData>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reference data
    const [petTypes, setPetTypes] = useState<PetType[]>([]);
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [breedSearch, setBreedSearch] = useState('');
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [citySearch, setCitySearch] = useState('');
    const [loadingCities, setLoadingCities] = useState(false);

    // Fun fact input
    const [newFunFact, setNewFunFact] = useState('');

    // FAQ inputs
    const [newFaqQuestion, setNewFaqQuestion] = useState('');
    const [newFaqAnswer, setNewFaqAnswer] = useState('');

    // Image upload
    const [uploadedImages, setUploadedImages] = useState<{ url: string; fileName: string }[]>(
        initialData?.pet?.images?.map(url => ({ url, fileName: 'Existing Image' })) || []
    );
    const [uploadingImages, setUploadingImages] = useState(false);

    // Sync state with initialData when it changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setUploadedImages(
                initialData.pet?.images?.map(url => ({ url, fileName: 'Existing Image' })) || []
            );
            // Populate city if available in initialData (extended form data)
            if ((initialData as any).city) {
                setSelectedCity((initialData as any).city);
            }
        }
    }, [initialData]);

    // Filter breeds based on search
    const filteredBreeds = breeds.filter(b =>
        b.name.toLowerCase().includes(breedSearch.toLowerCase())
    );

    // Initial data loading
    useEffect(() => {
        const fetchPetTypes = async () => {
            try {
                const apiUrl = getInternalApiUrl_Client();
                // Fetch pet types
                const res = await fetch(`${apiUrl}/v1/public/pet-types`);
                if (res.ok) {
                    const data = await res.json();
                    setPetTypes(data);
                    if ((initialData as any).pet?.breedId) {
                        // We'll set the breed search to the breed name after we fetch breeds
                        // Or we can just leave it empty and let the user search if they want to change
                    }
                    // Auto-select first pet type if none selected
                    if (!formData.pet.petTypeId && data.length > 0) {
                        updatePetField('petTypeId', data[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch pet types', err);
            }
        }
        fetchPetTypes();
    }, []);

    // Fetch breeds when pet type changes
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
            } catch (err) {
                console.error('Failed to fetch breeds', err);
            }
        }
        fetchBreeds();
    }, [formData.pet.petTypeId]);

    // Search cities with debounce
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
            } catch (err) {
                console.error('Failed to search cities', err);
            } finally {
                setLoadingCities(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [citySearch]);

    // Update local state if initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // =============================================================
    // Form Handlers
    // =============================================================

    const updatePetField = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            pet: { ...prev.pet, [field]: value }
        }));
        // Clear error for this field
        if (errors[`pet.${field}`]) {
            setErrors(prev => ({ ...prev, [`pet.${field}`]: '' }));
        }
    };

    const updateRootField = (field: keyof ListingFormData, value: any) => {
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

    const addFunFact = () => {
        if (newFunFact.trim()) {
            updatePetField('funFacts', [...formData.pet.funFacts, newFunFact.trim()]);
            setNewFunFact('');
        }
    };

    const removeFunFact = (index: number) => {
        updatePetField('funFacts', formData.pet.funFacts.filter((_, i) => i !== index));
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

    const toggleFeeIncludes = (item: string) => {
        const current = formData.feeIncludes;
        const updated = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
        updateRootField('feeIncludes', updated);
    };

    // Image upload handler
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
        } catch (err) {
            console.error('Image upload error:', err);
        } finally {
            setUploadingImages(false);
        }
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
            if (!formData.pet.name.trim()) {
                newErrors['pet.name'] = 'Pet name is required';
            }
            if (!formData.pet.petTypeId) {
                newErrors['pet.petTypeId'] = 'Please select a pet type';
            }
            if (!formData.cityId) {
                newErrors['cityId'] = 'Please select a city';
            }
        }

        if (stepNum === 2) {
            if (!formData.pet.description || formData.pet.description.length < 50) {
                newErrors['pet.description'] = 'Description must be at least 50 characters';
            }
        }

        if (stepNum === 3) {
            if (!formData.title.trim()) {
                newErrors['title'] = 'Listing title is required';
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
            // Include uploaded images
            const dataToSubmit = {
                ...formData,
                pet: {
                    ...formData.pet,
                    images: uploadedImages.map(img => img.url)
                }
            };
            onSubmit(dataToSubmit);
        }
    };

    // =============================================================
    // Render Helpers
    // =============================================================

    // Selected city is already tracked in state above

    const stepLabels = ['Pet Info', 'Story & Details', 'Adoption Terms'];

    return (
        <div className="listing-form">
            {/* Step Indicator */}
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
                                            ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                                            ${isActive ? 'bg-primary-600 border-primary-600 text-white' : ''}
                                            ${!isActive && !isCompleted ? 'bg-white border-gray-300 text-gray-500' : ''}
                                            ${stepNum < step ? 'cursor-pointer hover:bg-green-700' : ''}
                                        `}
                                    >
                                        {isCompleted ? '✓' : stepNum}
                                    </button>
                                    {idx < stepLabels.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
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

                    {/* ========================================= */}
                    {/* STEP 1: Pet Info */}
                    {/* ========================================= */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Basic Pet Information</h3>

                            {/* Pet Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Pet Type *</label>
                                <div className="flex gap-4">
                                    {petTypes.map((pt) => (
                                        <button
                                            key={pt.id}
                                            type="button"
                                            onClick={() => {
                                                updatePetField('petTypeId', pt.id);
                                                updatePetField('breedId', null);
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
                                {errors['pet.petTypeId'] && <p className="text-red-500 text-sm mt-1">{errors['pet.petTypeId']}</p>}
                            </div>

                            {/* Pet Name */}
                            <div>
                                <label htmlFor="pet-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Pet Name *
                                </label>
                                <input
                                    type="text"
                                    id="pet-name"
                                    value={formData.pet.name}
                                    onChange={(e) => updatePetField('name', e.target.value)}
                                    placeholder="Enter your pet's name"
                                    className={`
                                        block w-full rounded-lg border px-4 py-3 text-gray-900 
                                        placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                                        ${errors['pet.name'] ? 'border-red-300' : 'border-gray-300'}
                                    `}
                                />
                                {errors['pet.name'] && <p className="text-red-500 text-sm mt-1">{errors['pet.name']}</p>}
                            </div>

                            {/* Breed Selection */}
                            <div className="relative">
                                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                                    Breed <span className="text-gray-400">(Optional - leave empty for Mixed/Unknown)</span>
                                </label>

                                {formData.pet.breedId ? (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <span className="font-medium text-blue-800">
                                            🐕 {breeds.find(b => b.id === formData.pet.breedId)?.name || 'Unknown Breed'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updatePetField('breedId', null);
                                                setBreedSearch('');
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search breed (e.g. Golden Retriever)..."
                                                value={breedSearch}
                                                onChange={(e) => setBreedSearch(e.target.value)}
                                                className="block w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            />
                                            {breedSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setBreedSearch('')}
                                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Dropdown results */}
                                        {breedSearch && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredBreeds.length > 0 ? (
                                                    <ul className="py-1 divide-y divide-gray-100">
                                                        <li
                                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-500 italic"
                                                            onClick={() => {
                                                                updatePetField('breedId', null); // Mixed/Unknown
                                                                setBreedSearch('');
                                                            }}
                                                        >
                                                            Unknown / Mixed Breed
                                                        </li>
                                                        {filteredBreeds.map((breed) => (
                                                            <li
                                                                key={breed.id}
                                                                onClick={() => {
                                                                    updatePetField('breedId', breed.id);
                                                                    setBreedSearch('');
                                                                }}
                                                                className="px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors"
                                                            >
                                                                <span className="font-medium text-gray-900">{breed.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                        No breeds found. <button type="button" onClick={() => updatePetField('breedId', null)} className="text-primary-600 hover:underline">Select Mixed/Unknown</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!breedSearch && (
                                            <p className="mt-1 text-xs text-gray-500">Type above to search for a breed.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Gender *</label>
                                <div className="flex gap-4">
                                    {['male', 'female'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => updatePetField('gender', g)}
                                            className={`
                                                flex-1 py-3 px-4 rounded-lg border-2 font-medium capitalize transition-all
                                                ${formData.pet.gender === g
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            {g === 'male' ? '♂ Male' : '♀ Female'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Age */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="age-years" className="block text-sm font-medium text-gray-700 mb-1">
                                        Age (Years)
                                    </label>
                                    <input
                                        type="number"
                                        id="age-years"
                                        min="0"
                                        max="25"
                                        value={formData.pet.ageYears}
                                        onChange={(e) => updatePetField('ageYears', parseInt(e.target.value) || 0)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="age-months" className="block text-sm font-medium text-gray-700 mb-1">
                                        Age (Months)
                                    </label>
                                    <input
                                        type="number"
                                        id="age-months"
                                        min="0"
                                        max="11"
                                        value={formData.pet.ageMonths}
                                        onChange={(e) => updatePetField('ageMonths', parseInt(e.target.value) || 0)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            {/* City Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                {formData.cityId && selectedCity ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <span className="font-medium text-green-800">
                                            📍 {selectedCity.name}, {selectedCity.state}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                updateRootField('cityId', '');
                                                setSelectedCity(null);
                                            }}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Search for your city..."
                                            value={citySearch}
                                            onChange={(e) => setCitySearch(e.target.value)}
                                            className={`
                                                block w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-primary-500
                                                bg-white text-gray-900 placeholder-gray-500
                                                ${errors['cityId'] ? 'border-red-300' : 'border-gray-300'}
                                            `}
                                        />
                                        {loadingCities && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
                                        {cities.length > 0 && (
                                            <ul className="mt-2 border border-gray-200 rounded-lg divide-y max-h-48 overflow-auto bg-white shadow-lg">
                                                {cities.map((city) => (
                                                    <li key={city.id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                updateRootField('cityId', city.id);
                                                                setSelectedCity(city);
                                                                setCitySearch('');
                                                                setCities([]);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-primary-50 hover:text-primary-700 text-gray-900 transition-colors"
                                                        >
                                                            {city.name}, {city.state}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                )}
                                {errors['cityId'] && <p className="text-red-500 text-sm mt-1">{errors['cityId']}</p>}
                            </div>

                            {/* Color & Size */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <input
                                        type="text"
                                        id="color"
                                        value={formData.pet.color}
                                        onChange={(e) => updatePetField('color', e.target.value)}
                                        placeholder="e.g., Golden, Black & White"
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                    <select
                                        id="size"
                                        value={formData.pet.sizeCategory}
                                        onChange={(e) => updatePetField('sizeCategory', e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                                    >
                                        {SIZE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Health Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.pet.isVaccinated}
                                        onChange={(e) => updatePetField('isVaccinated', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Vaccinated</span>
                                        <p className="text-xs text-gray-500">Has up-to-date vaccinations</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.pet.isNeutered}
                                        onChange={(e) => updatePetField('isNeutered', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Neutered / Spayed</span>
                                        <p className="text-xs text-gray-500">Has been fixed</p>
                                    </div>
                                </label>
                            </div>

                            {/* Image Upload Section */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    <PhotoIcon className="w-5 h-5 inline mr-2" />
                                    Pet Photos
                                </label>

                                {/* Upload Area */}
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    <input
                                        type="file"
                                        id="image-upload"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e.target.files)}
                                    />
                                    <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-900 font-medium">
                                        {uploadingImages ? 'Uploading...' : 'Click or drag images here'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Up to 10 images, max 10MB each. Will be auto-compressed.
                                    </p>
                                </div>

                                {/* Uploaded Images Preview */}
                                {uploadedImages.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {uploadedImages.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={img.url}
                                                    alt={img.fileName}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(img.url)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================= */}
                    {/* STEP 2: Story & Details */}
                    {/* ========================================= */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Tell Us About Your Pet</h3>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description / Bio *
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={formData.pet.description}
                                    onChange={(e) => updatePetField('description', e.target.value)}
                                    placeholder="Describe your pet's personality, habits, and what makes them special..."
                                    className={`
                                        block w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-primary-500
                                        ${errors['pet.description'] ? 'border-red-300' : 'border-gray-300'}
                                    `}
                                />
                                <div className="flex justify-between mt-1">
                                    <p className={`text-sm ${errors['pet.description'] ? 'text-red-500' : 'text-gray-500'}`}>
                                        {errors['pet.description'] || 'Minimum 50 characters'}
                                    </p>
                                    <span className="text-sm text-gray-400">{formData.pet.description.length} chars</span>
                                </div>
                            </div>

                            {/* Rescue Story */}
                            <div>
                                <label htmlFor="rescue-story" className="block text-sm font-medium text-gray-700 mb-1">
                                    Rescue Story <span className="text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    id="rescue-story"
                                    rows={3}
                                    value={formData.pet.rescueStory}
                                    onChange={(e) => updatePetField('rescueStory', e.target.value)}
                                    placeholder="If this is a rescue, share how you found them..."
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Fun Facts */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fun Facts</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newFunFact}
                                        onChange={(e) => setNewFunFact(e.target.value)}
                                        placeholder="Add a fun fact about your pet..."
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary-500"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFunFact())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addFunFact}
                                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.pet.funFacts.map((fact, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm">
                                            {fact}
                                            <button type="button" onClick={() => removeFunFact(idx)} className="text-amber-600 hover:text-amber-800">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Temperament */}
                            <div className="border-t pt-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Temperament & Compatibility</h4>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {TEMPERAMENT_OPTIONS.map(({ key, label, emoji }) => (
                                        <div key={key} className="flex flex-col gap-1">
                                            <span className="text-sm text-gray-600">{emoji} {label}</span>
                                            <div className="flex gap-1">
                                                {TEMPERAMENT_CHOICES.map(({ val, label: l, color }) => (
                                                    <button
                                                        key={String(val)}
                                                        type="button"
                                                        onClick={() => updateTemperament(key as keyof Temperament, val)}
                                                        className={`
                                                            flex-1 py-1 text-sm rounded border transition-all
                                                            ${formData.pet.temperament[key as keyof Temperament] === val
                                                                ? `bg-${color}-100 border-${color}-400 text-${color}-700`
                                                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                                            }
                                                        `}
                                                    >
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Energy Level</label>
                                        <select
                                            value={formData.pet.temperament.energyLevel || ''}
                                            onChange={(e) => updateTemperament('energyLevel', e.target.value || null)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">Select...</option>
                                            {ENERGY_LEVELS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Training Level</label>
                                        <select
                                            value={formData.pet.temperament.trainingLevel || ''}
                                            onChange={(e) => updateTemperament('trainingLevel', e.target.value || null)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">Select...</option>
                                            {TRAINING_LEVELS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Personality Traits</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAIT_OPTIONS.map((trait) => (
                                            <button
                                                key={trait}
                                                type="button"
                                                onClick={() => toggleTrait(trait)}
                                                className={`
                                                    px-3 py-1 rounded-full text-sm border transition-all
                                                    ${formData.pet.temperament?.traits?.includes(trait)
                                                        ? 'bg-primary-100 border-primary-400 text-primary-700'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                {trait}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================= */}
                    {/* STEP 3: Adoption Terms */}
                    {/* ========================================= */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Adoption Terms & FAQs</h3>

                            {/* Listing Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Listing Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => updateRootField('title', e.target.value)}
                                    placeholder={`e.g., Adopt ${formData.pet.name || 'Max'} - Loving ${formData.pet.gender === 'male' ? 'Boy' : 'Girl'} Needs Home`}
                                    className={`
                                        block w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-primary-500
                                        ${errors['title'] ? 'border-red-300' : 'border-gray-300'}
                                    `}
                                />
                                {errors['title'] && <p className="text-red-500 text-sm mt-1">{errors['title']}</p>}
                            </div>

                            {/* Adoption Fee */}
                            <div>
                                <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
                                    Adoption Fee (₹) <span className="text-gray-400">- Leave empty for free adoption</span>
                                </label>
                                <input
                                    type="number"
                                    id="fee"
                                    min="0"
                                    value={formData.adoptionFee ?? ''}
                                    onChange={(e) => updateRootField('adoptionFee', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder="0"
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Fee Includes */}
                            {(formData.adoptionFee ?? 0) > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee Includes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {FEE_INCLUDES_OPTIONS.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => toggleFeeIncludes(item)}
                                                className={`
                                                    px-3 py-1 rounded-full text-sm border transition-all
                                                    ${formData.feeIncludes?.includes(item)
                                                        ? 'bg-green-100 border-green-400 text-green-700'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Adopter Requirements */}
                            <div>
                                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                                    Adopter Requirements <span className="text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    id="requirements"
                                    rows={2}
                                    value={formData.adopterRequirements}
                                    onChange={(e) => updateRootField('adopterRequirements', e.target.value)}
                                    placeholder="e.g., Must have a fenced yard, prior experience with large dogs..."
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Home Check */}
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={formData.homeCheckRequired}
                                    onChange={(e) => updateRootField('homeCheckRequired', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div>
                                    <span className="font-medium text-gray-900">Home Check Required</span>
                                    <p className="text-xs text-gray-500">You want to visit the adopter's home before finalizing</p>
                                </div>
                            </label>

                            {/* FAQs */}
                            <div className="border-t pt-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">FAQs (Recommended)</h4>
                                <p className="text-sm text-gray-500 mb-4">Add common questions potential adopters might ask</p>

                                <div className="space-y-3 mb-4">
                                    {formData.faqs.map((faq, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg relative">
                                            <button
                                                type="button"
                                                onClick={() => removeFaq(idx)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                            <p className="font-medium text-gray-800">{faq.question}</p>
                                            <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 p-4 border border-dashed border-gray-300 rounded-lg">
                                    <input
                                        type="text"
                                        value={newFaqQuestion}
                                        onChange={(e) => setNewFaqQuestion(e.target.value)}
                                        placeholder="Question (e.g., Why is this pet up for adoption?)"
                                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                                    />
                                    <textarea
                                        rows={2}
                                        value={newFaqAnswer}
                                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                                        placeholder="Answer..."
                                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFaq}
                                        disabled={!newFaqQuestion.trim() || !newFaqAnswer.trim()}
                                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        + Add FAQ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900"
                        >
                            ← Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Submitting...' : submitLabel}
                        </button>
                    )}
                </div>
            </form >
        </div >
    );
}
