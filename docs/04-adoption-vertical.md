# mypaws Adoption Vertical Design

> Agent 4 – Product Owner + Backend Engineer  
> Deliverable: User flows, listing lifecycle, API endpoints, access control, search & filtering

---

## 1. Scope & Constraints

### 1.1 Initial Phase Scope

| Attribute | Value |
|-----------|-------|
| Pet Types | Dogs, Cats only |
| Geographies | India (expandable) |
| Listing Model | Free tier (1 per user) + Paid |
| User Requirement | Login + WhatsApp verified |

### 1.2 Core Pages

| Page | URL | Purpose |
|------|-----|---------|
| All Adoption | `/adopt-a-pet` | Main landing page |
| Adopt Dogs | `/adopt-a-dog` | Dog-specific listing |
| Adopt Cats | `/adopt-a-cat` | Cat-specific listing |
| Breed + City | `/adopt-a-pet/{breed}-{type}-in-{city}` | Programmatic SEO page |
| Pet Detail | `/adopt-a-pet/{breed}-{type}-in-{city}/{pet-id}` | Individual pet page |

---

## 2. User Flows

### 2.1 Adopter Journey

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ADOPTER JOURNEY                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   DISCOVER    │    │    BROWSE     │    │    ENGAGE     │    │    ADOPT      │
│               │    │               │    │               │    │               │
│ • Google SEO  │───►│ • Filter by   │───►│ • View detail │───►│ • Contact     │
│ • Social      │    │   city/breed  │    │ • Save to     │    │   owner       │
│ • Direct      │    │ • Sort by     │    │   favorites   │    │ • Arrange     │
│               │    │   recent/near │    │               │    │   meeting     │
└───────────────┘    └───────────────┘    └───────────────┘    └───────────────┘
                                                │                      │
                                         Requires Login         Requires Verified
```

### 2.2 Adopter Flow State Diagram

```
                               ANONYMOUS USER
                                     │
                          (Can view listing cards,
                           limited pet details)
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │     Click "View More"  │
                        │     or "Contact"       │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │   Login Prompt Modal   │
                        │   (Google OAuth)       │
                        └───────────┬────────────┘
                                    │
                            Login Success
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │  Phone Verified?       │
                        └───────────┬────────────┘
                              No    │    Yes
                              │     └─────────────►  Full Access
                              ▼
                        ┌────────────────────────┐
                        │  WhatsApp Verification │
                        │  Flow                  │
                        └───────────┬────────────┘
                                    │
                              Verified
                                    │
                                    ▼
                              Full Access
                              (View contact, favorites, inquiries)
```

### 2.3 Poster (Listing Owner) Journey

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           POSTER JOURNEY                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────┐    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  ONBOARD      │    │   CREATE      │    │   PUBLISH     │    │   MANAGE      │
│               │    │               │    │               │    │               │
│ • Login       │───►│ • Pet details │───►│ • Auto-review │───►│ • View stats  │
│ • Verify      │    │ • Photos      │    │   or manual   │    │ • Handle      │
│   WhatsApp    │    │ • Story       │    │ • Go live     │    │   inquiries   │
│               │    │ • FAQs        │    │               │    │ • Mark adopted│
└───────────────┘    └───────────────┘    └───────────────┘    └───────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Free Tier?  │
                     └─────────────┘
                      Yes     No
                       │       │
                       │       ▼
                       │  ┌─────────────┐
                       │  │   Payment   │
                       │  └─────────────┘
                       │       │
                       └───────┴───► Submit for Review
```

---

## 3. Listing Lifecycle

### 3.1 State Machine

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ADOPTION LISTING STATE MACHINE                              │
└─────────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────┐
                                 │  DRAFT  │
                                 └────┬────┘
                                      │
                               Submit for Review
                                      │
                                      ▼
                           ┌──────────────────┐
                           │  PENDING_REVIEW  │
                           └────────┬─────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
         Auto-approve          Manual Review          Rejected
         (clean content)            │                     │
              │                     │                     ▼
              │              ┌──────┴──────┐       ┌──────────┐
              │              │             │       │ REJECTED │
              ▼              ▼             ▼       └──────────┘
        ┌──────────┐   ┌──────────┐                     │
        │  ACTIVE  │   │  ACTIVE  │                     │
        └────┬─────┘   └────┬─────┘                Edit & Resubmit
             │              │                           │
             └──────────────┴───────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┬─────────────────┐
         │                  │                  │                 │
    Mark Adopted         Expires          Admin Suspend      User Delete
         │                  │                  │                 │
         ▼                  ▼                  ▼                 ▼
   ┌──────────┐      ┌──────────┐       ┌───────────┐     ┌──────────┐
   │ ADOPTED  │      │ EXPIRED  │       │ SUSPENDED │     │ (soft    │
   └──────────┘      └──────────┘       └───────────┘     │ deleted) │
                           │                  │           └──────────┘
                           │                  │
                     Renew (pay)         Appeal
                           │                  │
                           ▼                  ▼
                     PENDING_REVIEW     Admin Review
```

### 3.2 State Transition Rules

| From | To | Trigger | Conditions |
|------|----|---------|------------|
| Draft | Pending Review | Submit | All required fields filled, images uploaded |
| Pending Review | Active | Auto-approve | Content passes AI check, user has no violations |
| Pending Review | Active | Manual approve | Admin approves |
| Pending Review | Rejected | Manual reject | Admin rejects with reason |
| Rejected | Pending Review | Resubmit | User edits and resubmits |
| Active | Adopted | User action | Owner marks as adopted |
| Active | Expired | System | 90 days since publication (configurable) |
| Active | Suspended | Admin action | Violation reported and confirmed |
| Expired | Pending Review | Renew | User pays renewal fee (if applicable) |
| Suspended | Active | Admin action | Appeal successful |

### 3.3 Listing Validity

| Tier | Duration | Renewal |
|------|----------|---------|
| Free | 90 days | One-time use |
| Paid | 90 days | Pay to renew |

---

## 4. API Endpoints

### 4.1 Public Endpoints (No Auth)

#### GET /api/v1/public/adoption-listings

List adoption listings with filters.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `city` | string | - | City slug filter |
| `breed` | string | - | Breed slug filter |
| `pet_type` | string | - | `dog` or `cat` |
| `gender` | string | - | `male` or `female` |
| `age_min` | int | - | Minimum age in months |
| `age_max` | int | - | Maximum age in months |
| `size` | string | - | `small`, `medium`, `large` |
| `sort` | string | `recent` | `recent`, `popular`, `nearest` |
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 50) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "al000001-...",
      "slug": "labrador-retriever-dog-in-mumbai/p0000001",
      "title": "Adopting Bruno - Loving Labrador Needs Forever Home",
      "pet": {
        "id": "p0000001-...",
        "name": "Bruno",
        "breed": {
          "id": "br000001-...",
          "name": "Labrador Retriever",
          "slug": "labrador-retriever"
        },
        "pet_type": {
          "slug": "dog",
          "name": "Dog"
        },
        "gender": "male",
        "age_display": "2 years",
        "primary_image": {
          "thumb_url": "https://cdn.mypaws.in/pets/p0000001/thumb/img1.jpg",
          "alt_text": "Bruno the Labrador"
        }
      },
      "city": {
        "name": "Mumbai",
        "slug": "mumbai"
      },
      "adoption_fee": null,
      "is_featured": false,
      "published_at": "2024-02-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 156,
    "total_pages": 8
  },
  "filters_applied": {
    "city": "mumbai",
    "pet_type": "dog"
  }
}
```

---

#### GET /api/v1/public/adoption-listings/{slug}

Get single listing detail (public view).

**Response (200 OK) - Anonymous User:**
```json
{
  "id": "al000001-...",
  "slug": "labrador-retriever-dog-in-mumbai/p0000001",
  "title": "Adopting Bruno - Loving Labrador Needs Forever Home",
  "pet": {
    "id": "p0000001-...",
    "name": "Bruno",
    "breed": {
      "name": "Labrador Retriever",
      "slug": "labrador-retriever",
      "size_category": "large"
    },
    "pet_type": {
      "slug": "dog",
      "name": "Dog"
    },
    "gender": "male",
    "age_display": "2 years",
    "color": "Golden",
    "is_neutered": true,
    "is_vaccinated": true,
    "temperament": {
      "good_with_kids": true,
      "good_with_dogs": true,
      "energy_level": "high"
    },
    "fun_facts": [
      "Bruno can catch a frisbee mid-air!",
      "He knows 10 tricks including shake hands"
    ],
    "description": "Bruno is a friendly, energetic Labrador...",
    "images": [
      {
        "large_url": "https://cdn.mypaws.in/pets/p0000001/large/img1.jpg",
        "thumb_url": "https://cdn.mypaws.in/pets/p0000001/thumb/img1.jpg",
        "alt_text": "Bruno the Labrador"
      }
    ],
    "faqs": [
      {
        "question": "Why is Bruno up for adoption?",
        "answer": "His owner is relocating internationally..."
      }
    ]
  },
  "city": {
    "name": "Mumbai",
    "slug": "mumbai",
    "state": "Maharashtra"
  },
  "adoption_fee": null,
  "fee_includes": null,
  "adopter_requirements": "Must have experience with large dogs...",
  "home_check_required": true,
  "owner": {
    "display_name": "Demo User",
    "avatar_url": "https://cdn.mypaws.in/users/.../avatar.jpg",
    "contact_info": null  // Hidden for anonymous
  },
  "published_at": "2024-02-01T10:00:00Z",
  "view_count": 245,
  "seo": {
    "title": "Adopt Bruno - Labrador Retriever in Mumbai | mypaws",
    "description": "Bruno is a 2 year old male Labrador Retriever available for adoption in Mumbai. Vaccinated, neutered, great with kids.",
    "canonical_url": "https://mypaws.in/adopt-a-pet/labrador-retriever-dog-in-mumbai/p0000001"
  }
}
```

---

### 4.2 Protected Endpoints (Auth Required)

#### GET /api/v1/adoption-listings/{slug}/contact

Get owner contact info (verified users only).

**Response (200 OK):**
```json
{
  "owner": {
    "display_name": "Demo User",
    "phone": "+919876543210",
    "whatsapp_enabled": true,
    "email": "demo@example.com",
    "preferred_contact": "whatsapp"
  },
  "listing_id": "al000001-..."
}
```

**Response (403 Forbidden) - Phone Not Verified:**
```json
{
  "error": "phone_verification_required",
  "error_description": "Please verify your WhatsApp number to view contact details"
}
```

---

#### POST /api/v1/adoption-listings

Create new adoption listing.

**Request:**
```json
{
  "pet": {
    "name": "Bruno",
    "pet_type_id": "pt000001-...",
    "breed_id": "br000001-...",
    "gender": "male",
    "date_of_birth": "2022-01-15",
    "color": "Golden",
    "size_category": "large",
    "is_neutered": true,
    "is_vaccinated": true,
    "vaccination_details": "All vaccinations up to date as of Jan 2024",
    "temperament": {
      "good_with_kids": true,
      "good_with_dogs": true,
      "good_with_cats": false,
      "energy_level": "high",
      "training_level": "basic",
      "traits": ["playful", "loyal"]
    },
    "fun_facts": ["Loves swimming", "Knows 10 tricks"],
    "rescue_story": null,
    "description": "Bruno is a friendly, energetic Labrador..."
  },
  "city_id": "ct000001-...",
  "title": "Adopting Bruno - Loving Labrador Needs Forever Home",
  "adoption_fee": null,
  "fee_includes": [],
  "adopter_requirements": "Must have experience with large dogs",
  "home_check_required": true,
  "faqs": [
    {
      "question": "Why is Bruno up for adoption?",
      "answer": "Owner is relocating internationally"
    }
  ],
  "submit_for_review": false
}
```

**Response (201 Created):**
```json
{
  "id": "al000001-...",
  "pet_id": "p0000001-...",
  "status": "draft",
  "slug": "labrador-retriever-dog-in-mumbai/p0000001",
  "created_at": "2024-02-06T12:00:00Z",
  "image_upload_urls": [
    {
      "upload_url": "https://mypaws-media.s3.amazonaws.com/pets/...",
      "expires_at": "2024-02-06T12:15:00Z"
    }
  ]
}
```

---

#### PUT /api/v1/adoption-listings/{id}

Update listing (owner only).

---

#### POST /api/v1/adoption-listings/{id}/submit

Submit for review.

**Response (200 OK):**
```json
{
  "id": "al000001-...",
  "status": "pending_review",
  "estimated_review_time": "24 hours"
}
```

**Response (402 Payment Required) - Free Tier Used:**
```json
{
  "error": "payment_required",
  "error_description": "You have used your free adoption listing. Payment is required.",
  "payment_options": {
    "listing_fee": 299,
    "currency": "INR",
    "payment_url": "/api/v1/payments/initiate"
  }
}
```

---

#### POST /api/v1/adoption-listings/{id}/mark-adopted

Mark listing as adopted.

**Request:**
```json
{
  "adopted_by_user_id": null,
  "adoption_date": "2024-02-15"
}
```

**Response (200 OK):**
```json
{
  "id": "al000001-...",
  "status": "adopted",
  "adopted_at": "2024-02-15T00:00:00Z"
}
```

---

#### DELETE /api/v1/adoption-listings/{id}

Soft delete listing (owner only).

---

### 4.3 User Dashboard Endpoints

#### GET /api/v1/users/me/adoption-listings

List user's own listings.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "al000001-...",
      "title": "Adopting Bruno...",
      "status": "active",
      "view_count": 245,
      "inquiry_count": 12,
      "published_at": "2024-02-01T10:00:00Z",
      "expires_at": "2024-05-01T10:00:00Z"
    }
  ],
  "stats": {
    "total_listings": 1,
    "active": 1,
    "adopted": 0,
    "draft": 0
  },
  "free_tier": {
    "used": true,
    "used_on": "al000001-..."
  }
}
```

---

#### GET /api/v1/users/me/favorites

List user's favorite listings.

---

#### POST /api/v1/users/me/favorites/{listing_id}

Add to favorites.

---

#### DELETE /api/v1/users/me/favorites/{listing_id}

Remove from favorites.

---

## 5. Access Control Logic

### 5.1 Permission Matrix

| Action | Anonymous | Registered | Verified | Owner | Admin |
|--------|-----------|------------|----------|-------|-------|
| View listing cards | ✓ | ✓ | ✓ | ✓ | ✓ |
| View full pet details | Limited | ✓ | ✓ | ✓ | ✓ |
| View owner contact | ✗ | ✗ | ✓ | ✓ | ✓ |
| Save to favorites | ✗ | ✓ | ✓ | ✓ | ✓ |
| Create listing | ✗ | ✗ | ✓ | ✓ | ✓ |
| Edit own listing | ✗ | ✗ | ✗ | ✓ | ✓ |
| Delete own listing | ✗ | ✗ | ✗ | ✓ | ✓ |
| Moderate any listing | ✗ | ✗ | ✗ | ✗ | ✓ |

### 5.2 Anonymous User Restrictions

**What they CAN see:**
- Listing cards on browse pages
- Pet name, breed, city, age, gender
- Primary thumbnail image
- Published date

**What they CANNOT see:**
- Owner contact information
- Full photo gallery (only primary image)
- Cannot add favorites
- Cannot submit inquiries

### 5.3 Registered (Unverified) Restrictions

**Additional access:**
- Full pet details page
- Full photo gallery
- Save to favorites

**Still restricted:**
- Cannot view owner contact
- Cannot create listings

---

## 6. Search & Filtering Strategy

### 6.1 Filter Categories

| Category | Filter Options | Implementation |
|----------|---------------|----------------|
| Location | City, State | Dropdown with autocomplete |
| Pet Type | Dog, Cat | Toggle buttons |
| Breed | All breeds | Searchable dropdown |
| Gender | Male, Female | Checkbox |
| Age | Range slider | 0-15+ years |
| Size | Small, Medium, Large | Checkbox group |
| Traits | Good with kids, dogs, cats | Checkbox group |
| Adoption Fee | Free only | Checkbox |

### 6.2 Sort Options

| Option | API Value | Default |
|--------|-----------|---------|
| Most Recent | `recent` | ✓ |
| Most Popular | `popular` | |
| Nearest | `nearest` | (requires location) |

### 6.3 Search Query Processing

```
User Input: "golden retriever mumbai"
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH PROCESSING                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Tokenize: ["golden", "retriever", "mumbai"]                 │
│  2. Identify entities:                                          │
│     - "golden retriever" → breed match (fuzzy)                  │
│     - "mumbai" → city match                                     │
│  3. Build query:                                                │
│     WHERE breed_id = 'golden-retriever'                         │
│       AND city_id = 'mumbai'                                    │
│       AND status = 'active'                                     │
│  4. Full-text fallback if no entity match                       │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 URL Structure for Filters

All filters reflected in URL for SEO and shareability:

```
/adopt-a-pet?city=mumbai&pet_type=dog&breed=labrador-retriever&gender=male
```

Canonical SEO pages:
```
/adopt-a-pet/labrador-retriever-dog-in-mumbai
```

---

## 7. Image Upload Flow

### 7.1 Upload Process

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           IMAGE UPLOAD FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

     Client                      .NET API                    S3                Lambda
        │                           │                        │                    │
        │── Request upload URLs ───►│                        │                    │
        │   (5 slots max)           │                        │                    │
        │                           │── Generate pre-signed ─►│                   │
        │◄── Upload URLs (5) ───────│   PUT URLs             │                    │
        │                           │                        │                    │
        │── PUT image directly ─────────────────────────────►│                    │
        │   (each image)            │                        │                    │
        │◄── 200 OK ─────────────────────────────────────────│                    │
        │                           │                        │                    │
        │── Confirm uploads ───────►│                        │                    │
        │   {image_keys: [...]}     │                        │                    │
        │                           │── Trigger processing ──────────────────────►│
        │                           │                        │                    │
        │                           │   (Lambda resizes to   │◄─ Generate ───────│
        │                           │    large/medium/thumb) │   variants         │
        │                           │                        │                    │
        │◄── Processing started ────│                        │                    │
        │                           │                        │                    │
        │   (Poll or webhook for completion)                 │                    │
```

### 7.2 Image Limits

| Limit | Value |
|-------|-------|
| Max images per listing | 5 |
| Max file size | 10 MB |
| Allowed formats | JPEG, PNG, WebP |
| Max dimensions | 4096 x 4096 |

---

## 8. Notification Events

### 8.1 Owner Notifications

| Event | Channel | Content |
|-------|---------|---------|
| Listing approved | Email, WhatsApp | "Your listing for {pet_name} is now live!" |
| Listing rejected | Email | "Action needed: Your listing was not approved" |
| New inquiry | WhatsApp, Push | "Someone is interested in {pet_name}" |
| Listing expiring | Email | "Your listing expires in 7 days" |
| Listing expired | Email | "Your listing has expired" |

### 8.2 Adopter Notifications

| Event | Channel | Content |
|-------|---------|---------|
| Favorite adopted | Email | "A pet you saved has been adopted" |
| Price drop (if applicable) | Push | "Adoption fee reduced for {pet_name}" |

---

## 9. Content Moderation Rules

### 9.1 Auto-Approve Criteria

Listing auto-approved if ALL conditions met:
- User has no prior violations
- Content passes AI text check (no profanity, scams)
- Images pass AI check (no inappropriate content)
- Phone number verified
- All required fields present

### 9.2 Manual Review Queue

Listing sent to manual review if:
- User is new (first listing)
- AI flags potential issue (low confidence)
- User has prior warnings
- Reported by other users

### 9.3 Rejection Reasons (Predefined)

| Code | Reason |
|------|--------|
| `incomplete_info` | Missing required information |
| `poor_quality_images` | Images are blurry or don't show the pet clearly |
| `misleading_content` | Description doesn't match images |
| `suspected_commercial` | Appears to be commercial breeding (redirect to breeder) |
| `duplicate_listing` | Same pet already listed |
| `inappropriate_content` | Violates community guidelines |

---

## 10. Implementation Checklist

### 10.1 Backend

- [ ] Pet CRUD operations
- [ ] Adoption listing CRUD operations
- [ ] Image upload pre-signed URL generation
- [ ] Search and filter query builder
- [ ] Pagination helpers
- [ ] Favorites service
- [ ] Notification triggers
- [ ] Listing expiry background job

### 10.2 Database

- [ ] Run migrations for all tables
- [ ] Seed breeds and cities data
- [ ] Create required indexes
- [ ] Set up full-text search

### 10.3 Integration

- [ ] S3 bucket configuration
- [ ] Lambda image processor
- [ ] WhatsApp notification templates
- [ ] Email templates

---

*This document defines the Adoption vertical. Breeder vertical follows similar patterns with additional verification requirements.*
