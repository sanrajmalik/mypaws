import React from 'react';
import Link from 'next/link';
import { getBreedContent } from '@/data/breed-content';

interface BreederSeoContentBlockProps {
    city?: string;
    breed?: string;
    petType: 'dog' | 'cat';
    allBreeds?: { id: string; name: string; slug: string }[];
    allCities?: { id: string; name: string; slug: string }[];
}

const CITY_INFO: Record<string, string> = {
    'mumbai': 'Mumbai offers a network of ethical breeders and pet shops. Ensure you visit the facility personally before making a decision.',
    'delhi': 'Delhi has many options for buying pets, but it is crucial to verify the breeder\'s credentials to avoid puppy mills.',
    'bangalore': 'Bangalore has a strong community of responsible pet owners. Look for breeders who prioritize health and temperament.',
    'pune': 'Pune is home to many reputable breeders. Always ask for health records and vaccination history.',
    'chennai': 'In Chennai, focus on breeders who provide a clean and healthy environment for their animals.',
    'hyderabad': 'Hyderabad has reliable breeders, but ensure you ask about the lineage and health guarantees.',
    'kolkata': 'Kolkata has a growing market for pets. Verify the authenticity of the breed and the health of the puppy/kitten.',
    'gurgaon': 'Gurgaon offers premium pet options. Insist on seeing the parents and the living conditions.',
    'noida': 'Noida has several breeders; prioritizing those who offer post-sale support and health warranties is wise.',
    'ahmedabad': 'Ahmedabad is seeing more ethical breeding practices. Support breeders who treat their animals with love and care.',
    'jaipur': 'In Jaipur, look for small-scale hobby breeders who raise puppies/kittens in a home environment.',
    'chandigarh': 'Chandigarh is known for quality pets. Ensure all paperwork, including KCI registration (for dogs), is in order.',
};

export default function BreederSeoContentBlock({ city, breed, petType, allBreeds = [], allCities = [] }: BreederSeoContentBlockProps) {
    // Helpers
    const formatName = (slug: string) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const breedName = breed ? formatName(breed) : null;
    const cityName = city ? formatName(city) : null;
    const typeLabel = petType === 'dog' ? 'Puppy' : 'Kitten';
    const typeLabelPlural = petType === 'dog' ? 'Puppies' : 'Kittens';

    // Get Rich Content
    const breedContent = breed ? getBreedContent(breed, petType) : null;
    const buyingInfo = breedContent?.buyingInfo;

    // Specific "About City" text
    const cityText = city && CITY_INFO[city.toLowerCase()]
        ? CITY_INFO[city.toLowerCase()]
        : cityName
            ? `Finding a healthy ${typeLabel.toLowerCase()} in ${cityName} requires research. We connect you with verified ethical breeders in the ${cityName} area.`
            : `We help you find healthy ${typeLabelPlural.toLowerCase()} for sale across India. Prioritizing ethical breeding ensures you get a happy, healthy companion.`;

    if (!breed && !city) return null;

    // Filter lists for footer links
    const relevantCities = allCities.length > 0 ? allCities : [
        { name: 'Mumbai', slug: 'mumbai' }, { name: 'Delhi', slug: 'delhi' },
        { name: 'Bangalore', slug: 'bangalore' }, { name: 'Pune', slug: 'pune' },
        { name: 'Chennai', slug: 'chennai' }, { name: 'Hyderabad', slug: 'hyderabad' },
        { name: 'Kolkata', slug: 'kolkata' }, { name: 'Gurgaon', slug: 'gurgaon' }
    ];

    const relevantBreeds = allBreeds.length > 0 ? allBreeds : [
        { name: 'Labrador', slug: 'labrador-retriever' }, { name: 'German Shepherd', slug: 'german-shepherd' },
        { name: 'Shih Tzu', slug: 'shih-tzu' }, { name: 'Golden Retriever', slug: 'golden-retriever' },
        { name: 'Husky', slug: 'husky' }, { name: 'Beagle', slug: 'beagle' }
    ];

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-12 mb-8">
            {/* Dynamic Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {breedName && cityName
                    ? `Buy ${breedName} ${typeLabelPlural} in ${cityName}`
                    : breedName
                        ? `${breedName} Price, Care & Buying Guide`
                        : `${typeLabelPlural} for Sale in ${cityName || 'India'}`
                }
            </h2>

            <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
                {/* 1. Breed Buying Context */}
                {breedContent && buyingInfo ? (
                    <>
                        <p>{breedContent.description}</p>

                        <div className="my-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                            <h3 className="text-lg font-bold text-green-900 mb-2">💰 {breedName} Price in India</h3>
                            <p className="text-green-800">
                                The average price of a <strong>{breedName} {typeLabel.toLowerCase()}</strong> in India ranges from <strong>{buyingInfo.priceRange}</strong>.
                                Prices depend on lineage, KCI registration (for dogs), and breeder reputation.
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">How to Care for a {breedName} {typeLabel}</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {(petType === 'dog' ? buyingInfo.puppyCare : buyingInfo.kittenCare)?.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Breeder Checklist</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {buyingInfo.checklist.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </>
                ) : (
                    <p>
                        Buying a {typeLabel.toLowerCase()} is a long-term commitment.
                        Ensure you choose a responsible breeder who prioritizes the health and well-being of their animals.
                    </p>
                )}

                {/* 2. City Context */}
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-2">
                    {cityName ? `Where to Buy in ${cityName}?` : `finding the Right Breeder`}
                </h3>
                <p>{cityText}</p>

                <p>
                    At <strong>MyPaws</strong>, we verify all breeders to ensure ethical standards.
                    {cityName && ` Browse our listings above to find healthy ${breedName || typeLabelPlural.toLowerCase()} in ${cityName} today.`}
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
                                    key={c.slug}
                                    href={`/buy-${petType}s?breed=${breed}&city=${c.slug}`}
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
                                    href={`/buy-${petType}s?city=${city}&breed=${b.slug}`}
                                    className="text-sm text-gray-500 hover:text-primary-600 hover:underline"
                                >
                                    {b.name || formatName(b.slug)} in {cityName}
                                </Link>
                            ))}
                        </>
                    )}
                    {(!breed && !city) && relevantBreeds.slice(0, 10).map(b => (
                        <Link key={b.slug} href={`/buy-${petType}s?breed=${b.slug}`} className="text-sm text-gray-500 hover:text-primary-600 hover:underline">
                            Buy {b.name || formatName(b.slug)}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
