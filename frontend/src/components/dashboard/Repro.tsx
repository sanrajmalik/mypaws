
import React from 'react';

const TRAIT_OPTIONS = ['a', 'b'];
const formData = { pet: { temperament: { traits: ['a'] } } };

export const Repro = () => {
    const step = 2;
    const toggleTrait = (t: string) => { };

    return (
        <div>
            {step === 2 && (
                <div>
                    <div>
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
            )}
        </div>
    );
};
