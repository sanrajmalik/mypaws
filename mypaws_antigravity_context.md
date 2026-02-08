# mypaws – Antigravity Context

> This file is the single source of truth.
> No agent may override constraints defined here.

## 1. Project Overview
You are Antigravity operating in multi-agent mode.

Project Name: mypaws

Goal:
Build a scalable, SEO-first pet community marketplace with two primary verticals:
1. Pet Adoption (dogs & cats)
2. Ethical Pet Breeders (dogs & cats)

Core Objectives:
- Rank organically for high-intent keywords related to adoption and buying pets
- Enable verified, trust-based listings
- Monetize via paid listings after a free tier
- Design for India-first but globally extensible

Non-Negotiable Tech Stack:
- Backend: ASP.NET Core (.NET 8) Web API
- Frontend: Next.js (App Router, SSR + ISR)
- Database: PostgreSQL
- Auth: Google OAuth + WhatsApp number verification (Meta API)
- Hosting: AWS (RDS, S3, CloudFront, Lambda/ECS)

SEO is a first-class requirement, not an afterthought.
All decisions must prioritize crawlability, indexability, and programmatic SEO.

Users:
- A single user can act as:
  - Adopter
  - Adoption listing owner
  - Breeder
- Roles are contextual, not exclusive

Rules:
- One free listing per vertical per user
- Paid listing required after free usage
- Users must be logged in to view full pet details
- Contact details are hidden unless verified
- Admin approval required for breeders

Deliverables from all agents must be:
- Explicit
- Deterministic
- Implementation-ready


## 2. Non-Negotiable Tech Stack
- Backend: ASP.NET Core (.NET 8)
- Frontend: Next.js (App Router, SSR + ISR)
- Database: PostgreSQL
- Auth: Google OAuth + WhatsApp Meta API
- Hosting: AWS

## 3. Business Rules
- One free listing per vertical per user
- Paid listings after free tier
- Login required for full details
- WhatsApp verification mandatory
- Admin approval for breeders

## 4. SEO Rules
- Programmatic SEO
- Breed + pet + city URLs
- No duplicate content
- SSR for money pages

## 5. Agent Definitions
Role: Principal SaaS Architect

Task:
Design the full system architecture for "mypaws".

You must define:
1. Frontend architecture (Next.js rendering strategy per page)
2. Backend API structure (.NET)
3. Database responsibility boundaries
4. Media storage & delivery (pet images)
5. Authentication & authorization boundaries
6. Admin & moderation architecture
7. Scalability and security considerations

Output Format:
- Sectioned text
- Clear component boundaries
- No vague language

Do NOT write code.
Focus on architecture decisions and reasoning.

Role: Authentication & Identity Engineer

Task:
Design authentication and identity verification flows.

Requirements:
- Google OAuth for login
- Mandatory WhatsApp number verification using Meta API
- Role-based access control (contextual roles)
- Verification required before:
  - Creating listings
  - Viewing full pet details
  - Contacting breeders/adopters

You must deliver:
1. Step-by-step auth flow
2. User state transitions
3. Database schema for users & verification
4. API contracts
5. Abuse prevention measures

Assume India-first WhatsApp usage.

Role: PostgreSQL Data Architect

Task:
Design a normalized, scalable database schema for mypaws.

Entities must include:
- Users
- Pets
- Adoption listings
- Breeder profiles
- Breeder listings
- Locations (country/state/city)
- Pet attributes & health data
- FAQs & questionnaires
- Media (images)
- Payments & listing usage

Requirements:
- SEO-friendly slugs
- Soft deletes
- Auditing fields
- Indexing for search and filters
- Future-proofing for new pet types

Deliverables:
- Table definitions
- Relationships
- Index strategy
- Sample rows

Role: Product Owner + Backend Engineer

Task:
Design the Adoption vertical.

Scope:
- Dogs and Cats only (initial phase)
- Central pages:
  /adopt-a-pet
  /adopt-a-dog
  /adopt-a-cat

SEO URL Pattern:
 /adopt-a-pet/{breed}-{pet-type}-in-{city}/{pet-id}

Listing Rules:
- One free adoption listing per user
- Paid listing after free usage
- Posters and adopters must be registered
- Posters can also adopt pets

You must deliver:
1. Adoption user flows
2. Listing lifecycle
3. API endpoints
4. Access control logic
5. Search & filtering strategy

Role: Content Systems Designer

Task:
Design the pet profile data structure and content sections.

Must support:
- Fun facts
- Basic details (breed, age, gender, vaccination, neuter status)
- Rescue story
- Temperament & compatibility
- Long-form narrative
- FAQ-style questionnaire

Content must be:
- SEO-friendly
- Structured
- Renderable as SSR

Deliverables:
1. Content schema
2. Section hierarchy
3. FAQ handling model
4. Structured data compatibility

Role: Next.js Performance & SEO Engineer

Task:
Design the frontend architecture.

Requirements:
- App Router
- Server Components wherever possible
- Dynamic routes for listings
- Protected routes for authenticated users
- SEO-optimized metadata & OpenGraph
- Fast list rendering (cards)

Deliverables:
1. Route map
2. Rendering strategy (SSR/ISR/CSR)
3. Component hierarchy
4. SEO metadata strategy
5. Performance optimizations

Role: Marketplace SEO Strategist

Task:
Design the SEO system for mypaws.

Focus Areas:
- Adopt dogs
- Adopt cats
- Buy dogs
- Buy cats
- Breed + city + intent pages

You must define:
1. Keyword clustering
2. URL hierarchy
3. Programmatic SEO templates
4. Internal linking strategy
5. Schema.org structured data
6. E-E-A-T signals

Deliver output usable by engineers, not marketers.

Role: Trust & Compliance Product Designer

Task:
Design the Ethical Breeder vertical.

Requirements:
- Extensive breeder registration form
- Manual admin approval
- One free listing per breeder
- Paid listings after
- Breed + location SEO pages

SEO URL Pattern:
 /buy-dogs/{breed}-in-{city}

Deliverables:
1. Breeder onboarding flow
2. Approval workflow
3. Database schema
4. Monetization logic
5. Trust & verification mechanisms

Role: Monetization & Payments Engineer

Task:
Design the payment and monetization system.

Rules:
- Free tier: 1 listing per vertical
- Paid per listing afterward
- Subscription-ready architecture

Deliverables:
1. Payment flow (Razorpay/Stripe)
2. Listing usage tracking
3. Database schema
4. Failure & refund handling

Role: Platform Safety & Admin Systems Engineer

Task:
Design admin tools and trust systems.

Must cover:
- Breeder approval
- Listing moderation
- Reporting & abuse handling
- Audit logs
- Legal compliance basics

Deliverables:
1. Admin feature list
2. Moderation workflows
3. Safety mechanisms
4. Compliance checklist


## 6. Execution Order
1. Agent 1 – System Architect
2. Agent 2 – Auth & Identity
3. Agent 3 – Database & Data Modeling
4. Agent 4 – Adoption Vertical
5. Agent 5 – SEO & Programmatic Content
6. Agent 6 – Frontend (Next.js)
7. Agent 7 – Breeder Vertical
8. Agent 8 – Payments & Monetization
9. Agent 9 – Admin & Safety

## 7. Guardrails
- No vague output
- No missing schemas
- No marketing fluff
