import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { searchBreederListings, getBreeds, getCities } from '@/lib/public-api';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import BreederListingFilter from '@/components/breeders/BreederListingFilter';
import ProgrammaticSeoLinks from '@/components/seo/ProgrammaticSeoLinks';
import styles from '@/styles/listing-layout.module.css';

interface PageProps {
    searchParams: Promise<{
        breed?: string;
        city?: string;
        gender?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const params = await searchParams;
    const { city, breed } = params;

    const formatSlug = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const breedName = breed ? formatSlug(breed) : null;
    const cityName = city ? formatSlug(city) : null;

    let title = 'Buy Cats & Kittens | Ethical Breeders India | MyPaws';
    let description = 'Find healthy, vet-checked kittens from verified ethical breeders in India. Persian, Siamese, and more.';

    if (cityName && breedName) {
        title = `Buy ${breedName} Kittens in ${cityName} | Verified Breeders`;
        description = `Find healthy ${breedName} kittens for sale in ${cityName} from ethical breeders. Vet-checked, vaccinated, and love guaranteed.`;
    } else if (breedName) {
        title = `Buy ${breedName} Kittens in India | Price, Photos & Breeders`;
        description = `Find the best ${breedName} kittens for sale in India from verified ethical breeders. Check prices, photos, and health guarantees.`;
    } else if (cityName) {
        title = `Buy Kittens in ${cityName} | Ethical Cat Breeders`;
        description = `Find healthy kittens for sale in ${cityName}. Connect with verified cat breeders near you.`;
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        }
    };
}

export default async function BuyCatsHubPage({ searchParams }: PageProps) {
    const params = await searchParams;

    // Fetch data in parallel
    const [listingsRes, breedsRes, citiesRes] = await Promise.all([
        searchBreederListings({
            petType: 'Cat',
            breedSlug: params.breed,
            citySlug: params.city,
            gender: params.gender,
            minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
            maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
            page: params.page ? parseInt(params.page) : 1,
            pageSize: 12
        }),
        getBreeds({ petType: 'cat', limit: 0 }),
        getCities({ limit: 0 })
    ]);

    const recentListings = listingsRes || [];
    const allBreeds = breedsRes?.data || [];
    const allCities = citiesRes?.data || [];

    // Resolve Slugs to Objects for display
    const selectedBreed = params.breed ? allBreeds.find(b => b.slug === params.breed) : undefined;
    const selectedCity = params.city ? allCities.find(c => c.slug === params.city) : undefined;


    return (
        <main className={styles['adopt-page']}>
            {/* Hero Section */}
            <section className={`${styles['adopt-hero']} ${styles['adopt-hero--cat']}`}>
                <div className={styles.container}>
                    <h1 className={styles['adopt-hero__title']}>Find Your Purr-fect Pal</h1>
                    <p className={styles['adopt-hero__subtitle']}>
                        Connect with verified, ethical cat breeders across India. Sweet temperaments and healthy bloodlines.
                    </p>
                    <div className="flex justify-center gap-4 mt-8">
                        <Link href="/breeders/register" className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors border border-white/30">
                            Are you a breeder? Join Now
                        </Link>
                    </div>
                </div>
            </section>

            <div className={`${styles.container} ${styles['adopt-content']} space-y-8`}>

                {/* Filters */}
                <BreederListingFilter breeds={allBreeds} cities={allCities} />

                {/* Listings Grid */}
                <section id="listings" className="min-h-[400px]">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {selectedBreed ? `${selectedBreed.name} Kittens` : 'Kittens For Sale'}
                            {selectedCity && ` in ${selectedCity.name}`}
                        </h2>
                        <span className="text-sm text-gray-500">{recentListings.length} results</span>
                    </div>

                    {recentListings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recentListings.map(listing => (
                                <Link key={listing.id} href={`/buy-cats/${listing.slug}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow block group">
                                    <div className="aspect-[4/3] relative bg-gray-100">
                                        <Image
                                            src={listing.imageUrl || '/placeholder-pet.jpg'}
                                            alt={listing.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                                            ₹{listing.price.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 truncate mb-1">{listing.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{listing.breedName} • {listing.gender}</p>

                                        <div className="flex items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {listing.cityName}, {listing.stateName}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="text-4xl mb-4">🐈</div>
                            <h3 className="text-lg font-medium text-gray-900">No kittens found matching your criteria</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
                            <Link href="/buy-cats" className="text-indigo-600 font-medium mt-4 inline-block hover:underline">
                                Clear all filters
                            </Link>
                        </div>
                    )}
                </section>

                {/* Programmatic SEO Links - Breeds */}
                <ProgrammaticSeoLinks
                    petType="cats"
                    type="breed"
                    items={allBreeds}
                />

                {/* Programmatic SEO Links - Cities */}
                <ProgrammaticSeoLinks
                    petType="cats"
                    type="city"
                    items={allCities}
                />

                {/* Trust Signals */}
                <section className="bg-indigo-50 rounded-2xl p-8 md:p-10 text-center mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Why buy from MyPaws?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">🛡️</div>
                            <h3 className="font-bold text-gray-900 mb-1">Verified Breeders</h3>
                            <p className="text-gray-600 text-sm">Every breeder passes a strict 5-step verification process.</p>
                        </div>
                        <div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">❤️</div>
                            <h3 className="font-bold text-gray-900 mb-1">Health Guaranteed</h3>
                            <p className="text-gray-600 text-sm">Kittens come with vaccination records and health checks.</p>
                        </div>
                        <div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">🤝</div>
                            <h3 className="font-bold text-gray-900 mb-1">Ethical Standards</h3>
                            <p className="text-gray-600 text-sm">We strictly prohibit kitten mills and unethical breeding.</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
