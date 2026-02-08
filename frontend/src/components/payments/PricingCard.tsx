import { Check } from "lucide-react";

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingCardProps {
    title: string;
    price: string;
    period?: string;
    description: string;
    features: PricingFeature[];
    isPopular?: boolean;
    buttonText?: string;
    onSelect?: () => void;
    disabled?: boolean;
}

export function PricingCard({
    title,
    price,
    period,
    description,
    features,
    isPopular,
    buttonText = "Choose Plan",
    onSelect,
    disabled
}: PricingCardProps) {
    return (
        <div className={`relative flex flex-col p-6 bg-white border rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${isPopular ? "border-primary-500 ring-2 ring-primary-500 ring-offset-2" : "border-gray-200"}`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                </div>
            )}

            <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">{price}</span>
                    {period && <span className="text-gray-500 ml-1">/{period}</span>}
                </div>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <Check className={`w-5 h-5 mr-3 shrink-0 ${feature.included ? "text-green-500" : "text-gray-300"}`} />
                        <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400 line-through"}`}>
                            {feature.text}
                        </span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onSelect}
                disabled={disabled}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isPopular ? "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500" : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {buttonText}
            </button>
        </div>
    );
}
