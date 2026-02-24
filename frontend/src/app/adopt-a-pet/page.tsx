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

// Helper to format slug to Title Case
const formatSlug = (str: string) => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function buildSeoStrings(params: { city?: string; breed?: string; petType?: string }) {
  const { city, breed, petType } = params;
  const breedName = breed ? formatSlug(breed) : null;
  const cityName = city ? formatSlug(city) : null;
  const typeLabel = petType ? `${formatSlug(petType)}s` : 'Dogs & Cats';

  let title = 'Adopt a Pet in India | Dogs & Cats for Adoption';
  let description = 'Find loving dogs and cats for adoption across India. Browse verified listings from trusted pet owners and shelters.';
  let h1 = 'Adopt a Pet in India';

  if (cityName && breedName) {
    title = `Adopt ${breedName} in ${cityName} | Free Pet Adoption`;
    description = `Find ${breedName} ${typeLabel} for adoption in ${cityName}. Browse verified listings from trusted pet owners. Give a forever home to a rescue pet today.`;
    h1 = `Adopt ${breedName} in ${cityName}`;
  } else if (breedName) {
    title = `Adopt ${breedName} ${typeLabel} in India | mypaws`;
    description = `Looking to adopt a ${breedName}? Browse verified ${breedName} ${typeLabel} for adoption across India on mypaws.`;
    h1 = `Adopt ${breedName} ${typeLabel}`;
  } else if (cityName) {
    title = `Pet Adoption in ${cityName} | Adopt ${typeLabel}`;
    description = `Find ${typeLabel.toLowerCase()} for adoption in ${cityName}. Browse verified listings from trusted pet owners and shelters near you.`;
    h1 = `Pet Adoption in ${cityName}`;
  } else if (petType) {
    title = `Adopt ${typeLabel} in India | mypaws`;
    description = `Find loving ${typeLabel.toLowerCase()} for adoption across India. Browse verified listings from trusted pet owners.`;
    h1 = `Adopt ${typeLabel} in India`;
  }

  return { title, description, h1, breedName, cityName, typeLabel };
}

function buildCanonicalUrl(params: { city?: string; breed?: string; petType?: string }) {
  const qp = new URLSearchParams();
  if (params.petType) qp.set('petType', params.petType);
  if (params.breed) qp.set('breed', params.breed);
  if (params.city) qp.set('city', params.city);
  const qs = qp.toString();
  return `https://mypaws.in/adopt-a-pet${qs ? `?${qs}` : ''}`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const { title, description } = buildSeoStrings(params);
  const canonicalUrl = buildCanonicalUrl(params);

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

  const { h1, description: subtitle } = buildSeoStrings(params);
  const canonicalUrl = buildCanonicalUrl(params);

  // JSON-LD: ItemList for the listings
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h1,
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
    { '@type': 'ListItem', position: 2, name: 'Adopt a Pet', item: 'https://mypaws.in/adopt-a-pet' },
  ];
  if (params.petType) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: `Adopt ${formatSlug(params.petType)}s`,
      item: `https://mypaws.in/adopt-a-pet?petType=${params.petType}`,
    });
  }
  if (params.breed) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
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
      <section className={styles['adopt-hero']}>
        <div className={styles.container}>
          <h1 className={styles['adopt-hero__title']}>
            {h1}
          </h1>
          <p className={styles['adopt-hero__subtitle']}>
            {params.breed || params.city
              ? subtitle.split('.')[0] + '.'
              : 'Thousands of loving pets are waiting for their forever homes'}
          </p>
        </div>
      </section>

      <section className={`${styles.container} ${styles['adopt-content']}`}>
        <Suspense fallback={<div className={styles.loading}>Loading filters...</div>}>
          <AdoptionListingsPage
            initialListings={listingsRes}
            breeds={breedsRes.data}
            cities={citiesRes.data}
            basePath="/adopt-a-pet"
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
