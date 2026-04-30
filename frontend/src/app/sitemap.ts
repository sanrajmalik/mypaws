import { MetadataRoute } from 'next';
import { getBreeds, getCities } from '@/lib/public-api';

const BASE_URL = 'https://mypaws.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    // Main hub pages
    { url: `${BASE_URL}/buy-cats`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/buy-dogs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/adopt-a-cat`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/adopt-a-dog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/adopt-a-pet`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];

  // 2. Fetch breeds and cities
  let catBreeds: { slug: string }[] = [];
  let dogBreeds: { slug: string }[] = [];
  let cities: { slug: string }[] = [];

  try {
    const [catBreedsRes, dogBreedsRes, citiesRes] = await Promise.all([
      getBreeds({ petType: 'cat', limit: 0 }),
      getBreeds({ petType: 'dog', limit: 0 }),
      getCities({ limit: 0 }),
    ]);
    catBreeds = catBreedsRes?.data || [];
    dogBreeds = dogBreedsRes?.data || [];
    cities = citiesRes?.data || [];
  } catch (e) {
    console.error('Sitemap: Failed to fetch breeds/cities', e);
  }

  // 3. Breed-specific pages (high value — users search "buy persian kitten")
  const buyCatBreedPages: MetadataRoute.Sitemap = catBreeds.map(breed => ({
    url: `${BASE_URL}/buy-cats?breed=${breed.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const buyDogBreedPages: MetadataRoute.Sitemap = dogBreeds.map(breed => ({
    url: `${BASE_URL}/buy-dogs?breed=${breed.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const adoptCatBreedPages: MetadataRoute.Sitemap = catBreeds.map(breed => ({
    url: `${BASE_URL}/adopt-a-cat?breed=${breed.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const adoptDogBreedPages: MetadataRoute.Sitemap = dogBreeds.map(breed => ({
    url: `${BASE_URL}/adopt-a-dog?breed=${breed.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 4. City-specific pages (high value — users search "buy puppies in mumbai")
  //    Limit to top 30 cities to avoid bloat
  const topCities = cities.slice(0, 30);

  const buyCatCityPages: MetadataRoute.Sitemap = topCities.map(city => ({
    url: `${BASE_URL}/buy-cats?city=${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const buyDogCityPages: MetadataRoute.Sitemap = topCities.map(city => ({
    url: `${BASE_URL}/buy-dogs?city=${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const adoptCatCityPages: MetadataRoute.Sitemap = topCities.map(city => ({
    url: `${BASE_URL}/adopt-a-cat?city=${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const adoptDogCityPages: MetadataRoute.Sitemap = topCities.map(city => ({
    url: `${BASE_URL}/adopt-a-dog?city=${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // NOTE: We intentionally do NOT include breed×city cross-products, gender/price
  // filter combos, or paginated URLs in the sitemap. Only breed-only and city-only
  // pages are included as they target distinct high-value search intents.

  return [
    ...staticPages,
    ...buyCatBreedPages,
    ...buyDogBreedPages,
    ...adoptCatBreedPages,
    ...adoptDogBreedPages,
    ...buyCatCityPages,
    ...buyDogCityPages,
    ...adoptCatCityPages,
    ...adoptDogCityPages,
  ];
}
