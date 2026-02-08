import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Heart, ArrowLeft, Check, X, MessageCircle, Share2, Phone, Mail } from 'lucide-react';
import { getAdoptionListing } from '@/lib/public-api';
import PetImageGallery from '@/components/pet/PetImageGallery';
import styles from './detail.module.css';
import ListingDetailedSeo from '@/components/seo/ListingDetailedSeo';
import ProtectedContact from '@/components/auth/ProtectedContact';


interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const petSlug = slug[slug.length - 1];
  const listing = await getAdoptionListing(petSlug);

  if (!listing) {
    return { title: 'Pet Not Found | mypaws' };
  }

  return {
    title: listing.seo?.title || `Adopt ${listing.pet.name} | mypaws`,
    description: listing.seo?.description,
    openGraph: {
      title: listing.seo?.title,
      description: listing.seo?.description,
      images: listing.pet.images?.[0]?.largeUrl ? [listing.pet.images[0].largeUrl] : [],
    },
    alternates: {
      canonical: listing.seo?.canonicalUrl,
    },
  };
}

export default async function PetDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const petSlug = slug[slug.length - 1];
  const listing = await getAdoptionListing(petSlug);

  if (!listing) {
    notFound();
  }

  const { pet, city, adoptionFee, feeIncludes, adopterRequirements, homeCheckRequired, publishedAt, viewCount } = listing;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pet.name,
    image: pet.images,
    description: pet.description || `Adopt ${pet.name}, a ${pet.gender} ${pet.breed?.name || pet.petType.name} in ${city.name}.`,
    sku: listing.id,
    mpn: listing.id,
    brand: {
      '@type': 'Brand',
      name: 'mypaws'
    },
    offers: {
      '@type': 'Offer',
      url: `https://mypaws.in/adopt-a-pet/${slug.join('/')}`,
      priceCurrency: 'INR',
      price: adoptionFee || 0,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition', // "Used" fits adoption better than "New" strictly speaking, or just omit
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Gender',
        value: pet.gender
      },
      {
        '@type': 'PropertyValue',
        name: 'Age',
        value: pet.ageDisplay
      },
      {
        '@type': 'PropertyValue',
        name: 'Breed',
        value: pet.breed?.name || pet.petType.name
      },
      {
        '@type': 'PropertyValue',
        name: 'Location',
        value: `${city.name}, ${city.state}`
      }
    ]
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://mypaws.in'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Adopt a Pet',
        item: 'https://mypaws.in/adopt-a-pet'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pet.name,
        item: `https://mypaws.in/adopt-a-pet/${slug.join('/')}`
      }
    ]
  };

  return (
    <main className={styles['pet-detail']}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav className={styles['pet-detail__nav']}>
        <div className={styles.container}>
          <Link href="/adopt-a-pet" className={styles['back-link']}>
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </Link>
        </div>
      </nav>

      <div className={`${styles.container} ${styles['pet-detail__main']}`}>
        {/* Image Gallery */}
        <section>
          <PetImageGallery images={pet.images} petName={pet.name} />
        </section>

        {/* Pet Info */}
        <section className={styles['pet-info']}>
          <header>
            <h1 className={styles['pet-info__name']}>Adopt {pet.name} in {city.name}</h1>
            <p className={styles['pet-info__breed']}>
              {pet.breed?.name || pet.petType.name} • {pet.ageDisplay}
            </p>
            <div className={styles['pet-info__location']}>
              <MapPin className="w-4 h-4" />
              {city.name}, {city.state}
            </div>
          </header>

          {/* Quick Stats */}
          <div className={styles['pet-stats']}>
            <div className={styles['pet-stat']}>
              <span className={styles['pet-stat__label']}>Gender</span>
              <span className={styles['pet-stat__value']}>{pet.gender}</span>
            </div>
            <div className={styles['pet-stat']}>
              <span className={styles['pet-stat__label']}>Size</span>
              <span className={styles['pet-stat__value']}>{pet.breed?.sizeCategory || 'Medium'}</span>
            </div>
            <div className={styles['pet-stat']}>
              <span className={styles['pet-stat__label']}>Vaccinated</span>
              <span className={styles['pet-stat__value']}>
                {pet.isVaccinated ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}
              </span>
            </div>
            <div className={styles['pet-stat']}>
              <span className={styles['pet-stat__label']}>Neutered</span>
              <span className={styles['pet-stat__value']}>
                {pet.isNeutered ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}
              </span>
            </div>
          </div>

          {/* Adoption Fee */}
          <div className={styles['pet-fee']}>
            <span className={styles['pet-fee__label']}>Adoption Fee</span>
            <span className={styles['pet-fee__amount']}>
              {adoptionFee === null || adoptionFee === 0 ? 'Free' : `₹${adoptionFee?.toLocaleString()}`}
            </span>
            {feeIncludes && feeIncludes.length > 0 && (
              <ul className={styles['pet-fee__includes']}>
                {feeIncludes.map((item: string, i: number) => (
                  <li key={i}><Check className="w-3 h-3" /> {item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Description */}
          {pet.description && (
            <div className={styles['pet-section']}>
              <h2 className={styles['pet-section__title']}>About {pet.name}</h2>
              <p className={styles['pet-section__text']}>{pet.description}</p>
            </div>
          )}

          {/* Temperament */}
          {pet.temperament && (
            <div className={styles['pet-section']}>
              <h2 className={styles['pet-section__title']}>Temperament</h2>
              <div className={styles['temperament-tags']}>
                {pet.temperament.goodWithKids && <span className={`${styles.tag} ${styles['tag--green']}`}>Good with kids</span>}
                {pet.temperament.goodWithDogs && <span className={`${styles.tag} ${styles['tag--blue']}`}>Good with dogs</span>}
                {pet.temperament.goodWithCats && <span className={`${styles.tag} ${styles['tag--purple']}`}>Good with cats</span>}
                {pet.temperament.traits?.map((trait: string, i: number) => (
                  <span key={i} className={styles.tag}>{trait}</span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {(adopterRequirements || homeCheckRequired) && (
            <div className={styles['pet-section']}>
              <h2 className={styles['pet-section__title']}>Adoption Requirements</h2>
              {homeCheckRequired && (
                <p className={styles['requirement-note']}>⚠️ Home visit required before adoption</p>
              )}
              {adopterRequirements && (
                <p className={styles['pet-section__text']}>{adopterRequirements}</p>
              )}
            </div>
          )}







          {/* CTA */}
          <div className={`${styles['pet-cta']} mt-8`}>
            <ProtectedContact label="Login to Contact Owner">
              <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
                <h3 className="font-semibold text-gray-900">Owner Contact</h3>
                {listing.owner.contactInfo?.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${listing.owner.contactInfo.phone}`} className="hover:text-primary-600 hover:underline">
                      {listing.owner.contactInfo.phone}
                    </a>
                  </div>
                )}
                {listing.owner.contactInfo?.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a href={`mailto:${listing.owner.contactInfo.email}`} className="hover:text-primary-600 hover:underline">
                      {listing.owner.contactInfo.email}
                    </a>
                  </div>
                )}
                <button className={`${styles.btn} ${styles['btn--primary']} w-full mt-2`}>
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </button>
              </div>
            </ProtectedContact>
            <button className={`${styles.btn} ${styles['btn--outline']}`}>
              <Heart className="w-5 h-5" />
              Save
            </button>
            <button className={`${styles.btn} ${styles['btn--outline']}`}>
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Meta Info */}
          <footer className={styles['pet-meta']}>
            <p>Posted {new Date(publishedAt).toLocaleDateString()}</p>
            <p>{viewCount} views</p>
          </footer>
          {/* Detailed SEO Content & FAQs */}

        </section>
      </div>

      <div className={styles.container} style={{ marginTop: '3rem', borderTop: '1px solid #e5e7eb', paddingTop: '3rem' }}>
        <ListingDetailedSeo
          mode="adoption"
          petName={pet.name}
          breedName={pet.breed?.name || pet.petType.name}
          cityName={city.name}
          stateName={city.state}
          ownerName={listing.ownerName || 'The Owner'}
          description={pet.description}
          gender={pet.gender}
          age={pet.ageDisplay}
          isVaccinated={pet.isVaccinated}
          isNeutered={pet.isNeutered}
          temperament={pet.temperament}
        />
      </div>
    </main>
  );
}
