
import React from 'react';

type Temperament = {
    goodWithKids: boolean | null;
    goodWithDogs: boolean | null;
    goodWithCats: boolean | null;
    energyLevel: string | null;
    trainingLevel: string | null;
    traits: string[];
};

const formData = {
    pet: {
        temperament: {
            goodWithKids: null,
            goodWithDogs: null,
            goodWithCats: null,
            energyLevel: null,
            trainingLevel: null,
            traits: [] as string[]
        } as Temperament
    }
};

const updateTemperament = (key: keyof Temperament, val: any) => { };

export const Repro2 = () => {
    const step = 2;

    return (
        <div>
            {step === 2 && (
                <div>
                    <div className="border-t pt-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Temperament & Compatibility</h4>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {[
                                { key: 'goodWithKids', label: 'Good with Kids', emoji: '👶' },
                                { key: 'goodWithDogs', label: 'Good with Dogs', emoji: '🐕' },
                                { key: 'goodWithCats', label: 'Good with Cats', emoji: '🐈' },
                            ].map(({ key, label, emoji }) => (
                                <div key={key} className="flex flex-col gap-1">
                                    <span className="text-sm text-gray-600">{emoji} {label}</span>
                                    <div className="flex gap-1">
                                        {[
                                            { val: true, label: 'Yes', color: 'green' },
                                            { val: false, label: 'No', color: 'red' },
                                            { val: null, label: '?', color: 'gray' },
                                        ].map(({ val, label: l, color }) => (
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
                    </div>
                </div>
            )}
        </div>
    );
};
