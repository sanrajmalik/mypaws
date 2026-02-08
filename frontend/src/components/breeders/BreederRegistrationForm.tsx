'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { breederApi } from '@/lib/breeder-api';
import { getInternalApiUrl_Client } from '@/lib/public-api';
import { CreateBreederApplicationDto } from '@/types/breeder';
import { XMarkIcon, CheckCircleIcon, PhotoIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';

// =============================================================
// Interfaces
// =============================================================

interface City {
    id: string;
    name: string;
    slug: string;
    state: string;
}

interface Breed {
    id: string;
    name: string;
    slug: string;
}

export default function BreederRegistrationForm() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    // Auth Check
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login?redirect=/breeders/register');
        }
    }, [isLoading, isAuthenticated, router]);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [formData, setFormData] = useState<CreateBreederApplicationDto>({
        businessName: '',
        kennelName: '',
        yearsExperience: 0,
        description: '',
        businessPhone: '',
        businessEmail: '',
        websiteUrl: '',
        cityId: '',
        address: '',
        pincode: '',
        breedIds: [],
        documentUrls: {},
        agreeToEthicalStandards: false
    });

    // Reference Data State
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [citySearch, setCitySearch] = useState('');
    const [loadingCities, setLoadingCities] = useState(false);

    const [allBreeds, setAllBreeds] = useState<Breed[]>([]);
    const [filteredBreeds, setFilteredBreeds] = useState<Breed[]>([]);
    const [breedSearch, setBreedSearch] = useState('');
    const [selectedBreeds, setSelectedBreeds] = useState<Breed[]>([]);

    // Image Upload State
    const [uploadingDocs, setUploadingDocs] = useState(false);

    // =============================================================
    // Data Fetching
    // =============================================================

    // Load Breeds
    useEffect(() => {
        async function fetchBreeds() {
            try {
                const res = await fetch(`${getInternalApiUrl_Client()}/v1/public/breeds`);
                if (res.ok) {
                    const data = await res.json();
                    setAllBreeds(data.data || data);
                }
            } catch (err) {
                console.error('Failed to fetch breeds', err);
            }
        }
        fetchBreeds();
    }, []);

    // Filter breeds
    useEffect(() => {
        if (!breedSearch) {
            setFilteredBreeds([]);
            return;
        }
        setFilteredBreeds(allBreeds.filter(b =>
            b.name.toLowerCase().includes(breedSearch.toLowerCase()) &&
            !formData.breedIds.includes(b.id)
        ));
    }, [breedSearch, allBreeds, formData.breedIds]);

    // Search Cities
    useEffect(() => {
        if (citySearch.length < 2) {
            setCities([]);
            return;
        }
        const timer = setTimeout(async () => {
            setLoadingCities(true);
            try {
                const res = await fetch(`${getInternalApiUrl_Client()}/v1/public/cities?search=${encodeURIComponent(citySearch)}&limit=10`);
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

    // =============================================================
    // Handlers
    // =============================================================

    const updateField = (field: keyof CreateBreederApplicationDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleBreedSelect = (breed: Breed) => {
        const newIds = [...formData.breedIds, breed.id];
        updateField('breedIds', newIds);
        setSelectedBreeds(prev => [...prev, breed]);
        setBreedSearch('');
    };

    const handleBreedRemove = (breedId: string) => {
        updateField('breedIds', formData.breedIds.filter(id => id !== breedId));
        setSelectedBreeds(prev => prev.filter(b => b.id !== breedId));
    };

    const handleCitySelect = (city: City) => {
        updateField('cityId', city.id);
        setSelectedCity(city);
        setCitySearch('');
        setCities([]);
    };

    const handleDocUpload = async (key: string, files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploadingDocs(true);
        const formDataUpload = new FormData();
        formDataUpload.append('files', files[0]);

        try {
            const res = await fetch(`${getInternalApiUrl_Client()}/v1/images/upload`, {
                method: 'POST',
                body: formDataUpload,
                credentials: 'include'
            });
            if (res.ok) {
                const result = await res.json();
                if (result.images && result.images.length > 0) {
                    updateField('documentUrls', {
                        ...formData.documentUrls,
                        [key]: result.images[0].url
                    });
                }
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed, please try again.');
        } finally {
            setUploadingDocs(false);
        }
    };

    // =============================================================
    // Validation & Submission
    // =============================================================

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) { // Basic Info
            if (!formData.businessName.trim()) newErrors.businessName = 'Business Name is required';
            if (formData.yearsExperience < 0) newErrors.yearsExperience = 'Years cannot be negative';

            // Phone validation
            const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
            if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Phone number is required';
            else if (!phoneRegex.test(formData.businessPhone)) newErrors.businessPhone = 'Please enter a valid phone number';

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Email is required';
            else if (!emailRegex.test(formData.businessEmail)) newErrors.businessEmail = 'Please enter a valid email address';

            // Website optional but format check
            if (formData.websiteUrl && !formData.websiteUrl.startsWith('http')) {
                // simple check, could be cleaner
                // newErrors.websiteUrl = 'URL must start with http:// or https://'; 
                // Auto-fix or warn? Let's just warn for now or let it slide if user fixes
            }
        }

        if (currentStep === 2) { // Breeds & Location
            if (formData.breedIds.length === 0) newErrors.breedIds = 'Please select at least one breed';
            if (!formData.cityId) newErrors.cityId = 'Please select your city';
            if (!formData.address.trim()) newErrors.address = 'Street address is required';
            if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
            else if (formData.pincode.length < 5) newErrors.pincode = 'Pincode looks too short';
        }

        if (currentStep === 3) { // Docs & Terms
            if (!formData.description.trim() || formData.description.length < 50)
                newErrors.description = 'Please provide a detailed description (min 50 chars) of your breeding practices.';

            // Uncomment if mandatory
            // if (Object.keys(formData.documentUrls).length === 0) newErrors.docs = 'Please upload at least one document (ID/Proof)';

            if (!formData.agreeToEthicalStandards) newErrors.agreeToEthicalStandards = 'You must agree to the Ethical Breeder Standards to proceed.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) setStep(prev => prev + 1);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateStep(step)) return;

        setIsSubmitting(true);
        // Clear previous errors
        setErrors({});

        try {
            await breederApi.apply(formData);
            router.push('/dashboard/breeder?success=true');
        } catch (err: any) {
            console.error('Submission error:', err);

            // Handle 400 Validation Errors
            if (err.details && err.details.errors) {
                const backendErrors = err.details.errors;
                const newErrors: Record<string, string> = {};

                // Map backend errors to form fields
                for (const [key, messages] of Object.entries(backendErrors)) {
                    // Convert PascalCase key to camelCase (e.g. WebsiteUrl -> websiteUrl)
                    const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                    if (Array.isArray(messages)) {
                        newErrors[fieldName] = messages[0];
                    }
                }

                setErrors(prev => ({ ...prev, ...newErrors }));

                // If error is in a previous step, go back? 
                // For now, most fields are in step 1/2.
                // Let's check where the errors are to be helpful
                const step1Fields = ['businessName', 'kennelName', 'yearsExperience', 'businessPhone', 'businessEmail', 'websiteUrl'];
                const step2Fields = ['cityId', 'address', 'pincode', 'breedIds'];

                const hasStep1Error = Object.keys(newErrors).some(k => step1Fields.includes(k));
                if (hasStep1Error) setStep(1);
                else {
                    const hasStep2Error = Object.keys(newErrors).some(k => step2Fields.includes(k));
                    if (hasStep2Error) setStep(2);
                }

                // Show a toast or generic message too
                // alert('Please correct the highlighted errors.'); 
            } else {
                alert(err.message || 'Submission failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-gray-500">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    // =============================================================
    // Rendering
    // =============================================================

    const steps = ['Basic Info', 'Location & Breeds', 'Verification'];

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {steps.map((label, idx) => {
                        const isCompleted = step > idx + 1;
                        const isCurrent = step === idx + 1;
                        return (
                            <span key={idx} className={`text-sm font-medium ${isCompleted ? 'text-primary-600' : isCurrent ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
                                {isCompleted ? '✓ ' : ''}{label}
                            </span>
                        );
                    })}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-600 transition-all duration-300 ease-out"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-card bg-white p-6 md:p-8 space-y-8 animate-fadeIn">

                {/* STEP 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Tell us about your breeding program</h2>
                            <p className="text-gray-500 text-sm mt-1">We want to partner with responsible breeders.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Business/Kennel Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={e => updateField('businessName', e.target.value)}
                                    className={`w-full rounded-lg border ${errors.businessName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'} focus:border-primary-500 p-2.5 transition-colors`}
                                    placeholder="e.g. Royal Retrievers"
                                />
                                {errors.businessName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.businessName}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Kennel Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={formData.kennelName || ''}
                                    onChange={e => updateField('kennelName', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 p-2.5 transition-colors"
                                    placeholder="If registered with KCI, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.yearsExperience}
                                    onChange={e => updateField('yearsExperience', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 p-2.5 transition-colors"
                                />
                                {errors.yearsExperience && <p className="text-red-500 text-xs mt-1 font-medium">{errors.yearsExperience}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    type="url"
                                    value={formData.websiteUrl || ''}
                                    onChange={e => updateField('websiteUrl', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 p-2.5 transition-colors"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    value={formData.businessPhone}
                                    onChange={e => updateField('businessPhone', e.target.value)}
                                    className={`w-full rounded-lg border ${errors.businessPhone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'} focus:border-primary-500 p-2.5 transition-colors`}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                                {errors.businessPhone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.businessPhone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={formData.businessEmail}
                                    onChange={e => updateField('businessEmail', e.target.value)}
                                    className={`w-full rounded-lg border ${errors.businessEmail ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'} focus:border-primary-500 p-2.5 transition-colors`}
                                    placeholder="contact@example.com"
                                />
                                {errors.businessEmail && <p className="text-red-500 text-xs mt-1 font-medium">{errors.businessEmail}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Location & Breeds */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Location & Breeds</h2>
                            <p className="text-gray-500 text-sm mt-1">Help buyers find you based on location and breed preferences.</p>
                        </div>

                        {/* City Search */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                            {selectedCity ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg group hover:border-green-300 transition-colors">
                                    <span className="font-medium text-green-800 flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        {selectedCity.name}, {selectedCity.state}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedCity(null); updateField('cityId', ''); }}
                                        className="text-sm font-medium text-green-700 hover:text-green-900 underline decoration-green-300 hover:decoration-green-800"
                                    >Change</button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={citySearch}
                                    onChange={e => setCitySearch(e.target.value)}
                                    placeholder="Search your city..."
                                    className={`w-full rounded-lg border ${errors.cityId ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'} focus:border-primary-500 p-2.5 transition-colors`}
                                />
                            )}
                            {loadingCities && <p className="text-sm text-gray-500 mt-1 animate-pulse">Searching...</p>}
                            {cities.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto divide-y divide-gray-100">
                                    {cities.map(city => (
                                        <li key={city.id} onClick={() => handleCitySelect(city)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col">
                                            <span className="font-medium text-gray-900">{city.name}</span>
                                            <span className="text-xs text-gray-500">{city.state}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {errors.cityId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.cityId}</p>}
                        </div>

                        {/* Address & Pincode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => updateField('address', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 p-2.5 transition-colors"
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={e => updateField('pincode', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 p-2.5 transition-colors"
                                />
                                {errors.pincode && <p className="text-red-500 text-xs mt-1 font-medium">{errors.pincode}</p>}
                            </div>
                        </div>

                        {/* Breed Multi-Select */}
                        <div className="relative pt-4 border-t border-gray-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Breeds you raise <span className="text-red-500">*</span></label>

                            {/* Selected Chips */}
                            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                                {selectedBreeds.map(breed => (
                                    <span key={breed.id} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                        {breed.name}
                                        <button type="button" onClick={() => handleBreedRemove(breed.id)} className="ml-2 text-orange-600 hover:text-orange-900 focus:outline-none">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                                {selectedBreeds.length === 0 && <span className="text-gray-400 italic text-sm py-1.5">No breeds selected yet</span>}
                            </div>

                            <input
                                type="text"
                                value={breedSearch}
                                onChange={e => setBreedSearch(e.target.value)}
                                placeholder="Search & add breeds (e.g. Labrador, Persian)..."
                                className="w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 p-2.5 transition-colors"
                            />

                            {filteredBreeds.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto divide-y divide-gray-100">
                                    {filteredBreeds.map(breed => (
                                        <li key={breed.id} onClick={() => handleBreedSelect(breed)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group">
                                            <span>{breed.name}</span>
                                            <span className="text-primary-500 opacity-0 group-hover:opacity-100">+ Add</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {errors.breedIds && <p className="text-red-500 text-xs mt-1 font-medium">{errors.breedIds}</p>}
                        </div>
                    </div>
                )}

                {/* STEP 3: Docs & Terms */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Verification & Terms</h2>
                            <p className="text-gray-500 text-sm mt-1">Final step to join our community.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">About your program <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.description}
                                onChange={e => updateField('description', e.target.value)}
                                rows={6}
                                className={`w-full rounded-lg border ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'} focus:border-primary-500 p-2.5 transition-colors`}
                                placeholder="Tell us about your breeding philosophy, how you raise your puppies/kittens, health testing, etc."
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                            <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length} chars</p>
                        </div>

                        {/* Document Upload */}
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center text-center">
                                <DocumentArrowUpIcon className={`w-12 h-12 mb-3 ${formData.documentUrls['id_proof'] ? 'text-green-500' : 'text-gray-400'}`} />
                                <h3 className="font-medium text-gray-900 mb-1">Identity Proof (Govt. ID)</h3>
                                <p className="text-xs text-gray-500 mb-4">Upload Aadhaar, PAN, or Driving License to verify your identity.</p>

                                <label className="cursor-pointer">
                                    <span className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                        {uploadingDocs ? 'Uploading...' : formData.documentUrls['id_proof'] ? 'Change File' : 'Select File'}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={e => handleDocUpload('id_proof', e.target.files)}
                                        disabled={uploadingDocs}
                                    />
                                </label>
                                {formData.documentUrls['id_proof'] && <p className="text-green-600 text-sm mt-3 font-medium flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" /> Upload Successful</p>}
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={formData.agreeToEthicalStandards}
                                        onChange={e => updateField('agreeToEthicalStandards', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-semibold text-gray-900 cursor-pointer">I agree to the Ethical Breeder Standards</label>
                                    <p className="text-gray-600 mt-1 leading-relaxed">I confirm that I prioritize the health and welfare of my animals above strict profit motives. I understand that misrepresentation will result in an immediate ban.</p>
                                </div>
                            </div>
                            {errors.agreeToEthicalStandards && <p className="text-red-500 text-xs mt-2 ml-8 font-bold">{errors.agreeToEthicalStandards}</p>}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="mt-8 pt-4 flex justify-between border-t border-gray-100">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(prev => prev - 1)}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                        >
                            Back
                        </button>
                    ) : <div></div>}

                    {step < steps.length ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-8 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-colors"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
}
