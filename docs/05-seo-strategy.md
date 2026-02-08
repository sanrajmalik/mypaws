# mypaws SEO Strategy

> Agent 5 – Marketplace SEO Strategist  
> Deliverable: Keyword clustering, URL hierarchy, programmatic SEO templates, internal linking, structured data, E-E-A-T signals

---

## 1. Keyword Universe

### 1.1 Primary Intent Categories

| Intent | Example Keywords | Volume Tier | Competition |
|--------|-----------------|-------------|-------------|
| Adopt Dogs | "adopt a dog", "dog adoption near me", "rescue dogs for adoption" | High | Medium |
| Adopt Cats | "adopt a cat", "cat adoption", "rescue cats near me" | High | Medium |
| Buy Dogs | "buy labrador puppy", "{breed} puppy price", "dog breeder near me" | High | High |
| Buy Cats | "buy persian cat", "{breed} kitten price", "cat breeder" | Medium | Medium |
| Breed Info | "{breed} dog price in india", "{breed} characteristics" | High | Low |
| Location | "pet adoption in mumbai", "dog adoption delhi" | Medium | Low |

### 1.2 Keyword Clustering

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         KEYWORD CLUSTER HIERARCHY                                │
└─────────────────────────────────────────────────────────────────────────────────┘

TIER 1: HIGH-VOLUME HEAD TERMS
├── "adopt a dog" (target: /adopt-a-dog)
├── "adopt a cat" (target: /adopt-a-cat)
├── "buy {breed} puppy" (target: /buy-dogs/{breed})
└── "dog adoption near me" (target: /adopt-a-dog + geo)

TIER 2: BREED-SPECIFIC
├── "labrador adoption" (target: /adopt-a-dog/labrador-retriever)
├── "german shepherd puppy for sale" (target: /buy-dogs/german-shepherd)
├── "persian cat for adoption" (target: /adopt-a-cat/persian)
└── "{breed} price in india" (target: /buy-dogs/{breed})

TIER 3: BREED + LOCATION
├── "adopt labrador in mumbai" (target: /adopt-a-pet/labrador-retriever-dog-in-mumbai)
├── "german shepherd breeders bangalore" (target: /buy-dogs/german-shepherd-in-bangalore)
└── "dog adoption pune" (target: /adopt-a-dog?city=pune)

TIER 4: LONG-TAIL
├── "free dog adoption mumbai"
├── "vaccinated labrador puppy for sale"
└── "small dogs for adoption in apartment"
```

### 1.3 Target Keyword Map

| Page Type | Primary Keyword | Secondary Keywords |
|-----------|----------------|-------------------|
| `/adopt-a-dog` | adopt a dog | dog adoption, rescue dogs, dogs for adoption |
| `/adopt-a-cat` | adopt a cat | cat adoption, rescue cats, cats for adoption |
| `/adopt-a-dog/{breed}` | {breed} for adoption | adopt {breed}, {breed} rescue |
| `/adopt-a-pet/{breed}-dog-in-{city}` | {breed} adoption {city} | adopt {breed} in {city} |
| `/buy-dogs/{breed}` | buy {breed} puppy | {breed} puppy price, {breed} for sale |
| `/buy-dogs/{breed}-in-{city}` | {breed} breeders {city} | buy {breed} in {city} |
| `/breeders/{slug}` | {breeder_name} | {breeder} {breed} puppies |

---

## 2. URL Hierarchy

### 2.1 URL Structure

```
mypaws.in/
│
├── /adopt-a-pet                          # Main adoption hub
│   ├── /adopt-a-dog                      # Dog adoption landing
│   │   ├── /labrador-retriever           # Breed-specific dog page
│   │   └── ...
│   ├── /adopt-a-cat                      # Cat adoption landing
│   │   ├── /persian                      # Breed-specific cat page
│   │   └── ...
│   │
│   └── /{breed}-{type}-in-{city}/        # Programmatic SEO pages
│       └── {pet-id}                      # Individual pet page
│
├── /buy-dogs                             # Breeder hub for dogs
│   ├── /{breed}                          # Breed listing page
│   └── /{breed}-in-{city}                # Programmatic SEO page
│
├── /buy-cats                             # Breeder hub for cats
│   ├── /{breed}                          # Breed listing page
│   └── /{breed}-in-{city}                # Programmatic SEO page
│
├── /breeders                             # Breeder directory
│   └── /{breeder-slug}                   # Breeder profile page
│
├── /breeds                               # Breed encyclopedia
│   ├── /dogs/{breed-slug}                # Dog breed info page
│   └── /cats/{breed-slug}                # Cat breed info page
│
└── /cities                               # Location hub
    └── /{city-slug}                      # City landing page
```

### 2.2 URL Rules

| Rule | Implementation |
|------|----------------|
| Lowercase only | Transform to lowercase before save |
| Hyphens as separators | Replace spaces with hyphens |
| No trailing slashes | Redirect to non-trailing version |
| Canonical URLs | Self-referencing canonical on all pages |
| No URL parameters for SEO pages | Use path segments instead |
| Max 3 path segments | Keep URLs shallow |

### 2.3 URL Generation Logic

```python
# Adoption listing URL
def generate_adoption_url(breed_slug, pet_type_slug, city_slug, pet_id_short):
    # Output: /adopt-a-pet/labrador-retriever-dog-in-mumbai/abc123
    return f"/adopt-a-pet/{breed_slug}-{pet_type_slug}-in-{city_slug}/{pet_id_short}"

# Breeder listing URL
def generate_breeder_listing_url(breed_slug, city_slug, listing_id_short):
    # Output: /buy-dogs/labrador-retriever-in-mumbai/xyz789
    return f"/buy-dogs/{breed_slug}-in-{city_slug}/{listing_id_short}"
```

---

## 3. Programmatic SEO Templates

### 3.1 Template: Breed + City Adoption Page

**URL Pattern:** `/adopt-a-pet/{breed}-{type}-in-{city}`

**Example:** `/adopt-a-pet/labrador-retriever-dog-in-mumbai`

```html
<!-- Title Tag -->
<title>Adopt Labrador Retriever Dogs in Mumbai | {count} Available - mypaws</title>

<!-- Meta Description -->
<meta name="description" content="Find Labrador Retriever dogs for adoption in Mumbai. {count} Labradors available now. Vaccinated, health-checked pets looking for loving homes. Adopt, don't shop!">

<!-- H1 -->
<h1>Labrador Retriever Dogs for Adoption in Mumbai</h1>

<!-- Intro Paragraph -->
<p>Looking to adopt a Labrador Retriever in Mumbai? Browse {count} loving Labradors waiting for their forever home. All pets on mypaws are from verified owners, with health records and vaccination details available.</p>

<!-- Listings Grid -->
{dynamic_listings}

<!-- Breed Info Section -->
<section>
  <h2>About Labrador Retrievers</h2>
  <p>{breed_description}</p>
  
  <h3>Labrador Retriever Characteristics</h3>
  <ul>
    <li>Size: Large (25-36 kg)</li>
    <li>Life Expectancy: 10-12 years</li>
    <li>Temperament: Friendly, Active, Outgoing</li>
    <li>Good with: Children, Other Dogs</li>
  </ul>
</section>

<!-- City Info Section -->
<section>
  <h2>Pet Adoption in Mumbai</h2>
  <p>{city_adoption_info}</p>
</section>

<!-- FAQ Section -->
<section>
  <h2>Frequently Asked Questions</h2>
  <h3>How do I adopt a Labrador in Mumbai?</h3>
  <p>Browse available Labradors on this page, create a free account, verify your phone number, and contact the pet owner directly through mypaws.</p>
  
  <h3>What is the adoption fee for a Labrador?</h3>
  <p>Adoption fees vary by owner. Many pets are free to adopt, while some may have a small fee to cover vaccinations and neutering costs.</p>
</section>

<!-- Related Links -->
<section>
  <h2>More Adoption Options</h2>
  <ul>
    <li><a href="/adopt-a-pet/golden-retriever-dog-in-mumbai">Golden Retrievers in Mumbai</a></li>
    <li><a href="/adopt-a-pet/labrador-retriever-dog-in-pune">Labradors in Pune</a></li>
    <li><a href="/adopt-a-dog">All Dogs for Adoption</a></li>
  </ul>
</section>
```

### 3.2 Template: Breeder + City Page

**URL Pattern:** `/buy-dogs/{breed}-in-{city}`

**Example:** `/buy-dogs/german-shepherd-in-bangalore`

```html
<!-- Title Tag -->
<title>German Shepherd Breeders in Bangalore | Verified Puppies - mypaws</title>

<!-- Meta Description -->
<meta name="description" content="Find verified German Shepherd breeders in Bangalore. {count} puppies available from ethical breeders. Health certificates, pedigree papers, and home delivery available.">

<!-- H1 -->
<h1>German Shepherd Puppies for Sale in Bangalore</h1>

<!-- Trust Banner -->
<div class="trust-banner">
  ✓ All breeders verified by mypaws team
  ✓ Health certificates provided
  ✓ 7-day health guarantee
</div>

<!-- Listings Grid -->
{dynamic_listings}

<!-- Price Guide Section -->
<section>
  <h2>German Shepherd Price in Bangalore</h2>
  <p>German Shepherd puppy prices in Bangalore typically range from ₹{min_price} to ₹{max_price}, depending on pedigree, breeder reputation, and lineage.</p>
  
  <table>
    <tr><th>Type</th><th>Price Range</th></tr>
    <tr><td>Pet Quality</td><td>₹15,000 - ₹30,000</td></tr>
    <tr><td>Show Quality</td><td>₹30,000 - ₹60,000</td></tr>
    <tr><td>Import Lineage</td><td>₹60,000+</td></tr>
  </table>
</section>

<!-- Breed Info -->
<section>
  <h2>About German Shepherds</h2>
  {breed_info}
</section>

<!-- Buying Guide -->
<section>
  <h2>How to Buy a German Shepherd Puppy</h2>
  <ol>
    <li>Research breeders on this page - check reviews and verification badges</li>
    <li>Contact 2-3 breeders to compare</li>
    <li>Visit the facility if possible</li>
    <li>Ask for health certificates and parent details</li>
    <li>Complete payment only after seeing the puppy</li>
  </ol>
</section>
```

### 3.3 Template: Individual Pet Page

**URL Pattern:** `/adopt-a-pet/{breed}-{type}-in-{city}/{pet-id}`

```html
<!-- Title Tag -->
<title>Adopt Bruno - Labrador Retriever in Mumbai | mypaws</title>

<!-- Meta Description -->
<meta name="description" content="Meet Bruno, a 2-year-old male Labrador Retriever looking for adoption in Mumbai. Vaccinated, neutered, great with kids. Contact the owner on mypaws.">

<!-- OpenGraph -->
<meta property="og:title" content="Adopt Bruno - Labrador in Mumbai">
<meta property="og:description" content="2-year-old Labrador looking for a loving home">
<meta property="og:image" content="https://cdn.mypaws.in/pets/p0000001/og/img1.jpg">
<meta property="og:type" content="website">

<!-- Breadcrumbs -->
<nav aria-label="breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/adopt-a-dog">Adopt a Dog</a></li>
    <li><a href="/adopt-a-pet/labrador-retriever-dog-in-mumbai">Labradors in Mumbai</a></li>
    <li>Bruno</li>
  </ol>
</nav>

<!-- H1 -->
<h1>Meet Bruno</h1>

<!-- Pet Details -->
{pet_content}

<!-- Structured Data -->
<script type="application/ld+json">
{structured_data}
</script>
```

---

## 4. Internal Linking Strategy

### 4.1 Link Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INTERNAL LINK STRUCTURE                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   HOMEPAGE   │
                              └──────┬───────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌────────────┐         ┌────────────┐         ┌────────────┐
       │ /adopt-a-dog│        │ /adopt-a-cat│        │ /buy-dogs  │
       └──────┬─────┘         └──────┬─────┘         └──────┬─────┘
              │                      │                      │
    ┌─────────┼─────────┐   ┌────────┼────────┐   ┌─────────┼─────────┐
    │         │         │   │        │        │   │         │         │
    ▼         ▼         ▼   ▼        ▼        ▼   ▼         ▼         ▼
 /labrador /german   ...  /persian /siamese ... /labrador /german   ...
    │         │              │        │            │         │
    ▼         ▼              ▼        ▼            ▼         ▼
 /in-mumbai  /in-delhi   /in-mumbai /in-bangalore /in-mumbai ...
    │         │              │        │            │
    ▼         ▼              ▼        ▼            ▼
 [listings] [listings]   [listings] [listings] [listings]
```

### 4.2 Contextual Link Rules

| Page Type | Must Link To |
|-----------|-------------|
| Homepage | Top 5 adoption cities, Top 5 breeds, Top breeders |
| Breed landing | City sub-pages, Related breeds, Individual listings |
| City landing | Breed sub-pages, Nearby cities, Individual listings |
| Individual listing | Same breed listings, Same city listings, Related breeds |
| Breeder profile | All breeder listings, Breed info pages |

### 4.3 Footer Link Strategy

```html
<footer>
  <!-- Adoption Cities -->
  <section>
    <h4>Pet Adoption by City</h4>
    <ul>
      <li><a href="/adopt-a-pet?city=mumbai">Mumbai</a></li>
      <li><a href="/adopt-a-pet?city=delhi">Delhi</a></li>
      <li><a href="/adopt-a-pet?city=bangalore">Bangalore</a></li>
      <!-- ... top 10 cities -->
    </ul>
  </section>
  
  <!-- Popular Breeds -->
  <section>
    <h4>Popular Dog Breeds</h4>
    <ul>
      <li><a href="/adopt-a-dog/labrador-retriever">Labrador Retriever</a></li>
      <li><a href="/adopt-a-dog/german-shepherd">German Shepherd</a></li>
      <!-- ... top 10 breeds -->
    </ul>
  </section>
  
  <!-- Breed Info -->
  <section>
    <h4>Dog Breed Information</h4>
    <ul>
      <li><a href="/breeds/dogs/labrador-retriever">Labrador Guide</a></li>
      <!-- ... -->
    </ul>
  </section>
</footer>
```

### 4.4 Breadcrumb Strategy

Every page includes JSON-LD breadcrumbs:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://mypaws.in/"},
    {"@type": "ListItem", "position": 2, "name": "Adopt a Dog", "item": "https://mypaws.in/adopt-a-dog"},
    {"@type": "ListItem", "position": 3, "name": "Labradors in Mumbai", "item": "https://mypaws.in/adopt-a-pet/labrador-retriever-dog-in-mumbai"},
    {"@type": "ListItem", "position": 4, "name": "Bruno"}
  ]
}
```

---

## 5. Schema.org Structured Data

### 5.1 Product Schema (Individual Pet Listing)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Bruno - Labrador Retriever for Adoption",
  "description": "2-year-old male Labrador Retriever looking for adoption in Mumbai. Vaccinated and neutered.",
  "image": [
    "https://cdn.mypaws.in/pets/p0000001/large/img1.jpg",
    "https://cdn.mypaws.in/pets/p0000001/large/img2.jpg"
  ],
  "brand": {
    "@type": "Brand",
    "name": "mypaws"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://mypaws.in/adopt-a-pet/labrador-retriever-dog-in-mumbai/p0000001",
    "priceCurrency": "INR",
    "price": "0",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Person",
      "name": "Demo User"
    }
  },
  "additionalProperty": [
    {"@type": "PropertyValue", "name": "Breed", "value": "Labrador Retriever"},
    {"@type": "PropertyValue", "name": "Age", "value": "2 years"},
    {"@type": "PropertyValue", "name": "Gender", "value": "Male"},
    {"@type": "PropertyValue", "name": "Location", "value": "Mumbai, Maharashtra"}
  ]
}
```

### 5.2 LocalBusiness Schema (Breeder Profile)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Royal Paws Kennels",
  "description": "Ethical German Shepherd and Labrador breeder in Bangalore",
  "image": "https://cdn.mypaws.in/breeders/b0001/logo.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Pet Lane",
    "addressLocality": "Bangalore",
    "addressRegion": "Karnataka",
    "postalCode": "560001",
    "addressCountry": "IN"
  },
  "telephone": "+919876543210",
  "url": "https://mypaws.in/breeders/royal-paws-kennels",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24"
  },
  "priceRange": "₹₹"
}
```

### 5.3 FAQ Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I adopt a dog in Mumbai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Browse available dogs on mypaws, create a free account, verify your phone, and contact owners directly."
      }
    },
    {
      "@type": "Question",
      "name": "What is the adoption fee?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Many pets are free to adopt. Some owners charge a small fee to cover vaccination and neutering costs."
      }
    }
  ]
}
```

### 5.4 Article Schema (Breed Info Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Labrador Retriever: Complete Breed Guide",
  "description": "Everything you need to know about Labrador Retrievers - characteristics, care, health, and adoption tips.",
  "author": {
    "@type": "Organization",
    "name": "mypaws"
  },
  "publisher": {
    "@type": "Organization",
    "name": "mypaws",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mypaws.in/logo.png"
    }
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-02-06"
}
```

---

## 6. E-E-A-T Signals

### 6.1 Experience Signals

| Signal | Implementation |
|--------|---------------|
| User reviews on breeders | Star ratings + text reviews |
| Verified adoption success | "Adopted" badges with testimonials |
| Owner response time | "Usually responds within X hours" |
| Platform usage stats | "X pets adopted through mypaws" |

### 6.2 Expertise Signals

| Signal | Implementation |
|--------|---------------|
| Breed guides | In-depth, researched content |
| Pet care articles | Authored content with sources |
| Veterinarian partnerships | "Health info verified by ABC Vet Clinic" |
| Breeder verification | Certified ethical breeder badges |

### 6.3 Authoritativeness Signals

| Signal | Implementation |
|--------|---------------|
| External links | Link to reputable pet organizations (PETA, Kennel clubs) |
| Citations | Source claims in breed guides |
| Press mentions | Featured in section on homepage |
| Partnerships | Logos of partner shelters/NGOs |

### 6.4 Trust Signals

| Signal | Implementation |
|--------|---------------|
| SSL certificate | HTTPS everywhere |
| Clear contact info | Address, phone, email in footer |
| Privacy policy | GDPR/India law compliant |
| Terms of service | Clear user agreement |
| Refund policy | For paid listings |
| WhatsApp verification | Verified contact badge |
| Admin-approved breeders | Verification badge system |

---

## 7. Technical SEO Checklist

### 7.1 Page Speed

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Image optimization (next/image with CDN)
- [ ] CSS/JS minification
- [ ] Font preloading

### 7.2 Crawlability

- [ ] XML sitemap (auto-generated)
- [ ] robots.txt (allow all SEO pages)
- [ ] No orphan pages
- [ ] Max 3 clicks to any page

### 7.3 Indexability

- [ ] Self-referencing canonicals
- [ ] No duplicate content
- [ ] hreflang (future: multi-language)
- [ ] Pagination with rel=next/prev or infinite scroll with view-all option

### 7.4 Mobile

- [ ] Responsive design
- [ ] Mobile-first indexing ready
- [ ] Touch-friendly UI
- [ ] No horizontal scroll

---

## 8. Sitemap Strategy

### 8.1 Sitemap Structure

```
/sitemap.xml (sitemap index)
├── /sitemap-static.xml         # Homepage, about, contact
├── /sitemap-breeds.xml         # All breed pages
├── /sitemap-cities.xml         # All city pages
├── /sitemap-adoption.xml       # Paginated adoption listings
├── /sitemap-breeders.xml       # Breeder profiles
└── /sitemap-breeder-listings.xml # Breeder listings
```

### 8.2 Sitemap Generation

- Auto-generate on build + ISR
- Include `lastmod` for all dynamic pages
- Priority: Homepage (1.0) > Category (0.8) > Listing (0.6)
- Max 50,000 URLs per sitemap file

---

## 9. Content Calendar (SEO)

### 9.1 Programmatic Page Generation

| Trigger | Action |
|---------|--------|
| New city added | Generate city landing page |
| New breed added | Generate breed landing + city variants |
| Listing count > 0 | Enable city+breed page |
| Listing count = 0 | noindex city+breed page |

### 9.2 Editorial Content

| Content Type | Frequency | SEO Purpose |
|--------------|-----------|-------------|
| Breed guides | 2/month | Topical authority |
| Pet care tips | 4/month | Long-tail traffic |
| Adoption stories | 2/month | E-E-A-T, engagement |
| City guides | 1/month | Location authority |

---

*This document defines SEO strategy. Implementation details are covered in Frontend and Content agent deliverables.*
