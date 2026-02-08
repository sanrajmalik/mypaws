
import React from 'react';

// Mocks
const formData = {
    pet: {
        description: '',
        rescueStory: '',
        funFacts: [] as string[]
    }
};
const errors: Record<string, string> = {};
const updatePetField = (field: string, value: any) => { };
const newFunFact = '';
const setNewFunFact = (val: string) => { };
const addFunFact = () => { };
const removeFunFact = (idx: number) => { };
const PlusIcon = (props: any) => <div>+</div>;
const XMarkIcon = (props: any) => <div>x</div>;

export const Repro3 = () => {
    const step = 2;

    return (
        <div>
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
                </div>
            )}
        </div>
    );
};
