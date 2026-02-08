import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Heart, ArrowLeft, Check, X, MessageCircle, Share2, Store, Phone, Mail } from 'lucide-react';
import { getBreederListing } from '@/lib/public-api';
import PetImageGallery from '@/components/pet/PetImageGallery';
import ProtectedContact from '@/components/auth/ProtectedContact';
// Using inline styles or standard tailwind to avoid module css dependency issues for now, or reuse adopt.module.css if possible.
// For speed and consistency, I'll use Tailwind directly.

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    // We need to implement getListingBySlug in breederApi first, which we did.
    // Note: Since this is a server component, we might want to call the API directly or use the shared client.
    // breederApi uses client-api which uses axios. It *should* work if the base URL is correct (internal/external).
    // For server components, we usually prefer a server-side fetch or ensuring client-api handles SSR base URL.
    // Assuming existing client-api handles it (it typically does in this project).

    try {
        const listing = await getBreederListing(slug);

        if (!listing) {
            return { title: 'Listing Not Found | mypaws' };
        }

        return {
            title: `${listing.title} | ${listing.breederName} | mypaws`,
            description: `Meet ${listing.petName}, a ${listing.gender} ${listing.breedName} available from ${listing.breederName}.`,
            openGraph: {
                title: listing.title,
                description: `Meet ${listing.petName}, a ${listing.gender} ${listing.breedName} available from ${listing.breederName}.`,
                images: listing.images.length > 0 ? [listing.images[0]] : [],
            },
        };
    } catch (e) {
        return { title: 'Listing Not Found | mypaws' };
    }
}

export default async function BreederListingDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const listing = await getBreederListing(slug);

    if (!listing) {
        notFound();
    }

    // const { pet, city, adoptionFee, feeIncludes, adopterRequirements, homeCheckRequired, publishedAt, viewCount } = listing;
    // Mapping BreederListingDto to UI

    return (
        <main className="min-h-screen bg-gray-50 pb-12">
            {/* Nav */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Link href="/breeders/listings" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to listings
                    </Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Images */}
                <div>
                    {/* Reuse PetImageGallery if compatible, expects { largeUrl, thumbUrl, altText }[] 
               listing.images is string[]. Need to map.
           */}
                    <PetImageGallery
                        images={listing.images.map((url: string) => ({ largeUrl: url, thumbUrl: url, altText: listing.petName }))}
                        petName={listing.petName}
                    />
                </div>

                {/* Right Column: Info */}
                <div className="space-y-8">
                    <header>
                        <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                        <p className="mt-2 text-lg text-gray-600 flex items-center">
                            {listing.breedName} • {listing.ageDisplay}
                        </p>
                        <div className="mt-4 flex items-center text-gray-500">
                            <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                            {listing.cityName}, {listing.stateName}
                        </div>
                        <div className="mt-2 flex items-center text-primary-600">
                            <Store className="w-5 h-5 mr-2" />
                            <Link href={`/breeders/${listing.breederId}`} className="hover:underline">
                                {listing.breederName}
                            </Link>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <span className="block text-sm text-gray-500 mb-1">Gender</span>
                            <span className="block font-medium text-gray-900 capitalize">{listing.gender}</span>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <span className="block text-sm text-gray-500 mb-1">Color</span>
                            <span className="block font-medium text-gray-900">{listing.color || 'N/A'}</span>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <span className="block text-sm text-gray-500 mb-1">Price</span>
                            <span className="block font-medium text-gray-900">
                                {listing.price > 0 ? `₹${listing.price.toLocaleString()}` : 'Inquire'}
                                {listing.priceNegotiable && <span className="text-xs text-gray-500 ml-1">(Negotiable)</span>}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {listing.description && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About {listing.petName}</h2>
                            <div className="prose prose-sm text-gray-600 max-w-none whitespace-pre-line">
                                {listing.description}
                            </div>
                        </div>
                    )}

                    {/* CTA Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <ProtectedContact label="Login to Contact Breeder" className="flex-1">
                            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full mb-4 sm:mb-0">
                                <h3 className="font-semibold text-gray-900">Breeder Contact</h3>
                                {listing.businessPhone && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <a href={`tel:${listing.businessPhone}`} className="hover:text-primary-600 hover:underline">
                                            {listing.businessPhone}
                                        </a>
                                    </div>
                                )}
                                {listing.businessEmail && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <a href={`mailto:${listing.businessEmail}`} className="hover:text-primary-600 hover:underline">
                                            {listing.businessEmail}
                                        </a>
                                    </div>
                                )}
                                <button className="w-full flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mt-2">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Chat on WhatsApp
                                </button>
                            </div>
                        </ProtectedContact>
                        <button className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <Share2 className="w-5 h-5 mr-2" />
                            Share
                        </button>
                    </div>

                    <p className="text-xs text-center text-gray-500">
                        Posted {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </main>
    );
}
