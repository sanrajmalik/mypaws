# mypaws Breeder Vertical Design

> Agent 7 – Trust & Compliance Product Designer  
> Deliverable: Breeder onboarding flow, approval workflow, database schema, monetization logic, trust mechanisms

---

## 1. Scope & Constraints

### 1.1 Initial Phase Scope

| Attribute | Value |
|-----------|-------|
| Pet Types | Dogs, Cats |
| Focus | Ethical, verified breeders only |
| Listing Model | 1 free listing per breeder + paid |
| Approval | Manual admin approval required |
| Target | India-first (expandable) |

### 1.2 Core Pages

| Page | URL | Purpose |
|------|-----|---------|
| Buy Dogs Hub | `/buy-dogs` | Main breeder landing for dogs |
| Buy Cats Hub | `/buy-cats` | Main breeder landing for cats |
| Breed + City | `/buy-dogs/{breed}-in-{city}` | Programmatic SEO page |
| Breeder Profile | `/breeders/{slug}` | Individual breeder page |
| Listing Detail | `/buy-dogs/{breed}-in-{city}/{listing-id}` | Individual pet listing |

---

## 2. Breeder Onboarding Flow

### 2.1 Registration Journey

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        BREEDER REGISTRATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   SIGN UP     │    │   VERIFY      │    │   REGISTER    │    │   AWAIT       │
│               │    │               │    │   AS BREEDER  │    │   APPROVAL    │
│ • Google      │───►│ • WhatsApp    │───►│ • Fill form   │───►│ • Admin       │
│   OAuth       │    │   OTP         │    │ • Upload docs │    │   reviews     │
└───────────────┘    └───────────────┘    └───────────────┘    └───────────────┘
                                                                      │
                                               ┌──────────────────────┤
                                               │                      │
                                               ▼                      ▼
                                        ┌──────────┐           ┌──────────┐
                                        │ APPROVED │           │ REJECTED │
                                        │          │           │          │
                                        │ Can list │           │ Feedback │
                                        │ puppies  │           │ provided │
                                        └──────────┘           └──────────┘
```

### 2.2 Registration Form Fields

**Step 1: Basic Information**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Business Name | Text | Yes | 3-200 chars |
| Kennel Name | Text | No | 3-200 chars |
| Years of Experience | Number | Yes | 0-50 |
| Description | Textarea | Yes | 100-2000 chars |

**Step 2: Breed Specialization**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Pet Types | Multi-select | Yes | Dog, Cat, or Both |
| Breeds | Multi-select | Yes | Min 1, Max 5 |

**Step 3: Location Details**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Address | Textarea | Yes | 10-500 chars |
| City | Dropdown | Yes | From cities table |
| Pincode | Text | Yes | 6 digits (India) |
| Latitude/Longitude | Auto | No | Via address geocoding |

**Step 4: Contact Information**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Business Phone | Phone | Yes | Valid mobile |
| Business Email | Email | No | Valid email format |
| Website | URL | No | Valid URL |
| Instagram | URL | No | Instagram profile URL |
| Facebook | URL | No | Facebook page URL |
| YouTube | URL | No | YouTube channel URL |

**Step 5: Verification Documents**

| Document | Type | Required | Validation |
|----------|------|----------|------------|
| ID Proof | Image/PDF | Yes | Aadhaar, PAN, Voter ID, Passport |
| Address Proof | Image/PDF | Yes | Utility bill, bank statement |
| Kennel Photos | Images | Yes | Min 3, Max 10 photos |
| Registration Certificate | PDF | No | Kennel club registration |

**Step 6: Terms & Compliance**

| Field | Type | Required |
|-------|------|----------|
| Agree to Ethical Breeding Standards | Checkbox | Yes |
| Agree to Platform Terms | Checkbox | Yes |
| Agree to Verification | Checkbox | Yes |

---

## 3. Approval Workflow

### 3.1 Application States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     BREEDER APPLICATION STATE MACHINE                            │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────┐
                              │    DRAFT      │
                              │  (incomplete) │
                              └───────┬───────┘
                                      │
                               Submit Complete
                                      │
                                      ▼
                              ┌───────────────┐
                              │   PENDING     │──────► Queue for review
                              │               │
                              └───────┬───────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
        Request More Info        Approve                  Reject
               │                      │                      │
               ▼                      ▼                      ▼
        ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
        │ INFO_       │        │  APPROVED   │        │  REJECTED   │
        │ REQUESTED   │        │             │        │             │
        └──────┬──────┘        └─────────────┘        └──────┬──────┘
               │                                             │
        User Resubmits                                  30-day wait
               │                                             │
               ▼                                             ▼
        ┌─────────────┐                              ┌─────────────┐
        │   PENDING   │                              │ Can Reapply │
        └─────────────┘                              └─────────────┘
```

### 3.2 Admin Review Checklist

| Check | Criteria | Auto-Verify |
|-------|----------|-------------|
| Identity | ID document matches profile | No |
| Address | Address proof matches location | No |
| Photos | Kennel photos show clean, ethical setup | No |
| Experience | Claims are reasonable | No |
| Website | If provided, looks legitimate | No |
| Social | If provided, active and genuine | No |
| No Blacklist | Phone/email not in fraud database | Yes |
| Duplicate | Not duplicate of existing breeder | Yes |

### 3.3 Rejection Reasons

| Code | Reason | Can Reapply |
|------|--------|-------------|
| `invalid_documents` | Documents unclear or unverifiable | Yes, after fix |
| `suspicious_activity` | Account flagged for suspicious behavior | After 30 days |
| `unethical_practices` | Evidence of puppy mills or unethical breeding | Permanent ban |
| `incomplete_info` | Required information missing | Yes, after fix |
| `location_mismatch` | Address doesn't match documents | Yes, after fix |
| `duplicate_account` | Already registered under another account | No |

---

## 4. Database Schema (Additions)

### 4.1 Breeder Applications Table

```sql
-- Already defined in 03-database-schema.md
-- Additional fields for workflow:

ALTER TABLE breeder_applications ADD COLUMN IF NOT EXISTS
    review_notes TEXT[],           -- Admin notes history
    info_requested JSONB,          -- Requested documents/info
    info_submitted JSONB,          -- User's responses
    document_urls JSONB,           -- All document references
    review_score INTEGER,          -- Internal quality score (1-10)
    priority VARCHAR(20) DEFAULT 'normal', -- normal, high, urgent
    assigned_to UUID REFERENCES users(id), -- Assigned admin
    sla_deadline TIMESTAMPTZ;      -- Review deadline
```

### 4.2 Breeder Reviews Table

```sql
CREATE TABLE breeder_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breeder_id      UUID NOT NULL REFERENCES breeder_profiles(id),
    reviewer_id     UUID NOT NULL REFERENCES users(id),
    
    -- Rating
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Review content
    title           VARCHAR(200),
    content         TEXT NOT NULL,
    
    -- Purchase verification
    order_verified  BOOLEAN NOT NULL DEFAULT false,
    order_date      DATE,
    pet_purchased   VARCHAR(100),   -- e.g., "Golden Retriever puppy"
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    /* pending, approved, rejected, flagged */
    
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    
    -- Helpful votes
    helpful_count   INTEGER NOT NULL DEFAULT 0,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_breeder_reviews_breeder ON breeder_reviews(breeder_id);
CREATE INDEX idx_breeder_reviews_rating ON breeder_reviews(breeder_id, rating);
```

---

## 5. Monetization Logic

### 5.1 Listing Tiers

| Tier | Price (INR) | Duration | Features |
|------|-------------|----------|----------|
| Free | ₹0 | 90 days | 1 listing, basic visibility |
| Standard | ₹499 | 90 days | 1 listing, better visibility |
| Premium | ₹999 | 90 days | 1 listing, featured, priority support |
| Bulk (5) | ₹1,999 | 90 days each | 5 listings, 20% discount |

### 5.2 Free Tier Rules

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          FREE TIER LOGIC                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

1. Each approved breeder gets 1 free listing
2. Free listing is non-transferable
3. Once used, breeder must pay for additional listings
4. If free listing expires → can create another free (reset once per 180 days)
5. If free listing sold → cannot use free tier for same litter/pet type for 90 days

Check: has_free_tier_available(breeder_id)
  → SELECT COUNT(*) FROM listing_usage 
    WHERE user_id = (SELECT user_id FROM breeder_profiles WHERE id = breeder_id)
    AND listing_type = 'breeder'
    AND is_free_tier = true
    AND (valid_until IS NULL OR valid_until > NOW())
  → Return count == 0
```

### 5.3 Listing Usage Tracking

```sql
-- When free listing is created:
INSERT INTO listing_usage (user_id, listing_type, listing_id, is_free_tier, valid_from, valid_until, status)
VALUES (
    :user_id,
    'breeder',
    :listing_id,
    true,
    NOW(),
    NOW() + INTERVAL '90 days',
    'active'
);

-- When paid listing is created:
INSERT INTO listing_usage (user_id, listing_type, listing_id, is_free_tier, payment_id, valid_from, valid_until, status)
VALUES (
    :user_id,
    'breeder',
    :listing_id,
    false,
    :payment_id,
    NOW(),
    NOW() + INTERVAL '90 days',
    'active'
);
```

---

## 6. Trust & Verification Mechanisms

### 6.1 Badge System

| Badge | Criteria | Display |
|-------|----------|---------|
| ✓ Verified | Admin-approved application | Always shown |
| ⭐ Trusted | 5+ sales, 4.5+ rating, 6+ months | Gold star icon |
| 🏆 Premium | 20+ sales, 4.8+ rating, 1+ year | Trophy icon |
| 📍 Location Verified | Address verified in-person or via video | Location pin |
| 📄 KC Registered | Kennel club registration uploaded | Certificate icon |

### 6.2 Trust Score Calculation

```python
def calculate_trust_score(breeder):
    score = 0
    
    # Base verification (max 30)
    if breeder.is_verified:
        score += 20
    if breeder.location_verified:
        score += 10
    
    # Activity (max 25)
    months_active = (now - breeder.created_at).months
    score += min(months_active * 2, 15)  # Max 15 for tenure
    score += min(breeder.total_sales_count, 10)  # Max 10 for sales
    
    # Reviews (max 25)
    if breeder.review_count >= 5:
        score += min(breeder.avg_rating * 4, 20)  # Max 20 for rating
        score += min(breeder.review_count / 2, 5)  # Max 5 for volume
    
    # Responsiveness (max 10)
    score += (100 - breeder.avg_response_time_hours) / 10  # Faster = higher
    
    # Completeness (max 10)
    profile_completeness = calculate_profile_completeness(breeder)
    score += profile_completeness * 10
    
    return min(score, 100)
```

### 6.3 Safety Features

| Feature | Implementation |
|---------|---------------|
| Scam Alerts | Warning banner on suspicious profiles |
| Report Button | On every profile and listing |
| Price Alerts | Flag listings with unusually low prices |
| Watermarked Images | Auto-watermark uploaded images |
| Contact Masking | Breeder phone hidden until verified user requests |
| Transaction Guidance | "How to buy safely" guide shown before contact |

---

## 7. API Endpoints (Breeder-Specific)

### 7.1 Breeder Registration

#### POST /api/v1/breeders/apply

**Request:**
```json
{
  "business_name": "Royal Paws Kennels",
  "kennel_name": "Royal Paws",
  "years_experience": 8,
  "description": "Ethical German Shepherd and Labrador breeder...",
  "breeds": ["br000001-...", "br000002-..."],
  "address": "123 Pet Lane, Whitefield",
  "city_id": "ct000003-...",
  "pincode": "560066",
  "business_phone": "+919876543210",
  "business_email": "info@royalpaws.in",
  "website_url": "https://royalpaws.in",
  "agree_ethical_standards": true,
  "agree_terms": true
}
```

**Response (201 Created):**
```json
{
  "application_id": "ba000001-...",
  "status": "draft",
  "document_upload_urls": {
    "id_proof": "https://mypaws-media.s3.../presigned...",
    "address_proof": "https://mypaws-media.s3.../presigned...",
    "kennel_photos": [
      "https://mypaws-media.s3.../presigned...",
      "https://mypaws-media.s3.../presigned...",
      "https://mypaws-media.s3.../presigned..."
    ]
  },
  "next_step": "upload_documents"
}
```

---

#### PUT /api/v1/breeders/apply/{id}/documents

**Request:**
```json
{
  "id_proof_key": "breeders/ba000001/id_proof.jpg",
  "address_proof_key": "breeders/ba000001/address_proof.pdf",
  "kennel_photo_keys": [
    "breeders/ba000001/kennel1.jpg",
    "breeders/ba000001/kennel2.jpg",
    "breeders/ba000001/kennel3.jpg"
  ]
}
```

**Response (200 OK):**
```json
{
  "application_id": "ba000001-...",
  "status": "pending",
  "submitted_at": "2024-02-06T12:00:00Z",
  "estimated_review_time": "3-5 business days"
}
```

---

### 7.2 Breeder Profile

#### GET /api/v1/breeders/{slug}

**Response (200 OK):**
```json
{
  "id": "bp000001-...",
  "slug": "royal-paws-kennels",
  "business_name": "Royal Paws Kennels",
  "kennel_name": "Royal Paws",
  "description": "Ethical German Shepherd and Labrador breeder...",
  "years_experience": 8,
  "breeds": [
    {"id": "br000001-...", "name": "German Shepherd", "slug": "german-shepherd"},
    {"id": "br000002-...", "name": "Labrador Retriever", "slug": "labrador-retriever"}
  ],
  "location": {
    "city": {"name": "Bangalore", "slug": "bangalore"},
    "state": "Karnataka",
    "pincode": "560066"
  },
  "contact": {
    "phone": null,  // Hidden until user requests
    "email": "info@royalpaws.in",
    "website": "https://royalpaws.in"
  },
  "social": {
    "instagram": "https://instagram.com/royalpawskennels",
    "facebook": null,
    "youtube": null
  },
  "media": {
    "logo_url": "https://cdn.mypaws.in/breeders/bp000001/logo.jpg",
    "cover_image_url": "https://cdn.mypaws.in/breeders/bp000001/cover.jpg",
    "gallery": [...]
  },
  "badges": ["verified", "trusted"],
  "trust_score": 85,
  "stats": {
    "active_listings": 3,
    "total_sales": 24,
    "avg_rating": 4.8,
    "review_count": 18,
    "member_since": "2022-03-15"
  },
  "listings": [...],
  "reviews": {
    "summary": {
      "avg_rating": 4.8,
      "total": 18,
      "distribution": {"5": 14, "4": 3, "3": 1, "2": 0, "1": 0}
    },
    "recent": [...]
  }
}
```

---

### 7.3 Breeder Listings

#### POST /api/v1/breeders/listings

**Request:**
```json
{
  "pet": {
    "name": "Champion's Line Litter",
    "pet_type_id": "pt000001-...",
    "breed_id": "br000002-...",
    "gender": "male",
    "date_of_birth": "2024-01-15",
    "color": "Golden",
    "description": "Beautiful champion-line Labrador puppies..."
  },
  "title": "KCI Registered Labrador Puppies - Champion Line",
  "price": 45000,
  "price_negotiable": true,
  "available_count": 4,
  "includes": ["vaccination", "health_certificate", "microchip", "pedigree"],
  "expected_date": null
}
```

**Response (201 Created):**
```json
{
  "id": "bl000001-...",
  "status": "draft",
  "slug": "labrador-retriever-in-bangalore/bl000001",
  "free_tier_used": false,
  "payment_required": false
}
```

---

## 8. Buyer Journey

### 8.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             BUYER JOURNEY                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   DISCOVER    │    │   RESEARCH    │    │   CONTACT     │    │   PURCHASE    │
│               │    │               │    │               │    │               │
│ • Search      │───►│ • View        │───►│ • Request     │───►│ • Visit       │
│   breed+city  │    │   breeder     │    │   contact     │    │   kennel      │
│ • Browse      │    │ • Read        │    │ • WhatsApp    │    │ • Verify      │
│   listings    │    │   reviews     │    │   chat        │    │   health      │
│               │    │ • Compare     │    │               │    │ • Buy puppy   │
└───────────────┘    └───────────────┘    └───────────────┘    └───────────────┘
                                                                      │
                                                                      ▼
                                                              ┌───────────────┐
                                                              │   REVIEW      │
                                                              │               │
                                                              │ • Leave       │
                                                              │   rating      │
                                                              │ • Share       │
                                                              │   experience  │
                                                              └───────────────┘
```

### 8.2 Safety Checklist (Shown to Buyers)

```markdown
## Before You Buy - Safety Checklist

✓ Visit the kennel in person if possible
✓ Ask to see the puppy's parents
✓ Request vaccination and health records
✓ Verify the breeder's credentials
✓ Never pay full amount before seeing the puppy
✓ Get a written health guarantee
✓ Report any suspicious activity to mypaws

⚠️ Red Flags to Watch For:
- Prices that seem too good to be true
- Breeder refuses video call or visit
- No photos of actual puppies
- Pressure to pay immediately
- Multiple breeds available (puppy mill sign)
```

---

## 9. Implementation Checklist

### 9.1 Backend

- [ ] Breeder application submission endpoint
- [ ] Document upload + S3 integration
- [ ] Application status tracking
- [ ] Admin approval endpoints
- [ ] Breeder profile CRUD
- [ ] Breeder listing CRUD
- [ ] Review submission + moderation
- [ ] Trust score calculation
- [ ] Badge assignment logic

### 9.2 Admin Panel

- [ ] Pending applications queue
- [ ] Application detail view with documents
- [ ] Approve/Reject/Request Info actions
- [ ] Breeder profile moderation
- [ ] Listing moderation
- [ ] Review moderation

### 9.3 Frontend

- [ ] Multi-step registration form
- [ ] Document upload with preview
- [ ] Application status page
- [ ] Breeder dashboard
- [ ] Listing management
- [ ] Review display + submission

---

*This document defines the Breeder vertical. Payment integration is covered in the next agent deliverable.*
