import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, ShieldCheck, Heart, Calendar, Info } from 'lucide-react';
import { getBreederListing } from '@/lib/public-api';
import PetImageGallery from '@/components/pet/PetImageGallery';

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const listingId = slug[slug.length - 1];

    const listing = await getBreederListing(listingId);

    if (!listing || (listing.petType && listing.petType.toLowerCase() !== 'cat')) {
        return {
            title: 'Cat Breeds & Kittens | MyPaws',
            description: 'Find ethical cat breeders and kittens for sale in India.'
        };
    }

    return {
        title: `${listing.title} | ${listing.breederName}`,
        description: `${listing.breedName} kitten for sale by ${listing.breederName} in ${listing.cityName}. ${listing.description?.substring(0, 150)}...`,
        openGraph: {
            images: listing.images.length > 0 ? [listing.images[0]] : []
        }
    };
}

export default async function BuyCatsPage({ params }: PageProps) {
    const { slug } = await params;
    const listingId = slug[slug.length - 1];

    const listing = await getBreederListing(listingId);

    if (!listing) {
        notFound();
    }

    // Verify Pet Type
    if (listing.petType && listing.petType.toLowerCase() !== 'cat') {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-12">
            {/* Nav */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Link href="/buy-cats" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to cats
                    </Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-gray-900 font-medium truncate max-w-xs">{listing.title}</span>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Images */}
                <div>
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
                        <div className="mt-4 flex items-center space-x-2 text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full w-fit">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{listing.cityName}, {listing.stateName}</span>
                        </div>
                    </header>

                    {/* Price & CTA */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-baseline mb-4">
                            <span className="text-3xl font-bold text-gray-900">₹{listing.price.toLocaleString()}</span>
                            {listing.priceNegotiable && <span className="text-sm text-gray-500">Negotiable</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="col-span-2 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-sm text-lg">
                                Contact Breeder
                            </button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border border-gray-100">
                            <span className="text-gray-500 text-sm block mb-1">Gender</span>
                            <span className="font-medium text-gray-900 capitalize">{listing.gender || 'Unknown'}</span>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-gray-100">
                            <span className="text-gray-500 text-sm block mb-1">Color</span>
                            <span className="font-medium text-gray-900">{listing.color || 'N/A'}</span>
                        </div>
                        <div className="col-span-2 p-4 bg-white rounded-lg border border-gray-100">
                            <span className="text-gray-500 text-sm block mb-1">Includes</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {listing.includes && listing.includes.length > 0 ? listing.includes.map((item: string) => (
                                    <span key={item} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        {item}
                                    </span>
                                )) : <span className="text-gray-400 italic">No specifics listed</span>}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-gray-400" />
                            About {listing.petName}
                        </h3>
                        <div className="prose prose-sm text-gray-600">
                            <p>{listing.description}</p>
                        </div>
                    </section>

                    {/* Breeder Profile Card */}
                    <section className="border-t border-gray-200 pt-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-200 transition-colors cursor-pointer group">
                            <Link href={`/breeders/${listing.breederId}`} className="block">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{listing.breederName}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Ethical Breeder • Verified</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                                        {listing.breederName.charAt(0)}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-gray-500">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {listing.cityName}, {listing.stateName}
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
