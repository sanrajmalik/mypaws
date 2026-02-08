import React from 'react';
import { Check, X } from 'lucide-react';

type ListingMode = 'adoption' | 'sale';

interface ListingDetailedSeoProps {
    mode: ListingMode;
    petName: string;
    breedName: string;
    cityName: string;
    stateName: string;
    ownerName: string; // Breeder or Foster/Owner name
    description?: string;
    gender: string;
    age: string;
    isVaccinated?: boolean;
    isNeutered?: boolean; // Mainly for adoption
    price?: number; // Mainly for sale
    includes?: string[]; // For sale (microchip, etc)
    temperament?: {
        goodWithKids?: boolean;
        goodWithDogs?: boolean;
        goodWithCats?: boolean;
        traits?: string[];
    };
}

export default function ListingDetailedSeo({
    mode,
    petName,
    breedName,
    cityName,
    stateName,
    ownerName,
    description,
    gender,
    age,
    isVaccinated,
    isNeutered,
    price,
    includes,
    temperament
}: ListingDetailedSeoProps) {

    const isAdoption = mode === 'adoption';
    const platformName = "MyPaws";

    // --- Dynamic Text Generators ---

    const getIntroText = () => {
        if (isAdoption) {
            return (
                <>
                    <p>
                        If you’ve been waiting for the right time and the right dog to adopt, <strong>{petName}</strong> might be the sign you are looking for.
                        This adorable {gender.toLowerCase()} <strong>{breedName}</strong> is currently in <strong>{cityName}, {stateName}</strong>,
                        hoping to move from temporary care to a forever home.
                    </p>
                    <p className="mt-4">
                        Under <strong>{ownerName}</strong>’s care, {petName} has been waiting for a loving family.
                        {temperament?.traits && temperament.traits.length > 0 && ` ${petName} is known to be ${temperament.traits.join(', ')}.`}
                        {isVaccinated && " Health-wise, vaccinations are up to date."}
                        {isNeutered !== undefined && (isNeutered ? " Already neutered/spayed." : " Not yet neutered/spayed.")}
                    </p>
                    <p className="mt-4">
                        By taking the next step with <strong>{platformName}</strong>, you can explore adoption in a structured way –
                        meet {petName}, understand their needs, and decide if you’re ready for a lifelong commitment.
                    </p>
                </>
            );
        } else {
            // Sale / Breeder Context
            return (
                <>
                    <p>
                        Are you looking for a healthy, ethical <strong>{breedName}</strong> puppy?
                        Meet <strong>{petName}</strong>, a lovely {gender.toLowerCase()} puppy available in <strong>{cityName}, {stateName}</strong>.
                        Bred by verified breeder <strong>{ownerName}</strong>, this puppy is ready to find a loving home.
                    </p>
                    <p className="mt-4">
                        At {platformName}, we prioritize ethical breeding. {petName} comes from a caring environment.
                        {includes && includes.length > 0 && ` This puppy comes with ${includes.join(', ')}.`}
                        {isVaccinated && " Initial vaccinations have been completed."}
                    </p>
                    <p className="mt-4">
                        Connect directly with <strong>{ownerName}</strong> through {platformName} to ask questions, request more photos,
                        or schedule a visit to meet your potential new best friend.
                    </p>
                </>
            );
        }
    };

    const getFaqSection = () => {
        return (
            <div className="space-y-6 mt-6">
                {/* Location */}
                <div>
                    <h4 className="font-semibold text-gray-900">Where is {petName} currently located?</h4>
                    <p className="text-gray-600 mt-1">
                        {petName} is currently {isAdoption ? 'being fostered' : 'located'} in <strong>{cityName}, {stateName}</strong>.
                        You can start the {isAdoption ? 'adoption' : 'buying'} process online through {platformName},
                        and <strong>{ownerName}</strong> will guide you on the next steps.
                    </p>
                </div>

                {/* Breed & Age */}
                <div>
                    <h4 className="font-semibold text-gray-900">What breed and age is {petName}?</h4>
                    <p className="text-gray-600 mt-1">
                        {petName} is a {gender.toLowerCase()} <strong>{breedName}</strong> and is approximately <strong>{age}</strong> old.
                    </p>
                </div>

                {/* Health */}
                <div>
                    <h4 className="font-semibold text-gray-900">Is {petName} vaccinated and {isAdoption ? 'neutered' : 'healthy'}?</h4>
                    <p className="text-gray-600 mt-1">
                        {isVaccinated ? "Yes, vaccinations are up to date." : "Vaccination status should be confirmed with the owner."}
                        {isAdoption && (isNeutered ? " Yes, already neutered/spayed." : " Not yet neutered/spayed.")}
                        {!isAdoption && " The breeder provides a health guarantee (check details with breeder)."}
                    </p>
                </div>

                {/* Temperament / Description */}
                <div>
                    <h4 className="font-semibold text-gray-900">What is {petName}’s temperament like?</h4>
                    <p className="text-gray-600 mt-1">
                        {description ? (
                            <>
                                "{description.slice(0, 150)}{description.length > 150 ? '...' : ''}"
                                <br />
                                Every pet has a unique personality, so we suggest a conversation with <strong>{ownerName}</strong> to better understand routine and energy levels.
                            </>
                        ) : (
                            `We suggest chatting with ${ownerName} to understand ${petName}'s specific personality traits and energy levels.`
                        )}
                    </p>
                </div>

                {/* Compatibility (Adoption specific mostly, but good for puppies too) */}
                <div>
                    <h4 className="font-semibold text-gray-900">Is {petName} good with children and other pets?</h4>
                    <p className="text-gray-600 mt-1">
                        {temperament?.goodWithKids ? "Reported to be good with kids." : "Interaction with kids should be supervised."}
                        {temperament?.goodWithDogs ? " Gets along with other dogs." : ""}
                        {temperament?.goodWithCats ? " Good with cats." : ""}
                        <br />
                        However, the first few days in a new home should always be slow and supervised.
                        Introduce {petName} gradually to give them time and space to feel safe.
                    </p>
                </div>

                {/* Why Adoption/Sale? */}
                <div>
                    <h4 className="font-semibold text-gray-900">
                        {isAdoption ? `Why is ${petName} up for adoption?` : `Why typically choose this breeder?`}
                    </h4>
                    <p className="text-gray-600 mt-1">
                        {isAdoption
                            ? `Reasons vary, but typically it's due to lifestyle changes or relocation. By adopting ${petName}, you help turn a difficult beginning into a positive, loving future.`
                            : `${ownerName} is a verified breeder on ${platformName}, committed to ethical breeding practices and raising healthy, happy puppies.`
                        }
                    </p>
                </div>

                {/* Process */}
                <div>
                    <h4 className="font-semibold text-gray-900">How does the {isAdoption ? 'adoption' : 'process'} work on {platformName}?</h4>
                    <p className="text-gray-600 mt-1">
                        Simply click the "Contact" button to message <strong>{ownerName}</strong> directly.
                        Discuss expectations, schedule a meet-and-greet (virtual or physical), and ensure it's a perfect match before proceeding.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About {petName}
            </h2>

            <div className="prose prose-blue max-w-none text-gray-600">
                {getIntroText()}
            </div>

            <div className="mt-10 border-t border-gray-100 pt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Got Questions? We’ve Got Answers</h3>
                {getFaqSection()}
            </div>
        </section>
    );
}
