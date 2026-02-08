import { Suspense } from 'react';
import { Metadata } from 'next';
import AdoptionListingsPage from './AdoptionListingsPage';
import { getBreeds, getCities, getAdoptionListings } from '@/lib/public-api';
import styles from '@/styles/listing-layout.module.css';
import SeoContentBlock from '@/components/seo/SeoContentBlock';

interface PageProps {
  searchParams: Promise<{
    city?: string;
    breed?: string;
    petType?: string;
    gender?: string;
    size?: string;
    age?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const { city, breed, petType } = params;

  // Helper to format slug to Title Case
  const formatSlug = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const breedName = breed ? formatSlug(breed) : null;
  const cityName = city ? formatSlug(city) : null;
  const typeLabel = petType ? `${formatSlug(petType)}s` : 'Dogs & Cats'; // "Dog" -> "Dogs", "Cat" -> "Cats"

  let title = 'Adopt a Pet in India | Dogs & Cats for Adoption';
  let description = 'Find loving dogs and cats for adoption across India. Browse verified listings from trusted pet owners and shelters.';

  // Build dynamic title
  if (cityName && breedName) {
    title = `Adopt ${breedName} in ${cityName} | Free Pet Adoption`;
    description = `Find ${breedName} ${typeLabel} for adoption in ${cityName}. Give a forever home to a rescue pet today.`;
  } else if (breedName) {
    title = `Adopt ${breedName} ${typeLabel} | MyPaws India`;
    description = `Browse ${breedName} ${typeLabel} for adoption across India. Verified listings.`;
  } else if (cityName) {
    title = `Pet Adoption in ${cityName} | Adopt ${typeLabel}`;
    description = `Find pets for adoption in ${cityName}. ${typeLabel} and more waiting for homes nearby.`;
  } else if (petType) {
    title = `Adopt ${typeLabel} in India | MyPaws`;
    description = `Find loving ${typeLabel} for adoption across India.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://mypaws.in/adopt-a-pet',
    },
    alternates: {
      canonical: 'https://mypaws.in/adopt-a-pet',
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  const [breedsRes, citiesRes, listingsRes] = await Promise.all([
    getBreeds({ limit: 0 }),
    getCities({ limit: 0 }),
    getAdoptionListings({
      city: params.city,
      breed: params.breed,
      petType: params.petType,
      gender: params.gender,
      size: params.size,
      page,
      limit: 20,
    }),
  ]);

  return (
    <main className={styles['adopt-page']}>
      <section className={styles['adopt-hero']}>
        <div className={styles.container}>
          <h1 className={styles['adopt-hero__title']}>
            Find Your Perfect Companion
          </h1>
          <p className={styles['adopt-hero__subtitle']}>
            Thousands of loving pets are waiting for their forever homes
          </p>
        </div>
      </section>

      <section className={`${styles.container} ${styles['adopt-content']}`}>
        <Suspense fallback={<div className={styles.loading}>Loading filters...</div>}>
          <AdoptionListingsPage
            initialListings={listingsRes}
            breeds={breedsRes.data}
            cities={citiesRes.data}
            initialFilters={{
              city: params.city,
              breed: params.breed,
              petType: params.petType,
              gender: params.gender,
              size: params.size,
              age: params.age,
            }}
          />
        </Suspense>

        <SeoContentBlock
          city={params.city}
          breed={params.breed}
          petType={params.petType}
          allBreeds={breedsRes.data}
          allCities={citiesRes.data}
        />
      </section>
    </main>
  );
}
