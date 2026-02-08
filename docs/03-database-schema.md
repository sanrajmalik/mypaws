# mypaws Database Schema

> Agent 3 – PostgreSQL Data Architect  
> Deliverable: Normalized, scalable database schema with table definitions, relationships, indexes, and sample data

---

## 1. Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA MAP                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    USERS     │     │    PETS      │     │   BREEDERS   │     │  LOCATIONS   │
│              │     │              │     │              │     │              │
│ users        │────►│ pets         │     │ breeder_     │     │ countries    │
│ user_sessions│     │ pet_images   │     │ profiles     │     │ states       │
│ verification_│     │ pet_health   │     │ breeder_     │     │ cities       │
│ attempts     │     │ pet_faqs     │     │ applications │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       │                    ▼                    │                    │
       │            ┌──────────────┐             │                    │
       │            │   LISTINGS   │◄────────────┘                    │
       │            │              │                                  │
       └───────────►│ adoption_    │◄─────────────────────────────────┘
                    │ listings     │
                    │ breeder_     │
                    │ listings     │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐     ┌──────────────┐
                    │   PAYMENTS   │     │    ADMIN     │
                    │              │     │              │
                    │ payments     │     │ audit_logs   │
                    │ listing_usage│     │ reports      │
                    └──────────────┘     │ moderation_  │
                                         │ actions      │
                                         └──────────────┘
```

---

## 2. Core Design Principles

| Principle | Implementation |
|-----------|---------------|
| Soft Deletes | `deleted_at TIMESTAMPTZ` on all main tables |
| Audit Fields | `created_at`, `updated_at` on all tables |
| SEO Slugs | `slug VARCHAR(255)` with uniqueness constraints |
| Normalization | 3NF with strategic denormalization for reads |
| UUID Primary Keys | `UUID DEFAULT gen_random_uuid()` |
| Enum as VARCHAR | Avoid PostgreSQL ENUM for flexibility |
| Indexes | B-tree for lookups, GIN for full-text search |

---

## 3. Location Tables

### 3.1 Countries

```sql
CREATE TABLE countries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    iso_code        CHAR(2) NOT NULL UNIQUE,       -- IN, US, UK
    phone_code      VARCHAR(5) NOT NULL,           -- +91
    is_active       BOOLEAN NOT NULL DEFAULT true,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO countries (name, slug, iso_code, phone_code) VALUES
('India', 'india', 'IN', '+91');
```

### 3.2 States

```sql
CREATE TABLE states (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id      UUID NOT NULL REFERENCES countries(id),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    state_code      VARCHAR(10),                   -- MH, KA, DL
    is_active       BOOLEAN NOT NULL DEFAULT true,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(country_id, slug)
);

CREATE INDEX idx_states_country ON states(country_id);
CREATE INDEX idx_states_slug ON states(slug);
```

### 3.3 Cities

```sql
CREATE TABLE cities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id        UUID NOT NULL REFERENCES states(id),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    
    -- SEO metadata
    meta_title      VARCHAR(160),
    meta_description VARCHAR(320),
    
    -- Geo data
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    
    -- Stats (denormalized for performance)
    adoption_count  INTEGER NOT NULL DEFAULT 0,
    breeder_count   INTEGER NOT NULL DEFAULT 0,
    
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(state_id, slug)
);

CREATE INDEX idx_cities_state ON cities(state_id);
CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_featured ON cities(is_featured) WHERE is_active = true;
```

---

## 4. Pet Type & Breed Tables

### 4.1 Pet Types

```sql
CREATE TABLE pet_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,   -- Dog, Cat
    slug            VARCHAR(50) NOT NULL UNIQUE,   -- dog, cat
    plural_name     VARCHAR(50) NOT NULL,          -- Dogs, Cats
    icon_url        TEXT,
    
    is_active       BOOLEAN NOT NULL DEFAULT true,
    display_order   INTEGER NOT NULL DEFAULT 0,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data
INSERT INTO pet_types (name, slug, plural_name, display_order) VALUES
('Dog', 'dog', 'Dogs', 1),
('Cat', 'cat', 'Cats', 2);
```

### 4.2 Breeds

```sql
CREATE TABLE breeds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_type_id     UUID NOT NULL REFERENCES pet_types(id),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    
    -- Breed info
    origin_country  VARCHAR(100),
    size_category   VARCHAR(20),                   -- small, medium, large, giant
    life_expectancy_min INTEGER,
    life_expectancy_max INTEGER,
    
    -- SEO
    description     TEXT,
    meta_title      VARCHAR(160),
    meta_description VARCHAR(320),
    
    -- Media
    image_url       TEXT,
    
    -- Stats (denormalized)
    adoption_count  INTEGER NOT NULL DEFAULT 0,
    breeder_count   INTEGER NOT NULL DEFAULT 0,
    
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_popular      BOOLEAN NOT NULL DEFAULT false,
    display_order   INTEGER NOT NULL DEFAULT 0,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(pet_type_id, slug)
);

CREATE INDEX idx_breeds_pet_type ON breeds(pet_type_id);
CREATE INDEX idx_breeds_slug ON breeds(slug);
CREATE INDEX idx_breeds_popular ON breeds(is_popular) WHERE is_active = true;
```

---

## 5. User Tables

### 5.1 Users (Extended from Auth doc)

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    email           VARCHAR(255) NOT NULL UNIQUE,
    email_verified  BOOLEAN NOT NULL DEFAULT true,
    google_id       VARCHAR(255) UNIQUE,
    
    -- Phone
    phone           VARCHAR(20),
    phone_verified  BOOLEAN NOT NULL DEFAULT false,
    phone_verified_at TIMESTAMPTZ,
    
    -- Profile
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    bio             TEXT,
    
    -- Location (optional)
    city_id         UUID REFERENCES cities(id),
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'registered',
    suspended_at    TIMESTAMPTZ,
    suspension_reason TEXT,
    
    -- Listing quotas (denormalized for quick checks)
    free_adoption_used BOOLEAN NOT NULL DEFAULT false,
    free_breeder_used  BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    
    CONSTRAINT chk_user_status CHECK (status IN (
        'registered', 'verified', 'breeder_pending', 
        'breeder_approved', 'breeder_rejected', 'suspended'
    )),
    CONSTRAINT chk_phone_format CHECK (phone ~ '^\+[1-9]\d{6,14}$' OR phone IS NULL)
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_city ON users(city_id);
```

---

## 6. Pet Tables

### 6.1 Pets

```sql
CREATE TABLE pets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classification
    pet_type_id     UUID NOT NULL REFERENCES pet_types(id),
    breed_id        UUID REFERENCES breeds(id),     -- NULL for mixed/unknown
    
    -- Basic info
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,   -- generated: {name}-{breed}-{uuid-short}
    gender          VARCHAR(10) NOT NULL,           -- male, female
    
    -- Age (stored as approximate date of birth)
    date_of_birth   DATE,
    age_years       INTEGER,                        -- For display if DOB unknown
    age_months      INTEGER,
    
    -- Physical
    color           VARCHAR(50),
    size_category   VARCHAR(20),                    -- small, medium, large
    weight_kg       DECIMAL(5, 2),
    
    -- Status
    is_neutered     BOOLEAN,
    is_vaccinated   BOOLEAN,
    vaccination_details TEXT,
    
    -- Temperament (stored as JSONB for flexibility)
    temperament     JSONB,
    /*
    {
        "good_with_kids": true,
        "good_with_dogs": true,
        "good_with_cats": false,
        "energy_level": "high",
        "training_level": "basic",
        "traits": ["playful", "loyal", "protective"]
    }
    */
    
    -- Content sections
    fun_facts       TEXT[],
    rescue_story    TEXT,
    description     TEXT,                           -- Long-form narrative
    
    -- Location
    city_id         UUID NOT NULL REFERENCES cities(id),
    
    -- Owner
    owner_id        UUID NOT NULL REFERENCES users(id),
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    
    CONSTRAINT chk_pet_gender CHECK (gender IN ('male', 'female'))
);

-- Indexes for SEO and search
CREATE INDEX idx_pets_pet_type ON pets(pet_type_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pets_breed ON pets(breed_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pets_city ON pets(city_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pets_owner ON pets(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pets_slug ON pets(slug);

-- Composite index for SEO URLs: /adopt-a-pet/{breed}-{type}-in-{city}
CREATE INDEX idx_pets_seo_lookup ON pets(breed_id, pet_type_id, city_id) 
    WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_pets_search ON pets USING GIN (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);
```

### 6.2 Pet Images

```sql
CREATE TABLE pet_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    -- S3 paths
    original_url    TEXT NOT NULL,
    large_url       TEXT NOT NULL,
    medium_url      TEXT NOT NULL,
    thumb_url       TEXT NOT NULL,
    
    -- Metadata
    alt_text        VARCHAR(255),
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_primary      BOOLEAN NOT NULL DEFAULT false,
    
    -- Image processing status
    processing_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pet_images_pet ON pet_images(pet_id);
CREATE INDEX idx_pet_images_primary ON pet_images(pet_id, is_primary) WHERE is_primary = true;
```

### 6.3 Pet Health Records

```sql
CREATE TABLE pet_health_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    record_type     VARCHAR(50) NOT NULL,          -- vaccination, deworming, checkup, surgery
    record_date     DATE NOT NULL,
    description     TEXT NOT NULL,
    document_url    TEXT,                          -- S3 path to proof
    verified        BOOLEAN NOT NULL DEFAULT false,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pet_health_pet ON pet_health_records(pet_id);
```

### 6.4 Pet FAQs

```sql
CREATE TABLE pet_faqs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    question        VARCHAR(500) NOT NULL,
    answer          TEXT NOT NULL,
    display_order   INTEGER NOT NULL DEFAULT 0,
    
    is_active       BOOLEAN NOT NULL DEFAULT true,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pet_faqs_pet ON pet_faqs(pet_id) WHERE is_active = true;
```

---

## 7. Adoption Listings

### 7.1 Adoption Listings

```sql
CREATE TABLE adoption_listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    pet_id          UUID NOT NULL REFERENCES pets(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- SEO slug (denormalized for URL generation)
    slug            VARCHAR(500) NOT NULL UNIQUE,
    /* Format: {breed-slug}-{pet-type-slug}-in-{city-slug}/{pet-id-short} */
    
    -- Listing details
    title           VARCHAR(200) NOT NULL,
    adoption_fee    DECIMAL(10, 2),                -- NULL = free adoption
    fee_includes    TEXT[],                        -- ['vaccination', 'neutering']
    
    -- Requirements
    adopter_requirements TEXT,
    home_check_required BOOLEAN NOT NULL DEFAULT false,
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    /* draft, pending_review, active, adopted, expired, rejected, suspended */
    
    rejection_reason TEXT,
    
    -- Moderation
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES users(id),
    
    -- Visibility
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    featured_until  TIMESTAMPTZ,
    
    -- Stats
    view_count      INTEGER NOT NULL DEFAULT 0,
    inquiry_count   INTEGER NOT NULL DEFAULT 0,
    
    -- Payment tracking
    is_paid         BOOLEAN NOT NULL DEFAULT false,
    payment_id      UUID,                          -- References payments table
    
    -- Dates
    published_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    adopted_at      TIMESTAMPTZ,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    
    CONSTRAINT chk_adoption_status CHECK (status IN (
        'draft', 'pending_review', 'active', 'adopted', 
        'expired', 'rejected', 'suspended'
    ))
);

-- Indexes for listing queries
CREATE INDEX idx_adoption_user ON adoption_listings(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_adoption_pet ON adoption_listings(pet_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_adoption_status ON adoption_listings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_adoption_slug ON adoption_listings(slug);
CREATE INDEX idx_adoption_featured ON adoption_listings(is_featured, featured_until) 
    WHERE status = 'active' AND deleted_at IS NULL;

-- Index for active listings by location (SEO pages)
CREATE INDEX idx_adoption_active_location ON adoption_listings(status, created_at DESC)
    WHERE status = 'active' AND deleted_at IS NULL;
```

---

## 8. Breeder Tables

### 8.1 Breeder Profiles

```sql
CREATE TABLE breeder_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id),
    
    -- Business info
    business_name   VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    kennel_name     VARCHAR(200),
    
    -- Contact (public)
    business_phone  VARCHAR(20),
    business_email  VARCHAR(255),
    website_url     TEXT,
    
    -- Location
    city_id         UUID NOT NULL REFERENCES cities(id),
    address         TEXT NOT NULL,
    pincode         VARCHAR(10) NOT NULL,
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    
    -- About
    description     TEXT,
    years_experience INTEGER NOT NULL,
    
    -- Specialization
    breeds          UUID[] NOT NULL,               -- Array of breed IDs
    
    -- Media
    logo_url        TEXT,
    cover_image_url TEXT,
    gallery_urls    TEXT[],
    
    -- Verification
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    verified_at     TIMESTAMPTZ,
    verification_badge VARCHAR(50),                -- basic, trusted, premium
    
    -- Stats (denormalized)
    active_listings_count INTEGER NOT NULL DEFAULT 0,
    total_sales_count INTEGER NOT NULL DEFAULT 0,
    avg_rating      DECIMAL(2, 1),
    review_count    INTEGER NOT NULL DEFAULT 0,
    
    -- Social
    instagram_url   TEXT,
    facebook_url    TEXT,
    youtube_url     TEXT,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_breeder_user ON breeder_profiles(user_id);
CREATE INDEX idx_breeder_slug ON breeder_profiles(slug);
CREATE INDEX idx_breeder_city ON breeder_profiles(city_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_breeder_verified ON breeder_profiles(is_verified) WHERE deleted_at IS NULL;

-- GIN index for breed array search
CREATE INDEX idx_breeder_breeds ON breeder_profiles USING GIN(breeds);
```

### 8.2 Breeder Listings

```sql
CREATE TABLE breeder_listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    breeder_id      UUID NOT NULL REFERENCES breeder_profiles(id),
    pet_id          UUID NOT NULL REFERENCES pets(id),
    
    -- SEO slug
    slug            VARCHAR(500) NOT NULL UNIQUE,
    /* Format: {breed-slug}-in-{city-slug}/{listing-id-short} */
    
    -- Listing details
    title           VARCHAR(200) NOT NULL,
    price           DECIMAL(10, 2) NOT NULL,
    price_negotiable BOOLEAN NOT NULL DEFAULT false,
    
    -- Availability
    available_count INTEGER NOT NULL DEFAULT 1,
    expected_date   DATE,                          -- For upcoming litters
    
    -- Includes
    includes        TEXT[],                        -- ['vaccination', 'health certificate', 'pedigree']
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    rejection_reason TEXT,
    
    -- Moderation
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES users(id),
    
    -- Visibility
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    featured_until  TIMESTAMPTZ,
    
    -- Stats
    view_count      INTEGER NOT NULL DEFAULT 0,
    inquiry_count   INTEGER NOT NULL DEFAULT 0,
    
    -- Payment
    is_paid         BOOLEAN NOT NULL DEFAULT false,
    payment_id      UUID,
    
    -- Dates
    published_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    sold_at         TIMESTAMPTZ,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    
    CONSTRAINT chk_breeder_listing_status CHECK (status IN (
        'draft', 'pending_review', 'active', 'sold', 
        'expired', 'rejected', 'suspended'
    ))
);

CREATE INDEX idx_breeder_listing_breeder ON breeder_listings(breeder_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_breeder_listing_pet ON breeder_listings(pet_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_breeder_listing_status ON breeder_listings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_breeder_listing_slug ON breeder_listings(slug);
```

---

## 9. Payment Tables

### 9.1 Payments

```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- Payment gateway
    gateway         VARCHAR(20) NOT NULL,          -- razorpay, stripe
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    
    -- Amount
    amount          DECIMAL(10, 2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Purpose
    payment_type    VARCHAR(50) NOT NULL,          -- adoption_listing, breeder_listing, featured
    reference_type  VARCHAR(50) NOT NULL,          -- adoption_listing, breeder_listing
    reference_id    UUID NOT NULL,
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    /* pending, processing, completed, failed, refunded, disputed */
    
    failure_reason  TEXT,
    
    -- Metadata
    metadata        JSONB,
    
    -- Dates
    paid_at         TIMESTAMPTZ,
    refunded_at     TIMESTAMPTZ,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_payment_id);
CREATE INDEX idx_payments_reference ON payments(reference_type, reference_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 9.2 Listing Usage Tracking

```sql
CREATE TABLE listing_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    listing_type    VARCHAR(20) NOT NULL,          -- adoption, breeder
    listing_id      UUID NOT NULL,
    
    is_free_tier    BOOLEAN NOT NULL,
    payment_id      UUID REFERENCES payments(id),
    
    -- Validity
    valid_from      TIMESTAMPTZ NOT NULL,
    valid_until     TIMESTAMPTZ,                   -- NULL = indefinite
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_usage_user ON listing_usage(user_id);
CREATE INDEX idx_listing_usage_listing ON listing_usage(listing_type, listing_id);
CREATE UNIQUE INDEX idx_listing_usage_free ON listing_usage(user_id, listing_type) 
    WHERE is_free_tier = true;
```

---

## 10. Admin & Moderation Tables

### 10.1 Audit Logs

```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id         UUID REFERENCES users(id),     -- NULL for system actions
    user_email      VARCHAR(255),                  -- Denormalized for history
    
    -- Action
    action          VARCHAR(100) NOT NULL,         -- breeder_approved, listing_rejected
    entity_type     VARCHAR(50) NOT NULL,          -- user, pet, adoption_listing, breeder
    entity_id       UUID NOT NULL,
    
    -- Changes
    old_values      JSONB,
    new_values      JSONB,
    
    -- Context
    ip_address      INET,
    user_agent      TEXT,
    reason          TEXT,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

### 10.2 Reports

```sql
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reporter
    reporter_id     UUID NOT NULL REFERENCES users(id),
    
    -- Target
    target_type     VARCHAR(50) NOT NULL,          -- listing, user, breeder
    target_id       UUID NOT NULL,
    
    -- Report details
    reason          VARCHAR(100) NOT NULL,         -- spam, misleading, inappropriate, scam
    description     TEXT,
    evidence_urls   TEXT[],
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    /* pending, investigating, resolved, dismissed */
    
    -- Resolution
    resolved_by     UUID REFERENCES users(id),
    resolved_at     TIMESTAMPTZ,
    resolution_notes TEXT,
    action_taken    VARCHAR(100),
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_status ON reports(status);
```

---

## 11. Sample Data

### 11.1 Locations

```sql
-- Countries
INSERT INTO countries (id, name, slug, iso_code, phone_code) VALUES
('c0000001-0000-0000-0000-000000000001', 'India', 'india', 'IN', '+91');

-- States
INSERT INTO states (id, country_id, name, slug, state_code) VALUES
('s0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Maharashtra', 'maharashtra', 'MH'),
('s0000002-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Karnataka', 'karnataka', 'KA'),
('s0000003-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Delhi', 'delhi', 'DL');

-- Cities
INSERT INTO cities (id, state_id, name, slug, is_featured) VALUES
('ct000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'Mumbai', 'mumbai', true),
('ct000002-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'Pune', 'pune', true),
('ct000003-0000-0000-0000-000000000001', 's0000002-0000-0000-0000-000000000001', 'Bangalore', 'bangalore', true),
('ct000004-0000-0000-0000-000000000001', 's0000003-0000-0000-0000-000000000001', 'New Delhi', 'new-delhi', true);
```

### 11.2 Pet Types & Breeds

```sql
-- Pet Types
INSERT INTO pet_types (id, name, slug, plural_name, display_order) VALUES
('pt000001-0000-0000-0000-000000000001', 'Dog', 'dog', 'Dogs', 1),
('pt000002-0000-0000-0000-000000000001', 'Cat', 'cat', 'Cats', 2);

-- Dog Breeds
INSERT INTO breeds (id, pet_type_id, name, slug, size_category, is_popular) VALUES
('br000001-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'Labrador Retriever', 'labrador-retriever', 'large', true),
('br000002-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'German Shepherd', 'german-shepherd', 'large', true),
('br000003-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'Golden Retriever', 'golden-retriever', 'large', true),
('br000004-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'Pomeranian', 'pomeranian', 'small', true),
('br000005-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'Beagle', 'beagle', 'medium', true),
('br000006-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'Indian Pariah', 'indian-pariah', 'medium', true);

-- Cat Breeds
INSERT INTO breeds (id, pet_type_id, name, slug, size_category, is_popular) VALUES
('br000010-0000-0000-0000-000000000001', 'pt000002-0000-0000-0000-000000000001', 'Persian', 'persian', 'medium', true),
('br000011-0000-0000-0000-000000000001', 'pt000002-0000-0000-0000-000000000001', 'Siamese', 'siamese', 'medium', true),
('br000012-0000-0000-0000-000000000001', 'pt000002-0000-0000-0000-000000000001', 'Indian Domestic', 'indian-domestic', 'medium', true);
```

### 11.3 Sample User & Listing

```sql
-- Sample User
INSERT INTO users (id, email, display_name, phone, phone_verified, status) VALUES
('u0000001-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', '+919876543210', true, 'verified');

-- Sample Pet
INSERT INTO pets (
    id, pet_type_id, breed_id, name, slug, gender, 
    age_years, city_id, owner_id, description
) VALUES (
    'p0000001-0000-0000-0000-000000000001',
    'pt000001-0000-0000-0000-000000000001',
    'br000001-0000-0000-0000-000000000001',
    'Bruno',
    'bruno-labrador-retriever-p0000001',
    'male',
    2,
    'ct000001-0000-0000-0000-000000000001',
    'u0000001-0000-0000-0000-000000000001',
    'Bruno is a friendly, energetic Labrador who loves playing fetch and swimming.'
);

-- Sample Adoption Listing
INSERT INTO adoption_listings (
    id, pet_id, user_id, slug, title, status, published_at
) VALUES (
    'al000001-0000-0000-0000-000000000001',
    'p0000001-0000-0000-0000-000000000001',
    'u0000001-0000-0000-0000-000000000001',
    'labrador-retriever-dog-in-mumbai/p0000001',
    'Adopting Bruno - Loving Labrador Needs Forever Home',
    'active',
    NOW()
);
```

---

## 12. Index Strategy Summary

| Table | Index Type | Columns | Purpose |
|-------|-----------|---------|---------|
| pets | B-tree composite | (breed_id, pet_type_id, city_id) | SEO URL lookups |
| pets | GIN | to_tsvector(name, description) | Full-text search |
| adoption_listings | B-tree | (status, created_at) | Active listing queries |
| breeds | B-tree | (is_popular) | Homepage featured breeds |
| cities | B-tree | (is_featured) | Popular cities |
| breeder_profiles | GIN | (breeds) | Breed specialization search |
| audit_logs | B-tree | (created_at DESC) | Recent activity |

---

## 13. Migration Strategy

1. **V1_Initial**: Create all tables in dependency order
2. **V2_Indexes**: Add all indexes after data structure stable
3. **V3_Seed**: Insert reference data (countries, states, cities, breeds)
4. **V4_FullTextSearch**: Configure text search dictionaries

---

*This schema is designed for PostgreSQL 14+ with gen_random_uuid() support. Application layer uses Entity Framework Core 8 for ORM.*
