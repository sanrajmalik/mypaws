# mypaws Frontend Architecture

> Agent 6 – Next.js Performance & SEO Engineer  
> Deliverable: Route map, rendering strategy, component hierarchy, SEO metadata, performance optimizations

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14.x (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| State | Zustand | 4.x |
| Data Fetching | React Query / SWR | 5.x |
| Forms | React Hook Form + Zod | |
| UI Components | Radix UI Primitives | |
| Icons | Lucide React | |
| Images | next/image + CloudFront | |
| Analytics | Google Analytics 4 | |

---

## 2. Route Map

### 2.1 Full Route Structure

```
app/
├── (marketing)/                    # Public marketing pages
│   ├── page.tsx                    # Homepage (/)
│   ├── about/page.tsx              # About us
│   ├── contact/page.tsx            # Contact
│   └── layout.tsx                  # Marketing layout
│
├── (adoption)/                     # Adoption routes
│   ├── adopt-a-pet/
│   │   └── page.tsx                # /adopt-a-pet (all pets)
│   ├── adopt-a-dog/
│   │   ├── page.tsx                # /adopt-a-dog
│   │   └── [breed]/
│   │       └── page.tsx            # /adopt-a-dog/labrador-retriever
│   ├── adopt-a-cat/
│   │   ├── page.tsx                # /adopt-a-cat
│   │   └── [breed]/
│   │       └── page.tsx            # /adopt-a-cat/persian
│   └── adopt-a-pet/
│       └── [slug]/
│           └── page.tsx            # /adopt-a-pet/labrador-dog-in-mumbai/abc123
│
├── (breeders)/                     # Breeder routes
│   ├── buy-dogs/
│   │   ├── page.tsx                # /buy-dogs
│   │   ├── [breed]/
│   │   │   └── page.tsx            # /buy-dogs/german-shepherd
│   │   └── [breed]-in-[city]/
│   │       └── page.tsx            # /buy-dogs/german-shepherd-in-bangalore
│   ├── buy-cats/
│   │   └── ...                     # Similar structure
│   └── breeders/
│       └── [slug]/
│           └── page.tsx            # /breeders/royal-paws-kennels
│
├── (breeds)/                       # Breed info pages
│   └── breeds/
│       ├── dogs/
│       │   └── [breed]/page.tsx    # /breeds/dogs/labrador-retriever
│       └── cats/
│           └── [breed]/page.tsx    # /breeds/cats/persian
│
├── (auth)/                         # Auth routes
│   ├── login/page.tsx              # /login
│   ├── auth/
│   │   └── callback/page.tsx       # /auth/callback (OAuth)
│   └── verify/page.tsx             # /verify (WhatsApp)
│
├── (dashboard)/                    # Protected user area
│   ├── dashboard/
│   │   ├── page.tsx                # /dashboard
│   │   ├── listings/
│   │   │   ├── page.tsx            # /dashboard/listings
│   │   │   ├── new/page.tsx        # /dashboard/listings/new
│   │   │   └── [id]/
│   │   │       └── edit/page.tsx   # /dashboard/listings/{id}/edit
│   │   ├── favorites/page.tsx      # /dashboard/favorites
│   │   └── settings/page.tsx       # /dashboard/settings
│   └── layout.tsx                  # Dashboard layout (protected)
│
├── (admin)/                        # Admin routes
│   └── admin/
│       ├── page.tsx                # /admin
│       ├── breeders/
│       │   └── pending/page.tsx    # /admin/breeders/pending
│       ├── listings/
│       │   └── reported/page.tsx   # /admin/listings/reported
│       └── layout.tsx              # Admin layout (role-protected)
│
├── api/                            # API routes (BFF)
│   ├── auth/
│   │   ├── google/route.ts         # OAuth callback handler
│   │   └── refresh/route.ts        # Token refresh
│   └── revalidate/route.ts         # ISR revalidation webhook
│
├── sitemap.ts                      # Dynamic sitemap generator
├── robots.ts                       # robots.txt generator
├── layout.tsx                      # Root layout
├── loading.tsx                     # Global loading UI
├── error.tsx                       # Global error boundary
└── not-found.tsx                   # 404 page
```

---

## 3. Rendering Strategy

### 3.1 Rendering Decision Matrix

| Route | Rendering | Revalidation | Reasoning |
|-------|-----------|--------------|-----------|
| `/` (Homepage) | ISR | 60s | SEO + fresh featured listings |
| `/adopt-a-dog` | ISR | 300s | SEO money page |
| `/adopt-a-dog/[breed]` | ISR | 300s | Programmatic SEO |
| `/adopt-a-pet/[...slug]` | ISR | 60s | Individual pet (needs freshness) |
| `/buy-dogs/[breed]-in-[city]` | ISR | 600s | Programmatic SEO |
| `/breeders/[slug]` | ISR | 300s | Breeder profile |
| `/breeds/dogs/[breed]` | SSG | On deploy | Static content |
| `/login` | SSR | N/A | Dynamic (session check) |
| `/dashboard/*` | CSR | N/A | Private, real-time |
| `/admin/*` | CSR | N/A | Private, real-time |

### 3.2 Data Fetching Patterns

```typescript
// ISR Page Example - Breed Listing
// app/(adoption)/adopt-a-dog/[breed]/page.tsx

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const breeds = await api.getActiveBreeds('dog');
  return breeds.map((breed) => ({ breed: breed.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const breed = await api.getBreed(params.breed);
  return {
    title: `Adopt ${breed.name} Dogs | mypaws`,
    description: `Find ${breed.name} dogs for adoption. ${breed.adoption_count} available now.`,
  };
}

export default async function BreedPage({ params }: Props) {
  const listings = await api.getAdoptionListings({ breed: params.breed });
  const breed = await api.getBreed(params.breed);
  
  return (
    <>
      <BreedHero breed={breed} />
      <ListingGrid listings={listings} />
      <BreedInfo breed={breed} />
    </>
  );
}
```

```typescript
// CSR Page Example - Dashboard
// app/(dashboard)/dashboard/listings/page.tsx

'use client';

import { useListings } from '@/hooks/useListings';

export default function MyListingsPage() {
  const { data, isLoading, error } = useListings();
  
  if (isLoading) return <ListingsSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <MyListingsView listings={data} />;
}
```

### 3.3 Server vs Client Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENT (Default)                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ✓ Page shells and layouts                                                      │
│  ✓ Data fetching (listings, breeds, etc.)                                       │
│  ✓ SEO metadata injection                                                       │
│  ✓ Structured data (JSON-LD)                                                    │
│  ✓ Static text content                                                          │
│  ✓ Image optimization                                                           │
│  ✓ Breadcrumbs                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CLIENT COMPONENT ('use client')                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ✓ Interactive filters (search, dropdowns)                                      │
│  ✓ Image carousel/gallery                                                       │
│  ✓ Contact modal (gated behind auth)                                            │
│  ✓ Favorite button                                                              │
│  ✓ Forms (listing creation, profile edit)                                       │
│  ✓ Auth state provider                                                          │
│  ✓ Toast notifications                                                          │
│  ✓ Mobile navigation                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Hierarchy

### 4.1 Core Layout Components

```
components/
├── layout/
│   ├── Header/
│   │   ├── Header.tsx              # Server component
│   │   ├── Navigation.tsx          # Server (links)
│   │   ├── MobileNav.tsx           # Client (hamburger menu)
│   │   ├── UserMenu.tsx            # Client (auth-dependent)
│   │   └── SearchBar.tsx           # Client (interactive)
│   ├── Footer/
│   │   ├── Footer.tsx              # Server
│   │   └── FooterLinks.tsx         # Server (SEO links)
│   └── Sidebar/
│       └── DashboardSidebar.tsx    # Client
│
├── ui/                             # Radix-based primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Dropdown.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Skeleton.tsx
│   └── Toast.tsx
│
├── pet/
│   ├── PetCard.tsx                 # Server (listing card)
│   ├── PetGrid.tsx                 # Server (grid container)
│   ├── PetDetail.tsx               # Server (detail view)
│   ├── PetGallery.tsx              # Client (carousel)
│   ├── PetFilters.tsx              # Client (filter bar)
│   └── PetFAQ.tsx                  # Server (FAQ accordion)
│
├── breeder/
│   ├── BreederCard.tsx             # Server
│   ├── BreederProfile.tsx          # Server
│   └── BreederBadge.tsx            # Server
│
├── listing/
│   ├── ListingForm/                # Client
│   │   ├── ListingForm.tsx
│   │   ├── PetDetailsStep.tsx
│   │   ├── PhotoUploadStep.tsx
│   │   └── ReviewStep.tsx
│   └── ListingStatus.tsx           # Server
│
├── auth/
│   ├── AuthProvider.tsx            # Client (context)
│   ├── LoginButton.tsx             # Client
│   ├── LoginModal.tsx              # Client
│   └── VerifyPhone.tsx             # Client
│
├── seo/
│   ├── Breadcrumbs.tsx             # Server
│   ├── JsonLd.tsx                  # Server
│   └── CanonicalUrl.tsx            # Server
│
└── shared/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── EmptyState.tsx
    └── Pagination.tsx              # Server (with client variant)
```

### 4.2 Page Component Pattern

```typescript
// Standard page structure
// app/(adoption)/adopt-a-dog/[breed]/page.tsx

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Server Components
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { PetGrid } from '@/components/pet/PetGrid';
import { BreedInfo } from '@/components/breed/BreedInfo';

// Client Components
import { PetFilters } from '@/components/pet/PetFilters';
import { ListingGridSkeleton } from '@/components/pet/ListingGridSkeleton';

export default async function BreedPage({ params, searchParams }) {
  const breed = await api.getBreed(params.breed);
  if (!breed) notFound();

  const listings = await api.getAdoptionListings({
    breed: params.breed,
    ...searchParams,
  });

  return (
    <>
      <JsonLd data={generateBreedListingSchema(breed, listings)} />
      <Breadcrumbs items={[/* ... */]} />
      
      <main>
        <h1>{breed.name} Dogs for Adoption</h1>
        
        <PetFilters 
          initialFilters={searchParams}
          breed={breed}
        />
        
        <Suspense fallback={<ListingGridSkeleton count={12} />}>
          <PetGrid listings={listings.data} />
        </Suspense>
        
        <Pagination 
          currentPage={listings.pagination.page}
          totalPages={listings.pagination.total_pages}
        />
        
        <BreedInfo breed={breed} />
      </main>
    </>
  );
}
```

---

## 5. SEO Metadata Strategy

### 5.1 Metadata Configuration

```typescript
// lib/metadata.ts

export function generateListingMetadata(listing: AdoptionListing): Metadata {
  const pet = listing.pet;
  const city = listing.city;
  
  return {
    title: `Adopt ${pet.name} - ${pet.breed.name} in ${city.name} | mypaws`,
    description: `Meet ${pet.name}, a ${pet.age_display} ${pet.gender} ${pet.breed.name} looking for adoption in ${city.name}. ${pet.is_vaccinated ? 'Vaccinated. ' : ''}Contact the owner on mypaws.`,
    
    openGraph: {
      title: `Adopt ${pet.name} - ${pet.breed.name} in ${city.name}`,
      description: `${pet.age_display} ${pet.gender} ${pet.breed.name} looking for a loving home`,
      url: `https://mypaws.in${listing.url}`,
      siteName: 'mypaws',
      images: [
        {
          url: pet.images[0]?.large_url,
          width: 1200,
          height: 630,
          alt: `${pet.name} the ${pet.breed.name}`,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `Adopt ${pet.name}`,
      description: `${pet.breed.name} for adoption in ${city.name}`,
      images: [pet.images[0]?.large_url],
    },
    
    alternates: {
      canonical: `https://mypaws.in${listing.url}`,
    },
    
    robots: {
      index: listing.status === 'active',
      follow: true,
    },
  };
}
```

### 5.2 Dynamic OG Images

```typescript
// app/api/og/route.tsx

import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const breed = searchParams.get('breed');
  const image = searchParams.get('image');
  
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        {/* OG Image design */}
        <img src={image} width="400" height="400" />
        <h1>{title}</h1>
        <p>{breed} for Adoption</p>
        <div>mypaws.in</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 5.3 Structured Data Components

```typescript
// components/seo/JsonLd.tsx

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Usage in page
<JsonLd data={{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `${pet.name} - ${pet.breed.name}`,
  // ... full schema
}} />
```

---

## 6. Performance Optimizations

### 6.1 Image Strategy

```typescript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.mypaws.in',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};
```

```typescript
// components/pet/PetCard.tsx

import Image from 'next/image';

export function PetCard({ pet }) {
  return (
    <article className="pet-card">
      <Image
        src={pet.primary_image.medium_url}
        alt={`${pet.name} the ${pet.breed.name}`}
        width={300}
        height={300}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        placeholder="blur"
        blurDataURL={pet.primary_image.blur_hash}
        priority={false}
      />
      {/* ... */}
    </article>
  );
}
```

### 6.2 Font Optimization

```typescript
// app/layout.tsx

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 6.3 Bundle Optimization

```typescript
// next.config.js

const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  webpack: (config, { isServer }) => {
    // Tree shake unused modules
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'lodash': 'lodash-es',
      };
    }
    return config;
  },
};
```

### 6.4 Caching Headers

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Cache static assets aggressively
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }
  
  // Cache API responses
  if (request.nextUrl.pathname.startsWith('/api/public')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
  }
  
  return response;
}
```

### 6.5 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | - |
| FID | < 100ms | - |
| CLS | < 0.1 | - |
| TTFB | < 200ms | - |
| Bundle Size (First Load) | < 100KB | - |

---

## 7. State Management

### 7.1 Client State (Zustand)

```typescript
// stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 7.2 Server State (React Query)

```typescript
// hooks/useListings.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => api.getListings(filters),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
```

---

## 8. Authentication Flow (Frontend)

### 8.1 Auth Provider

```typescript
// components/auth/AuthProvider.tsx

'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }) {
  const { isLoading, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <AuthLoadingScreen />;
  }
  
  return <>{children}</>;
}
```

### 8.2 Protected Route

```typescript
// components/auth/ProtectedRoute.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children, requiredVerification = false }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + window.location.pathname);
      return;
    }
    
    if (requiredVerification && !user?.phone_verified) {
      router.push('/verify?redirect=' + window.location.pathname);
      return;
    }
  }, [isAuthenticated, user, requiredVerification, router]);
  
  if (!isAuthenticated) return null;
  if (requiredVerification && !user?.phone_verified) return null;
  
  return <>{children}</>;
}
```

---

## 9. Error Handling

### 9.1 Global Error Boundary

```typescript
// app/error.tsx

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="error-page">
      <h2>Something went wrong!</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
```

### 9.2 404 Page

```typescript
// app/not-found.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
```

---

## 10. Folder Structure Summary

```
mypaws-frontend/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages
│   ├── (adoption)/               # Adoption routes
│   ├── (breeders)/               # Breeder routes
│   ├── (dashboard)/              # Protected user area
│   ├── (admin)/                  # Admin panel
│   ├── api/                      # API routes (BFF)
│   ├── layout.tsx
│   └── globals.css
├── components/                   # React components
│   ├── layout/
│   ├── ui/
│   ├── pet/
│   ├── breeder/
│   ├── listing/
│   ├── auth/
│   ├── seo/
│   └── shared/
├── lib/                          # Utilities
│   ├── api.ts                    # API client
│   ├── utils.ts                  # Helpers
│   ├── metadata.ts               # SEO helpers
│   └── schemas.ts                # Zod schemas
├── hooks/                        # Custom hooks
│   ├── useListings.ts
│   ├── useAuth.ts
│   └── useFavorites.ts
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   └── filterStore.ts
├── types/                        # TypeScript types
│   ├── api.ts
│   ├── pet.ts
│   └── user.ts
├── public/                       # Static assets
│   ├── images/
│   └── icons/
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

---

*This document defines frontend architecture. Implementation details are determined during development.*
