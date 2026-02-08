import React from 'react';
import Link from 'next/link';

interface SeoContentBlockProps {
    city?: string;
    breed?: string;
    petType?: string;
    allBreeds?: { id: string; name: string; slug: string }[];
    allCities?: { id: string; name: string; slug: string }[];
}

const BREED_INFO: Record<string, string> = {
    // Dogs
    'golden-retriever': 'Golden Retrievers are friendly, intelligent, and devoted dogs. They are excellent family pets and are known for their gentle nature.',
    'german-shepherd': 'German Shepherds are confident, courageous, and smart. They are loyal guardians and versatile working dogs.',
    'labrador-retriever': 'Labrador Retrievers are friendly, active, and outgoing. They are one of the most popular breeds due to their affectionate nature.',
    'beagle': 'Beagles are curious, clever, and energetic hounds. They are great companions but need plenty of exercise and mental stimulation.',
    'husky': 'Siberian Huskies are affectionate, outgoing, and friendly. They are high-energy dogs that need plenty of exercise.',
    'siberian-husky': 'Siberian Huskies are affectionate, outgoing, and friendly. They are high-energy dogs that need plenty of exercise.',
    'indie': 'Indie dogs (Indian Pariah) are extremely hardy, intelligent, and adaptable. They make loyal, low-maintenance pets perfectly suited for the Indian climate.',
    'indian-pariah': 'The Indian Pariah dog is a natural breed perfect for the Indian climate. They are healthy, intelligent, and very loyal.',
    'shih-tzu': 'Shih Tzus are affectionate, playful, and outgoing house dogs who love nothing more than following their people from room to room.',
    'pomeranian': 'Pomeranians are cocky, animated companions with an extroverted personality. They are small but active.',
    'rottweiler': 'Rottweilers are loyal, loving, and confident guardians. They are silly with their family but protective of their territory.',
    'pug': 'Pugs are charming, mischievous, and loving. They are ideal house dogs who require minimal exercise but lots of love.',
    'doberman': 'Doberman Pinschers are powerful, energetic, and intelligent. They are loyal guardians who need plenty of interaction.',
    'boxer': 'Boxers are fun-loving, bright, and active. They are patient with children and protective of their families.',
    'great-dane': 'Great Danes are gentle giants. Despite their size, they are sweet, affectionate, and great family pets.',
    'cocker-spaniel': 'Cocker Spaniels are gentle, loving, and trustworthy family companions with a happy disposition.',
    'dachshund': 'Dachshunds are spunky, curious, and friendly. They are small but brave and make excellent watchdogs.',

    // Cats
    'persian': 'Persian cats are known for their gentle, sweet nature and luxurious long coats. They require regular grooming but make wonderful indoor companions.',
    'siamese': 'Siamese cats are social, vocal, and intelligent. They love interaction and are often compared to dogs in their loyalty.',
    'maine-coon': 'Maine Coons are gentle giants of the cat world. They are friendly, playful, and get along well with children and other pets.',
    'bengal-cat': 'Bengal cats are active, energetic, and highly intelligent. They love to play and climb.',
    'himalayan': 'Himalayan cats are sweet, tempered, and playful. They enjoy the company of their humans.',
    'ragdoll': 'Ragdolls are affectionate, laid-back, and gentle. They love to be held and often go limp with pleasure.',
};

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

    // Specific "About Breed" text
    const breedText = breed && BREED_INFO[breed.toLowerCase()]
        ? BREED_INFO[breed.toLowerCase()]
        : breedName
            ? `The ${breedName} is a wonderful companion looking for a forever home. Known for their distinct personality, ${breedName}s make great additions to the right family.`
            : `Adopting a ${typeLabel.toLowerCase()} saves a life and brings joy to your home. Thousands of animals are waiting for a second chance.`;

    // Specific "About City" text
    const cityText = city && CITY_INFO[city.toLowerCase()]
        ? CITY_INFO[city.toLowerCase()]
        : cityName
            ? `Find lovable pets for adoption in ${cityName}. We connect you with local shelters and rescuers in the ${cityName} area.`
            : `We help you find pets for adoption across India. Whether you are in a metro or a smaller town, love is waiting for you.`;

    if (!breed && !city && !petType) return null;

    // Filter lists for footer links
    // If viewing a Breed, show that Breed in other Cities
    // If viewing a City, show other Breeds in that City
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
                    ? `Adopting a ${breedName} in ${cityName}`
                    : breedName
                        ? `Why Adopt a ${breedName}?`
                        : `Pet Adoption in ${cityName || 'India'}`
                }
            </h2>

            <div className="prose prose-blue max-w-none text-gray-600 space-y-4">
                <p>{breedText}</p>

                {breedName && (
                    <p>
                        When you adopt a {breedName}, you are giving a deserving animal a second chance.
                        Many {breedName}s in shelters or foster homes are already house-trained and socialized, making the transition to your home smoother.
                    </p>
                )}

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                    {cityName ? `Adoption Resources in ${cityName}` : `Why Adopt a ${typeLabel}?`}
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
