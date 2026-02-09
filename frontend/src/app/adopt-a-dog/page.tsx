import { Metadata } from 'next';
import { Suspense } from 'react';
import AdoptionListingsPage from '../adopt-a-pet/AdoptionListingsPage';
import { getBreeds, getCities, getAdoptionListings } from '@/lib/public-api';
import styles from '../adopt-a-pet/adopt.module.css';
import SeoContentBlock from '@/components/seo/SeoContentBlock';

export const metadata: Metadata = {
  title: 'Adopt a Dog in India | Puppies & Dogs for Adoption | mypaws',
  description: 'Find loving dogs and puppies for adoption in India. Browse Labrador, German Shepherd, Golden Retriever, Beagle, and many more breeds from verified owners.',
  openGraph: {
    title: 'Adopt a Dog in India | mypaws',
    description: 'Find loving dogs and puppies for adoption from verified owners across India.',
    url: 'https://mypaws.in/adopt-a-dog',
  },
  alternates: {
    canonical: 'https://mypaws.in/adopt-a-dog',
  },
};

interface PageProps {
  searchParams: Promise<{
    city?: string;
    breed?: string;
    gender?: string;
    size?: string;
    age?: string;
    page?: string;
  }>;
}

export default async function AdoptADogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  const [breedsRes, citiesRes, listingsRes] = await Promise.all([
    getBreeds({ petType: 'dog', limit: 0 }),
    getCities({ limit: 0 }),
    getAdoptionListings({
      city: params.city,
      breed: params.breed,
      petType: 'dog',
      gender: params.gender,
      size: params.size,
      page,
      limit: 20,
    }),
  ]);

  return (
    <main className={styles['adopt-page']}>
      <section className={`${styles['adopt-hero']} ${styles['adopt-hero--dog']}`}>
        <div className={styles.container}>
          <h1 className={styles['adopt-hero__title']}>
            🐕 Adopt a Dog
          </h1>
          <p className={styles['adopt-hero__subtitle']}>
            Give a loving dog their forever home
          </p>
        </div>
      </section>

      <section className={`${styles.container} ${styles['adopt-content']}`}>
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          <AdoptionListingsPage
            initialListings={listingsRes}
            breeds={breedsRes.data}
            cities={citiesRes.data}
            petType="dog"
            initialFilters={{
              city: params.city,
              breed: params.breed,
              petType: 'dog',
              gender: params.gender,
              size: params.size,
              age: params.age,
            }}
          />
        </Suspense>

        <SeoContentBlock
          city={params.city}
          breed={params.breed}
          petType="dog"
          allBreeds={breedsRes.data}
          allCities={citiesRes.data}
        />
      </section>
    </main>
  );
}
