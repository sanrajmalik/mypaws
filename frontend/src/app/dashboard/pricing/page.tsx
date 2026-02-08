"use client";

import { useState, Suspense, useEffect } from "react";
import { PricingCard } from "@/components/payments/PricingCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { loadRazorpay } from "@/lib/razorpay";
import { useSearchParams } from "next/navigation";
import { getClient } from "@/lib/client-api";

// Sub-component to handle search params in Suspense
function PricingContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'adopter' | 'breeder'>('breeder');
    const client = getClient();

    const isNew = searchParams.get('new') === 'true';
    const typeParam = searchParams.get('type');
    const listingId = searchParams.get('listingId');

    // Auto-switch tab based on type param
    useEffect(() => {
        if (typeParam === 'adoption' && activeTab !== 'adopter') setActiveTab('adopter');
        if (typeParam === 'breeder' && activeTab !== 'breeder') setActiveTab('breeder');
    }, [typeParam]);

    const handleFreeContinue = () => {
        window.location.href = '/dashboard/listings';
    };

    const handlePurchase = async (listingType: string, tier: string, price: number) => {
        if (!user) {
            alert("Please login to continue");
            return;
        }

        setLoading(`${listingType}-${tier}`);
        try {
            const razorpay = await loadRazorpay();
            if (!razorpay) {
                alert("Failed to load payment gateway");
                return;
            }

            const bodyData: any = {
                paymentType: 'listing_fee',
                listingType,
                pricingTier: tier
            };

            if (listingId && listingId !== 'null' && listingId !== 'undefined') {
                bodyData.listingId = listingId;
            } else {
                bodyData.listingId = '00000000-0000-0000-0000-000000000000'; // Placeholder
            }

            // initiate payment
            const response = await client.post<any>('/v1/payments/initiate', bodyData);

            if (response.error) {
                throw new Error(response.error.message || "Failed to initiate payment");
            }

            const data = response.data;

            if (data.amount === 0) {
                alert("Activated successfully!");
                // Redirect back if successful
                if (listingId && listingId !== '00000000-0000-0000-0000-000000000000') {
                    window.location.href = '/dashboard/listings';
                } else {
                    window.location.href = '/dashboard/listings';
                }
                return;
            }

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "MyPaws",
                description: `${listingType} Listing - ${tier}`,
                image: "/logo.png",
                order_id: data.orderId,
                handler: async function (razorpayResponse: any) {
                    // Verify payment
                    const verifyRes = await client.post<any>('/v1/payments/verify', {
                        razorpayOrderId: razorpayResponse.razorpay_order_id,
                        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                        razorpaySignature: razorpayResponse.razorpay_signature
                    });

                    if (verifyRes.error) {
                        alert(`Payment verification failed: ${verifyRes.error.message}`);
                    } else {
                        alert("Payment successful!");
                        window.location.href = '/dashboard/listings';
                    }
                },
                prefill: {
                    name: user.displayName,
                    email: user.email,
                    contact: user.phone
                },
                theme: {
                    color: "#F37254"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            {isNew && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
                    <p className="font-semibold text-lg">🎉 Listing Created Successfully!</p>
                    <p>Your listing is live. Want more visibility? Upgrade to Featured below, or continue with the Free plan.</p>
                </div>
            )}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Choose the perfect plan for your needs. Whether you're rehoming a single pet or a professional breeder, we have you covered.
                </p>
            </div>

            <div className="w-full">
                <div className="flex justify-center mb-8">
                    <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-lg w-full max-w-[400px]">
                        <button
                            onClick={() => setActiveTab('adopter')}
                            className={`py-2 px-4 text-sm font-medium rounded-md transition-all ${activeTab === 'adopter'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            For Adopters
                        </button>
                        <button
                            onClick={() => setActiveTab('breeder')}
                            className={`py-2 px-4 text-sm font-medium rounded-md transition-all ${activeTab === 'breeder'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            For Breeders
                        </button>
                    </div>
                </div>

                {activeTab === 'adopter' ? (
                    <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PricingCard
                            title="Free"
                            price="₹0"
                            description="Perfect for rehoming a single pet."
                            features={[
                                { text: "1 Active Listing", included: true },
                                { text: "Detailed Pet Profile", included: true },
                                { text: "Standard Visibility", included: true },
                                { text: "90 Days Validity", included: true },
                                { text: "Featured Placement", included: false },
                            ]}
                            buttonText={isNew ? "Continue with Free" : "Get Started"}
                            onSelect={() => isNew ? handleFreeContinue() : handlePurchase('adoption', 'free', 0)}
                            disabled={loading === 'adoption-free'}
                        />
                        <PricingCard
                            title="Standard"
                            price="₹199"
                            period="listing"
                            description="For valid verified adoption listings."
                            features={[
                                { text: "1 Additional Listing", included: true },
                                { text: "Detailed Pet Profile", included: true },
                                { text: "Standard Visibility", included: true },
                                { text: "90 Days Validity", included: true },
                                { text: "Featured Placement", included: false },
                            ]}
                            isPopular
                            onSelect={() => handlePurchase('adoption', 'standard', 199)}
                            disabled={loading === 'adoption-standard'}
                        />
                        <PricingCard
                            title="Featured"
                            price="₹399"
                            period="listing"
                            description="Maximize visibility for urgent rehoming."
                            features={[
                                { text: "1 Featured Listing", included: true },
                                { text: "Top of Search Results", included: true },
                                { text: "Homepage Feature", included: true },
                                { text: "90 Days Validity", included: true },
                                { text: "Priority Support", included: true },
                            ]}
                            onSelect={() => handlePurchase('adoption', 'featured', 399)}
                            disabled={loading === 'adoption-featured'}
                        />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PricingCard
                            title="Free Trial"
                            price="₹0"
                            description="Try the platform with your first listing."
                            features={[
                                { text: "1 Active Listing", included: true },
                                { text: "Basic Verification", included: true },
                                { text: "Standard Visibility", included: true },
                                { text: "90 Days Validity", included: true },
                                { text: "Analytics", included: false },
                            ]}
                            onSelect={() => handlePurchase('breeder', 'free', 0)}
                            disabled={loading === 'breeder-free'}
                        />
                        <PricingCard
                            title="Standard"
                            price="₹499"
                            period="listing"
                            description="Grow your reach with more listings."
                            features={[
                                { text: "1 Additional Listing", included: true },
                                { text: "Verified Breeder Badge", included: true },
                                { text: "Standard Search Ranking", included: true },
                                { text: "90 Days Validity", included: true },
                                { text: "Basic Analytics", included: true },
                            ]}
                            isPopular
                            onSelect={() => handlePurchase('breeder', 'standard', 499)}
                            disabled={loading === 'breeder-standard'}
                        />
                        <PricingCard
                            title="Premium"
                            price="₹999"
                            period="listing"
                            description="Maximum exposure for premium litters."
                            features={[
                                { text: "1 Featured Listing", included: true },
                                { text: "Top of Search Results", included: true },
                                { text: "Social Media Spotlight", included: true },
                                { text: "90 Days Validity", included: true },
                                { text: "Advanced Analytics", included: true },
                            ]}
                            onSelect={() => handlePurchase('breeder', 'premium', 999)}
                            disabled={loading === 'breeder-premium'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PricingContent />
        </Suspense>
    );
}
