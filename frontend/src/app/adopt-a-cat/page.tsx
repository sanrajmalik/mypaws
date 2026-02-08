import { Metadata } from 'next';
import { Suspense } from 'react';
import AdoptionListingsPage from '../adopt-a-pet/AdoptionListingsPage';
import { getBreeds, getCities, getAdoptionListings } from '@/lib/public-api';
import styles from '../adopt-a-pet/adopt.module.css';

export const metadata: Metadata = {
  title: 'Adopt a Cat in India | Kittens & Cats for Adoption | mypaws',
  description: 'Find loving cats and kittens for adoption in India. Browse Persian, Siamese, Maine Coon, British Shorthair, and many more breeds from verified owners.',
  openGraph: {
    title: 'Adopt a Cat in India | mypaws',
    description: 'Find loving cats and kittens for adoption from verified owners across India.',
    url: 'https://mypaws.in/adopt-a-cat',
  },
  alternates: {
    canonical: 'https://mypaws.in/adopt-a-cat',
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

export default async function AdoptACatPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  const [breedsRes, citiesRes, listingsRes] = await Promise.all([
    getBreeds({ petType: 'cat', limit: 0 }),
    getCities({ limit: 0 }),
    getAdoptionListings({
      city: params.city,
      breed: params.breed,
      petType: 'cat',
      gender: params.gender,
      size: params.size,
      page,
      limit: 20,
    }),
  ]);

  return (
    <main className={styles['adopt-page']}>
      <section className={`${styles['adopt-hero']} ${styles['adopt-hero--cat']}`}>
        <div className={styles.container}>
          <h1 className={styles['adopt-hero__title']}>
            🐈 Adopt a Cat
          </h1>
          <p className={styles['adopt-hero__subtitle']}>
            Find your purr-fect feline companion
          </p>
        </div>
      </section>

      <section className={`${styles.container} ${styles['adopt-content']}`}>
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          <AdoptionListingsPage
            initialListings={listingsRes}
            breeds={breedsRes.data}
            cities={citiesRes.data}
            petType="cat"
            initialFilters={{
              city: params.city,
              breed: params.breed,
              petType: 'cat',
              gender: params.gender,
              size: params.size,
              age: params.age,
            }}
          />
        </Suspense>
      </section>
    </main>
  );
}
