import React from 'react';
import Link from 'next/link';
import { getBreedContent } from '@/data/breed-content';

interface SeoContentBlockProps {
    city?: string;
    breed?: string;
    petType?: string;
    allBreeds?: { id: string; name: string; slug: string }[];
    allCities?: { id: string; name: string; slug: string }[];
}

const CITY_INFO: Record<string, string> = {
    'mumbai': 'Mumbai has a vibrant pet community with numerous parks and pet-friendly cafes. Adoption drives are frequent.',
    'delhi': 'Delhi offers various resources for pet owners, including top-notch veterinary clinics, large parks, and dog runs.',
    'bangalore': 'Bangalore is known as a pet-friendly city with many active adoption communities, dog parks, and events.',
    'pune': 'Pune has a growing community of pet lovers and several NGOs dedicated to animal welfare.',
    'chennai': 'Chennai has active animal welfare organizations working tirelessly for rescues and adoptions.',
    'hyderabad': 'Hyderabad offers great spaces for pets, including the dedicated Dog Park, and a supportive community.',
    'kolkata': 'Kolkata has a deep love for animals with many compassionate shelters looking for adopters.',
    'gurgaon': 'Gurgaon has many pet-friendly societies and open spaces for your furry friends.',
    'noida': 'Noida offers a good environment for pets with growing awareness and facilities.',
    'ahmedabad': 'Ahmedabad is seeing a rise in pet adoption with more awareness and pet-friendly spots.',
    'jaipur': 'Jaipur has a warm community of animal lovers and several shelters doing great work.',
    'chandigarh': 'Chandigarh, with its greenery, is an excellent city for walking your dogs and enjoying the outdoors.',
};

export default function SeoContentBlock({ city, breed, petType, allBreeds = [], allCities = [] }: SeoContentBlockProps) {
    // Helpers
    const formatName = (slug: string) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const breedName = breed ? formatName(breed) : null;
    const cityName = city ? formatName(city) : null;
    const typeLabel = petType ? formatName(petType) : 'Pet';

    // Get Rich Content
    const breedContent = breed ? getBreedContent(breed, (petType === 'cat' ? 'cat' : 'dog')) : null;

    // Specific "About City" text
    const cityText = city && CITY_INFO[city.toLowerCase()]
        ? CITY_INFO[city.toLowerCase()]
        : cityName
            ? `Find lovable pets for adoption in ${cityName}. We connect you with local shelters and rescuers in the ${cityName} area.`
            : `We help you find pets for adoption across India. Whether you are in a metro or a smaller town, love is waiting for you.`;

    if (!breed && !city && !petType) return null;

    // Filter lists for footer links
    const relevantCities = allCities.length > 0 ? allCities : [
        { name: 'Mumbai', slug: 'mumbai' }, { name: 'Delhi', slug: 'delhi' },
        { name: 'Bangalore', slug: 'bangalore' }, { name: 'Pune', slug: 'pune' },
        { name: 'Chennai', slug: 'chennai' }, { name: 'Hyderabad', slug: 'hyderabad' },
        { name: 'Kolkata', slug: 'kolkata' }, { name: 'Gurgaon', slug: 'gurgaon' }
    ];

    const relevantBreeds = allBreeds.length > 0 ? allBreeds : [
        { name: 'Labrador', slug: 'labrador-retriever' }, { name: 'German Shepherd', slug: 'german-shepherd' },
        { name: 'Indie', slug: 'indie' }, { name: 'Persian', slug: 'persian' },
        { name: 'Shih Tzu', slug: 'shih-tzu' }, { name: 'Beagle', slug: 'beagle' }
    ];

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-12 mb-8">
            {/* Dynamic Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {breedName && cityName
                    ? `Adopt a ${breedName} in ${cityName}`
                    : breedName
                        ? `Everything You Need to Know About the ${breedName}`
                        : `Pet Adoption in ${cityName || 'India'}`
                }
            </h2>

            <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
                {/* 1. Breed Description */}
                {breedContent ? (
                    <>
                        <p>{breedContent.description}</p>

                        <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">History & Origins</h3>
                        <p>{breedContent.history}</p>

                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Temperament</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {breedContent.temperament.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Care Tips</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {breedContent.careTips.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>
                        </div>

                        {breedContent.funFact && (
                            <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
                                <p className="text-blue-800 font-medium">💡 Fun Fact: {breedContent.funFact}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <p>
                        Adopting a {typeLabel.toLowerCase()} is a life-changing decision.
                        Whether you are looking for a playful puppy or a calm senior dog, adoption saves a life and brings unconditional love into your home.
                    </p>
                )}

                {/* 2. City Context */}
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-2">
                    {cityName ? `Adoption in ${cityName}` : `Why Adopt?`}
                </h3>
                <p>{cityText}</p>

                <p>
                    At <strong>MyPaws</strong>, we verify all listings to ensure you find a healthy, happy companion.
                    {cityName && ` Browse our listings above to find ${typeLabel.toLowerCase()}s in ${cityName} today.`}
                </p>
            </div>

            {/* Dynamic Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Explore More</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {breed && !city && (
                        <>
                            {relevantCities.slice(0, 20).map(c => (
                                <Link
                                    key={c.slug} // Use slug for key
                                    href={`/adopt-a-pet?breed=${breed}&city=${c.slug}`}
                                    className="text-sm text-gray-500 hover:text-primary-600 hover:underline"
                                >
                                    {breedName} in {c.name || formatName(c.slug)}
                                </Link>
                            ))}
                        </>
                    )}
                    {city && !breed && (
                        <>
                            {relevantBreeds.slice(0, 20).map(b => (
                                <Link
                                    key={b.slug}
                                    href={`/adopt-a-pet?city=${city}&breed=${b.slug}`}
                                    className="text-sm text-gray-500 hover:text-primary-600 hover:underline"
                                >
                                    {b.name || formatName(b.slug)} in {cityName}
                                </Link>
                            ))}
                        </>
                    )}
                    {/* Fallback mixed links if neither or both */}
                    {(!breed && !city) && relevantBreeds.slice(0, 10).map(b => (
                        <Link key={b.slug} href={`/adopt-a-pet?breed=${b.slug}`} className="text-sm text-gray-500 hover:text-primary-600 hover:underline">
                            Adopt {b.name || formatName(b.slug)}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
