# mypaws System Architecture

> Agent 1 – Principal SaaS Architect  
> Deliverable: Full system architecture decisions and reasoning

---

## 1. Deployment Philosophy

> **Phase 1 (Launch):** Single VPS with Docker Compose - ~₹1,000/month  
> **Phase 2 (Scale):** Migrate to AWS managed services when traffic justifies cost

---

## 2. Phase 1: Single Server Architecture (Recommended for Launch)

### 2.1 Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SINGLE VPS (Hetzner/DigitalOcean)                    │
│                         4 vCPU, 8GB RAM, 160GB SSD                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         DOCKER COMPOSE                                  │ │
│  │                                                                         │ │
│  │  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐        │ │
│  │  │   Caddy   │   │  Next.js  │   │  ASP.NET  │   │ PostgreSQL│        │ │
│  │  │  (Proxy)  │   │  Frontend │   │    API    │   │    DB     │        │ │
│  │  │           │   │           │   │           │   │           │        │ │
│  │  │ • SSL     │──►│ • SSR/ISR │──►│ • REST    │──►│ • Primary │        │ │
│  │  │   auto    │   │ • App     │   │ • JWT     │   │ • Backups │        │ │
│  │  │ • Reverse │   │   Router  │   │ • Hangfire│   │           │        │ │
│  │  │   proxy   │   │           │   │           │   │           │        │ │
│  │  └───────────┘   └───────────┘   └───────────┘   └───────────┘        │ │
│  │        │                                               │               │ │
│  │        │              ┌───────────┐                    │               │ │
│  │        │              │   Redis   │◄───────────────────┘               │ │
│  │        │              │  (Cache)  │                                    │ │
│  │        │              └───────────┘                                    │ │
│  │        │                                                               │ │
│  │        ▼                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                    PERSISTENT VOLUMES                            │  │ │
│  │  │  ./data/postgres  │  ./data/redis  │  ./uploads (media)         │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTPS (Let's Encrypt auto-SSL)
                                     ▼
                               mypaws.in
```

### 2.2 Monthly Cost (Phase 1)

| Item | Provider | Cost |
|------|----------|------|
| VPS (4 vCPU, 8GB RAM) | Hetzner CX31 | €7 (~₹650) |
| Backup storage | Hetzner (optional) | €3 (~₹280) |
| Domain | mypaws.in | ~₹70/month |
| **Total** | | **~₹1,000/month** |

### 2.3 Capacity (Phase 1)

- **Users:** Up to 50,000 monthly active users
- **Listings:** Up to 10,000 active listings
- **Storage:** 100GB+ media storage
- **Concurrent:** 100-200 concurrent users

### 2.4 Docker Compose Stack

```yaml
# docker-compose.yml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - frontend
      - api

  frontend:
    build: ./frontend
    environment:
      - API_URL=http://api:5000
    depends_on:
      - api

  api:
    build: ./backend
    environment:
      - ConnectionStrings__Default=Host=postgres;Database=mypaws;...
      - Redis__ConnectionString=redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=mypaws
      - POSTGRES_USER=mypaws
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  caddy_data:
  postgres_data:
  redis_data:
```

### 2.5 Caddyfile (Auto SSL)

```
mypaws.in {
    # Frontend (Next.js)
    handle /* {
        reverse_proxy frontend:3000
    }
    
    # API routes
    handle /api/* {
        reverse_proxy api:5000
    }
    
    # Media uploads
    handle /uploads/* {
        root * /srv/uploads
        file_server
    }
}
```

### 2.6 Backup Strategy (Phase 1)

```bash
# Daily backup script (cron)
#!/bin/bash
DATE=$(date +%Y%m%d)

# Postgres backup
docker exec postgres pg_dump -U mypaws mypaws | gzip > /backups/db_$DATE.sql.gz

# Upload to remote (optional)
rsync -avz /backups/ backup-server:/mypaws-backups/

# Keep last 7 days
find /backups -mtime +7 -delete
```

---

## 3. Phase 2: AWS Scaled Architecture (Future)

When to migrate: >50K MAU or revenue justifies ~$350+/month

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFRONT CDN                                  │
│                    (Static assets, images, ISR pages)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS APPLICATION LOAD BALANCER                      │
└─────────────────────────────────────────────────────────────────────────────┘
              │                                           │
              ▼                                           ▼
┌──────────────────────────────┐         ┌──────────────────────────────────────┐
│     NEXT.JS FRONTEND         │         │        ASP.NET CORE API             │
│     (ECS Fargate)            │         │        (ECS Fargate)                │
│                              │         │                                      │
│  • App Router (SSR/ISR)      │   ───►  │  • REST API                         │
│  • Server Components         │         │  • JWT Authentication               │
│  • Edge Middleware           │         │  • Business Logic                   │
│  • Image Optimization        │         │  • Background Jobs (Hangfire)       │
└──────────────────────────────┘         └──────────────────────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────┐
                    │                                     │                     │
                    ▼                                     ▼                     ▼
          ┌─────────────────┐                   ┌─────────────────┐   ┌─────────────────┐
          │   POSTGRESQL    │                   │    AWS S3       │   │   REDIS         │
          │   (AWS RDS)     │                   │   (Media)       │   │   (ElastiCache) │
          │                 │                   │                 │   │                 │
          │  • Primary DB   │                   │  • Pet images   │   │  • Session      │
          │  • Read replica │                   │  • Documents    │   │  • Rate limit   │
          │  • Automated    │                   │  • Thumbnails   │   │  • Cache        │
          │    backups      │                   │                 │   │                 │
          └─────────────────┘                   └─────────────────┘   └─────────────────┘
```

### 3.1 Migration Path

1. Export PostgreSQL dump from VPS
2. Import to RDS
3. Move media to S3
4. Deploy containers to ECS
5. Update DNS to ALB
6. Monitor and scale

---

## 4. Frontend Architecture (Next.js)

### 2.1 Rendering Strategy Per Page Type

| Page Type | Route Pattern | Rendering | Revalidation | Rationale |
|-----------|--------------|-----------|--------------|-----------|
| Homepage | `/` | ISR | 60s | SEO critical, moderate freshness |
| Breed listing | `/adopt-a-dog`, `/adopt-a-cat` | ISR | 300s | SEO money page, slower data change |
| City+Breed listing | `/adopt-a-pet/{breed}-dog-in-{city}` | ISR | 600s | Programmatic SEO, high volume |
| Individual pet | `/adopt-a-pet/{breed}-{type}-in-{city}/{pet-id}` | ISR | 60s | SEO critical, needs freshness |
| Breeder listing | `/buy-dogs/{breed}-in-{city}` | ISR | 600s | SEO money page |
| Breeder profile | `/breeders/{slug}` | ISR | 300s | Trust signals, moderate updates |
| User dashboard | `/dashboard/*` | CSR | N/A | Private, real-time data |
| Create listing | `/listings/new` | CSR | N/A | Authenticated, forms |
| Auth pages | `/login`, `/verify` | SSR | N/A | Dynamic, session-dependent |
| Admin panel | `/admin/*` | CSR | N/A | Private, real-time |

### 2.2 Server vs Client Components

**Server Components (Default)**
- All listing pages (pet cards, breeder cards)
- SEO metadata generation
- Breed/city static data
- FAQ sections
- Structured data injection

**Client Components (Explicit)**
- Auth state provider
- Image upload widgets
- Search filters with instant feedback
- Contact modals (gated)
- Dashboard real-time updates
- Form components

### 2.3 Middleware Responsibilities

```typescript
// Edge Middleware handles:
1. Geo-detection → Default city selection
2. Auth token validation → Redirect unauthenticated
3. A/B testing flags
4. Rate limiting headers
5. Bot detection for SEO pages
```

---

## 5. Backend API Structure (.NET 8)

### 3.1 Project Structure

```
src/
├── Mypaws.Api/                    # Web API entry point
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── PetsController.cs
│   │   ├── AdoptionListingsController.cs
│   │   ├── BreedersController.cs
│   │   ├── BreederListingsController.cs
│   │   ├── LocationsController.cs
│   │   ├── PaymentsController.cs
│   │   └── AdminController.cs
│   ├── Middleware/
│   │   ├── ExceptionMiddleware.cs
│   │   ├── RateLimitingMiddleware.cs
│   │   └── AuditMiddleware.cs
│   └── Program.cs
│
├── Mypaws.Application/            # Business logic (CQRS)
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
│   ├── Validators/
│   └── Services/
│
├── Mypaws.Domain/                 # Entities, value objects
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   └── Events/
│
├── Mypaws.Infrastructure/         # External concerns
│   ├── Persistence/
│   │   ├── MypawsDbContext.cs
│   │   ├── Repositories/
│   │   └── Migrations/
│   ├── Identity/
│   ├── Storage/                   # S3 integration
│   ├── Payments/                  # Razorpay/Stripe
│   ├── WhatsApp/                  # Meta API
│   └── BackgroundJobs/            # Hangfire
│
└── Mypaws.Shared/                 # DTOs, constants
    ├── DTOs/
    ├── Constants/
    └── Extensions/
```

### 3.2 API Endpoint Categories

| Category | Base Route | Auth Required | Purpose |
|----------|-----------|---------------|---------|
| Public | `/api/v1/public/*` | No | SEO pages data, search, breeds |
| Listings | `/api/v1/listings/*` | Yes | Create, update, delete listings |
| Users | `/api/v1/users/*` | Yes | Profile, verification status |
| Breeders | `/api/v1/breeders/*` | Yes | Breeder registration, listings |
| Payments | `/api/v1/payments/*` | Yes | Payment initiation, webhooks |
| Admin | `/api/v1/admin/*` | Admin role | Moderation, approvals |
| Webhooks | `/api/v1/webhooks/*` | Signature | Razorpay, WhatsApp callbacks |

### 3.3 Key Design Decisions

1. **CQRS Pattern**: Separate read/write models for complex listing queries
2. **MediatR**: Decouple controllers from business logic
3. **FluentValidation**: Request validation before handlers
4. **Hangfire**: Background jobs (image processing, notifications)
5. **Polly**: Retry policies for external APIs (WhatsApp, Razorpay)

---

## 6. Database Responsibility Boundaries

### 4.1 PostgreSQL (Primary Datastore)

**Stores:**
- All transactional data
- User accounts and verification states
- Pet and listing records
- Breeder profiles and approvals
- Payment records
- Audit logs
- Location master data

**Indexes for SEO:**
- Composite index on `(breed_slug, city_slug, pet_type)`
- Full-text search index on pet descriptions
- B-tree index on `created_at` for recent listings

### 4.2 Redis (ElastiCache)

**Purpose:**
- Session storage (JWT blacklist)
- Rate limiting counters
- Cached breed/city master data (TTL: 24h)
- Search result caching (TTL: 5min)
- Real-time listing counts per city

### 4.3 Data Flow Boundaries

```
Browser Request
      │
      ▼
┌─────────────┐     Cache Hit?     ┌─────────────┐
│  Next.js    │ ──────────────────►│   Redis     │
│  Server     │◄────── Yes ────────│             │
└─────────────┘                    └─────────────┘
      │ No
      ▼
┌─────────────┐
│  .NET API   │
└─────────────┘
      │
      ▼
┌─────────────┐     Query          ┌─────────────┐
│  App Layer  │ ──────────────────►│ PostgreSQL  │
└─────────────┘◄───────────────────│             │
                   Results         └─────────────┘
```

---

## 7. Media Storage & Delivery (Phase 2)

### 5.1 Architecture

```
User Upload                    Delivery
    │                             │
    ▼                             ▼
┌─────────────┐             ┌─────────────┐
│  .NET API   │             │  CloudFront │
│  (Pre-sign) │             │  (CDN)      │
└─────────────┘             └─────────────┘
    │                             │
    ▼                             │
┌─────────────┐                   │
│   S3        │◄──────────────────┘
│   Bucket    │
└─────────────┘
    │
    ▼ (Lambda trigger)
┌─────────────┐
│   Lambda    │
│   (Resize)  │
└─────────────┘
    │
    ▼
┌─────────────┐
│  S3 (thumbs)│
└─────────────┘
```

### 5.2 Image Specifications

| Variant | Dimensions | Use Case |
|---------|-----------|----------|
| Original | Max 4096x4096 | Backup, admin |
| Large | 1200x1200 | Pet detail page |
| Medium | 600x600 | Listing cards |
| Thumbnail | 200x200 | Search results, grid |
| OG Image | 1200x630 | Social sharing |

### 5.3 S3 Bucket Structure

```
mypaws-media-{env}/
├── pets/
│   └── {pet-id}/
│       ├── original/
│       │   └── {uuid}.jpg
│       ├── large/
│       ├── medium/
│       └── thumb/
├── breeders/
│   └── {breeder-id}/
│       ├── logo/
│       └── gallery/
└── users/
    └── {user-id}/
        └── avatar/
```

### 5.4 Security

- Pre-signed URLs for uploads (15 min expiry)
- Public read for processed images via CloudFront
- Origin Access Control (OAC) for S3
- No direct S3 public access

---

## 8. Authentication & Authorization Boundaries

### 6.1 Auth Flow Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────────┘

1. Google OAuth Login
   User ──► Next.js ──► Google ──► Callback ──► .NET API
                                                    │
                                         Create/Update User
                                                    │
                                         Issue JWT (access + refresh)
                                                    │
                                         Return tokens to Next.js
                                                    │
                                         Store in httpOnly cookies

2. WhatsApp Verification (Required for actions)
   User ──► .NET API ──► Meta WhatsApp API ──► Send OTP
                                │
   User enters OTP ──► .NET API ──► Verify ──► Mark user verified
```

### 6.2 Authorization Levels

| Level | Can Do | Cannot Do |
|-------|--------|-----------|
| Anonymous | View listings (limited), search | View contact details, create listings |
| Registered (unverified) | Full listing view, save favorites | Create listings, contact |
| Verified User | All of above + create adoption listing, contact | Breeder listings |
| Verified Breeder | All of above + breeder listings | Admin functions |
| Admin | All actions | N/A |

### 6.3 JWT Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "phone_verified": true,
  "roles": ["user", "breeder"],
  "breeder_approved": true,
  "iat": 1707234567,
  "exp": 1707238167
}
```

---

## 9. Admin & Moderation Architecture

### 7.1 Admin Panel (Separate Next.js App or Route Group)

```
/admin
├── /dashboard          # Overview stats
├── /breeders
│   ├── /pending        # Approval queue
│   └── /[id]           # Breeder detail + history
├── /listings
│   ├── /reported       # Flagged content
│   └── /[id]           # Listing moderation
├── /users
│   └── /[id]           # User management
└── /audit-logs         # System audit trail
```

### 7.2 Moderation Workflow

```
Listing Submitted
       │
       ▼
┌─────────────────┐
│  Auto-check     │
│  (Content AI)   │
└─────────────────┘
       │
       ├── Pass ──► Published
       │
       └── Flag ──► Pending Review Queue
                           │
                           ▼
                    Admin Reviews
                           │
                    ├── Approve ──► Published
                    └── Reject ──► Notify User + Log
```

### 7.3 Audit Logging

Every admin action logged:
- Who (admin user ID)
- What (action type, entity type, entity ID)
- When (timestamp)
- Before/After state (JSON diff)

---

## 10. Scalability Considerations (Phase 2)

### 8.1 Horizontal Scaling

| Component | Scaling Strategy |
|-----------|-----------------|
| Next.js | ECS Fargate auto-scaling on CPU/memory |
| .NET API | ECS Fargate auto-scaling on request count |
| PostgreSQL | Read replicas for SEO queries |
| Redis | ElastiCache cluster mode |
| S3/CloudFront | Inherently scalable |

### 8.2 Performance Targets

| Metric | Target |
|--------|--------|
| TTFB (SEO pages) | < 200ms |
| API response (p95) | < 100ms |
| Image load (CDN) | < 50ms |
| Search results | < 300ms |

### 8.3 Caching Strategy

| Layer | Cache | TTL |
|-------|-------|-----|
| CDN | Static assets, ISR pages | 1h - 24h |
| Redis | API responses, session | 5min - 24h |
| PostgreSQL | Query plan cache | Auto |
| Next.js | ISR stale-while-revalidate | Per route |

---

## 11. Security Considerations

### 9.1 Infrastructure Security

- **VPC**: All resources in private subnets except ALB
- **Security Groups**: Least privilege access
- **WAF**: Rate limiting, SQL injection protection
- **Secrets Manager**: API keys, DB credentials
- **IAM Roles**: ECS task roles with minimal permissions

### 9.2 Application Security

- **HTTPS Only**: Enforce TLS 1.3
- **CORS**: Whitelist allowed origins
- **CSP**: Content Security Policy headers
- **Input Validation**: FluentValidation on all inputs
- **SQL Injection**: Parameterized queries via EF Core
- **XSS**: React auto-escaping + DOMPurify for UGC

### 9.3 Data Protection

- **PII Encryption**: Phone numbers encrypted at rest
- **Soft Deletes**: No hard deletion of user data
- **Data Retention**: 7-year audit log retention
- **Backup**: Daily automated RDS snapshots, 30-day retention

---

## 12. Environment Strategy

| Environment | Purpose | Infrastructure |
|-------------|---------|---------------|
| Development | Local development | Docker Compose |
| Staging | Integration testing | Single-instance AWS |
| Production | Live traffic | Auto-scaled AWS |

### 10.1 CI/CD Pipeline

```
GitHub Push
     │
     ▼
GitHub Actions
     │
     ├── Build & Test
     │
     ├── Docker Build
     │
     ├── Push to ECR
     │
     └── Deploy to ECS (Blue/Green)
```

---

## 13. Technology Decision Summary

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Frontend | Next.js App Router | SSR/ISR for SEO, React ecosystem |
| Backend | ASP.NET Core 8 | Type safety, performance, mature ecosystem |
| Database | PostgreSQL | Relational integrity, JSON support, RDS managed |
| Cache | Redis | Session, rate limiting, fast lookups |
| Media | S3 + CloudFront | Cost-effective, CDN performance |
| Auth | JWT + OAuth 2.0 | Stateless, industry standard |
| Payments | Razorpay (India) | UPI support, local compliance |
| Background Jobs | Hangfire | .NET native, dashboard, reliability |
| Container | ECS Fargate | Serverless containers, auto-scaling |
| IaC | Terraform | Multi-cloud ready, state management |

---

## 14. Diagram: Request Flow for SEO Page

```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│ Browser │────►│ CloudFront │────►│ Next.js ECS │────►│ .NET API │
└─────────┘     └────────────┘     └─────────────┘     └──────────┘
                      │                   │                  │
                      │              ISR Check           Query DB
                      │                   │                  │
                      ▼                   ▼                  ▼
               ┌────────────┐     ┌─────────────┐     ┌──────────┐
               │ S3 Static  │     │ Redis Cache │     │ Postgres │
               └────────────┘     └─────────────┘     └──────────┘
```

---

*This document defines architectural boundaries. Implementation details are covered by subsequent agent deliverables.*
