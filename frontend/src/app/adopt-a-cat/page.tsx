import { Metadata } from 'next';
import { Suspense } from 'react';
import AdoptionListingsPage from '../adopt-a-pet/AdoptionListingsPage';
import { getBreeds, getCities, getAdoptionListings } from '@/lib/public-api';
import styles from '../adopt-a-pet/adopt.module.css';
import SeoContentBlock from '@/components/seo/SeoContentBlock';

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

const formatSlug = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function buildCatSeoStrings(params: { city?: string; breed?: string }) {
  const breedName = params.breed ? formatSlug(params.breed) : null;
  const cityName = params.city ? formatSlug(params.city) : null;

  let title = 'Adopt a Cat in India | Kittens & Cats for Adoption | mypaws';
  let description = 'Find loving cats and kittens for adoption in India. Browse Persian, Siamese, Maine Coon, British Shorthair, and many more breeds from verified owners.';
  let h1 = '🐈 Adopt a Cat';

  if (breedName && cityName) {
    title = `Adopt ${breedName} Cats in ${cityName} | mypaws`;
    description = `Find ${breedName} cats and kittens for adoption in ${cityName}. Browse verified listings from trusted pet owners on mypaws.`;
    h1 = `Adopt ${breedName} Cats in ${cityName}`;
  } else if (breedName) {
    title = `Adopt ${breedName} Cats in India | mypaws`;
    description = `Looking to adopt a ${breedName}? Browse verified ${breedName} cats and kittens for adoption across India on mypaws.`;
    h1 = `Adopt ${breedName} Cats`;
  } else if (cityName) {
    title = `Adopt Cats in ${cityName} | Kittens for Adoption | mypaws`;
    description = `Find cats and kittens for adoption in ${cityName}. Browse verified listings from trusted pet owners and shelters near you.`;
    h1 = `Adopt Cats in ${cityName}`;
  }

  return { title, description, h1, breedName, cityName };
}

function buildCatCanonicalUrl(params: { city?: string; breed?: string }) {
  const qp = new URLSearchParams();
  if (params.breed) qp.set('breed', params.breed);
  if (params.city) qp.set('city', params.city);
  const qs = qp.toString();
  return `https://mypaws.in/adopt-a-cat${qs ? `?${qs}` : ''}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const { title, description } = buildCatSeoStrings(params);
  const canonicalUrl = buildCatCanonicalUrl(params);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
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

  const { h1, description: subtitle } = buildCatSeoStrings(params);
  const canonicalUrl = buildCatCanonicalUrl(params);

  // JSON-LD: ItemList
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h1.replace('🐈 ', ''),
    url: canonicalUrl,
    numberOfItems: listingsRes.pagination?.totalItems || listingsRes.data.length,
    itemListElement: listingsRes.data.slice(0, 10).map((listing, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://mypaws.in/adopt-a-pet/${listing.slug || listing.id}`,
      name: listing.pet.name || listing.title,
    })),
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mypaws.in' },
    { '@type': 'ListItem', position: 2, name: 'Adopt a Cat', item: 'https://mypaws.in/adopt-a-cat' },
  ];
  if (params.breed) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: formatSlug(params.breed),
      item: canonicalUrl,
    });
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <main className={styles['adopt-page']}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className={`${styles['adopt-hero']} ${styles['adopt-hero--cat']}`}>
        <div className={styles.container}>
          <h1 className={styles['adopt-hero__title']}>
            {h1}
          </h1>
          <p className={styles['adopt-hero__subtitle']}>
            {params.breed || params.city
              ? subtitle.split('.')[0] + '.'
              : 'Find your purr-fect feline companion'}
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
            basePath="/adopt-a-cat"
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

        <SeoContentBlock
          city={params.city}
          breed={params.breed}
          petType="cat"
          allBreeds={breedsRes.data}
          allCities={citiesRes.data}
        />
      </section>
    </main>
  );
}
