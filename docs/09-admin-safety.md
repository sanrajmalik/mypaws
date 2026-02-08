# mypaws Admin & Platform Safety System

> Agent 9 – Platform Safety & Admin Systems Engineer  
> Deliverable: Admin panel structure, moderation tools, audit logging, abuse prevention

---

## 1. Admin System Overview

### 1.1 Admin Roles

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| Super Admin | Full | All actions, role management, system config |
| Admin | High | User/content moderation, breeder approval |
| Moderator | Medium | Content review, report handling |
| Support | Low | View-only, respond to tickets |

### 1.2 Admin Panel Structure

```
/admin
├── /dashboard                    # Overview & metrics
├── /listings
│   ├── /pending                  # New listings awaiting review
│   ├── /reported                 # Reported listings
│   └── /all                      # All listings (searchable)
├── /breeders
│   ├── /pending                  # Breeder applications
│   ├── /verified                 # Approved breeders
│   └── /flagged                  # Flagged for review
├── /users
│   ├── /all                      # User management
│   ├── /suspended                # Suspended accounts
│   └── /reports                  # User reports
├── /payments
│   ├── /transactions             # Payment history
│   └── /refunds                  # Refund requests
├── /reports
│   ├── /queue                    # Unresolved reports
│   └── /resolved                 # Handled reports
├── /content
│   ├── /breeds                   # Breed database
│   └── /locations                # Location data
└── /settings
    ├── /team                     # Admin users
    ├── /roles                    # Role permissions
    └── /config                   # Platform settings
```

---

## 2. Dashboard Metrics

### 2.1 Key Metrics

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ADMIN DASHBOARD                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  PENDING REVIEW  │ │  REPORTS TODAY   │ │  NEW BREEDERS    │ │  REVENUE TODAY   │
│       12         │ │        5         │ │        3         │ │    ₹4,999        │
│   ↑3 from yday   │ │   ↓2 from yday   │ │   same as yday   │ │   ↑15% WoW       │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│  QUEUE STATUS                                                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│  Listings Pending Review:     12  │  Avg Review Time:  2.3 hours                 │
│  Breeder Apps Pending:         8  │  Overdue (>24h):   2                         │
│  Reports Unresolved:           5  │  Escalated:        1                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Real-time Metrics API

#### GET /api/v1/admin/dashboard/metrics

**Response:**
```json
{
  "queues": {
    "listings_pending": 12,
    "breeder_apps_pending": 8,
    "reports_unresolved": 5,
    "refunds_pending": 2
  },
  "today": {
    "new_users": 45,
    "new_listings": 23,
    "adoptions_completed": 5,
    "revenue": 4999.00
  },
  "performance": {
    "avg_listing_review_time_mins": 138,
    "avg_breeder_review_time_hours": 18.5,
    "avg_report_resolution_time_mins": 45
  },
  "trends": {
    "users_7d": [34, 45, 38, 52, 41, 48, 45],
    "listings_7d": [18, 23, 19, 25, 21, 28, 23],
    "revenue_7d": [3499, 4999, 2999, 5499, 3999, 4499, 4999]
  }
}
```

---

## 3. Moderation Workflows

### 3.1 Listing Moderation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      LISTING MODERATION WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

                              New Listing
                                  │
                                  ▼
                         ┌───────────────┐
                         │  AUTO-CHECK   │
                         │               │
                         │ • Spam score  │
                         │ • Image AI    │
                         │ • Duplicate   │
                         │ • Blacklist   │
                         └───────┬───────┘
                                 │
               ┌─────────────────┼─────────────────┐
               │                 │                 │
        Pass (score<30)   Needs Review      Fail (score>80)
               │           (30-80)               │
               │                 │               │
               ▼                 ▼               ▼
        ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
        │ AUTO-       │   │  QUEUE FOR  │   │   AUTO-     │
        │ APPROVE     │   │  MANUAL     │   │   REJECT    │
        │             │   │  REVIEW     │   │             │
        └─────────────┘   └──────┬──────┘   └─────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                 Approve    Request Edit    Reject
                    │            │            │
                    ▼            ▼            ▼
             ┌──────────┐  ┌──────────┐  ┌──────────┐
             │  ACTIVE  │  │  EDIT    │  │ REJECTED │
             │          │  │ REQUESTED│  │          │
             └──────────┘  └──────────┘  └──────────┘
```

### 3.2 Listing Review UI Data

#### GET /api/v1/admin/listings/pending

**Response:**
```json
{
  "data": [
    {
      "id": "al000001-...",
      "type": "adoption",
      "title": "Cute Labrador puppy for adoption",
      "created_at": "2024-02-06T10:00:00Z",
      "queue_time_mins": 120,
      "owner": {
        "id": "u000001-...",
        "name": "John Doe",
        "verification_status": "verified",
        "account_age_days": 45,
        "previous_listings": 2,
        "trust_score": 75
      },
      "pet": {
        "name": "Bruno",
        "breed": "Labrador Retriever",
        "age_display": "2 years",
        "gender": "male"
      },
      "images": [...],
      "auto_review": {
        "spam_score": 15,
        "image_flags": [],
        "duplicate_check": false,
        "blacklist_match": false,
        "recommendation": "approve"
      },
      "priority": "normal"
    }
  ],
  "pagination": {...}
}
```

### 3.3 Moderation Actions

#### POST /api/v1/admin/listings/{id}/moderate

**Request - Approve:**
```json
{
  "action": "approve",
  "notes": "Clean listing, meets all guidelines"
}
```

**Request - Reject:**
```json
{
  "action": "reject",
  "reason_code": "prohibited_content",
  "reason_detail": "Listing contains pricing for adoption which violates our free adoption policy",
  "notify_user": true
}
```

**Request - Request Edit:**
```json
{
  "action": "request_edit",
  "required_changes": [
    "Remove pricing - adoptions must be free",
    "Upload clearer photos of the pet"
  ],
  "deadline_hours": 48
}
```

---

## 4. Breeder Approval Queue

### 4.1 Breeder Review UI

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      BREEDER APPLICATION REVIEW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─ Application Details ──────────────────────────────────────────────────────────┐
│                                                                                 │
│  Business: Royal Paws Kennels          Submitted: Feb 5, 2024 (2 days ago)     │
│  Breeds: German Shepherd, Labrador     Experience: 8 years                      │
│  Location: Bangalore, Karnataka                                                 │
│                                                                                 │
├─ Verification Documents ───────────────────────────────────────────────────────┤
│                                                                                 │
│  [✓] ID Proof (Aadhaar)    [View Document]     Matches: YES                    │
│  [✓] Address Proof         [View Document]     Matches: YES                    │
│  [✓] Kennel Photos (5)     [View Gallery]      Quality: GOOD                   │
│  [ ] KC Registration       Not Provided                                         │
│                                                                                 │
├─ Risk Assessment ──────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Phone Blacklist: No          Email Blacklist: No                              │
│  Duplicate Account: No        Previous Rejections: 0                           │
│  Risk Score: LOW (15/100)                                                       │
│                                                                                 │
├─ Actions ──────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [APPROVE]  [REQUEST INFO]  [REJECT]  [ESCALATE]                               │
│                                                                                 │
│  Notes: _______________________________________________________________        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Breeder Application API

#### GET /api/v1/admin/breeders/applications/pending

**Response:**
```json
{
  "data": [
    {
      "id": "ba000001-...",
      "business_name": "Royal Paws Kennels",
      "submitted_at": "2024-02-04T14:00:00Z",
      "queue_time_hours": 48,
      "sla_deadline": "2024-02-09T14:00:00Z",
      "applicant": {
        "user_id": "u000002-...",
        "name": "Rahul Sharma",
        "phone_verified": true,
        "account_age_days": 30
      },
      "breeds": ["German Shepherd", "Labrador Retriever"],
      "location": {
        "city": "Bangalore",
        "state": "Karnataka"
      },
      "documents": {
        "id_proof": {"url": "...", "type": "aadhaar"},
        "address_proof": {"url": "...", "type": "utility_bill"},
        "kennel_photos": [...]
      },
      "risk_assessment": {
        "score": 15,
        "level": "low",
        "flags": []
      },
      "assigned_to": null,
      "priority": "normal"
    }
  ],
  "pagination": {...}
}
```

#### POST /api/v1/admin/breeders/applications/{id}/review

**Request - Approve:**
```json
{
  "action": "approve",
  "internal_notes": "Documents verified, clean history",
  "badges": ["verified"]
}
```

**Request - Request More Info:**
```json
{
  "action": "request_info",
  "required_documents": ["kc_registration"],
  "required_info": ["Please provide proof of litter registration"],
  "deadline_days": 7
}
```

**Request - Reject:**
```json
{
  "action": "reject",
  "reason_code": "unverifiable_documents",
  "reason_detail": "ID document is blurry and cannot be verified",
  "allow_reapply": true,
  "reapply_after_days": 30
}
```

---

## 5. Report Handling

### 5.1 Report Types

| Type | Priority | SLA |
|------|----------|-----|
| Pet in Danger | Critical | 2 hours |
| Scam/Fraud | High | 4 hours |
| Harassment | High | 4 hours |
| Spam | Medium | 24 hours |
| Duplicate | Low | 48 hours |
| Other | Low | 48 hours |

### 5.2 Report Queue

#### GET /api/v1/admin/reports/queue

**Response:**
```json
{
  "data": [
    {
      "id": "rpt000001-...",
      "type": "scam",
      "priority": "high",
      "status": "pending",
      "created_at": "2024-02-06T11:00:00Z",
      "sla_deadline": "2024-02-06T15:00:00Z",
      "time_remaining_mins": 180,
      "reporter": {
        "id": "u000003-...",
        "name": "Anonymous",
        "is_verified": true
      },
      "reported_entity": {
        "type": "breeder_listing",
        "id": "bl000002-...",
        "title": "German Shepherd puppies - Best price"
      },
      "reason": "Price is too low, likely scam. No response from breeder.",
      "evidence": [
        {"type": "screenshot", "url": "..."}
      ],
      "previous_reports": 0
    }
  ],
  "pagination": {...},
  "stats": {
    "total_pending": 5,
    "overdue": 1,
    "critical": 0
  }
}
```

### 5.3 Report Resolution

#### POST /api/v1/admin/reports/{id}/resolve

**Request - Take Action:**
```json
{
  "action": "content_removed",
  "actions_taken": [
    {"type": "suspend_listing", "entity_id": "bl000002-..."},
    {"type": "warn_user", "user_id": "u000004-...", "reason": "Suspected fraudulent listing"}
  ],
  "resolution_notes": "Listing removed due to suspected scam pattern. User warned.",
  "notify_reporter": true,
  "reporter_message": "Thank you for your report. We have removed the listing due to policy violations."
}
```

**Request - Dismiss:**
```json
{
  "action": "dismissed",
  "resolution_notes": "No violation found. Listing meets all guidelines.",
  "notify_reporter": true,
  "reporter_message": "We reviewed your report and found no policy violations."
}
```

---

## 6. Audit Logging

### 6.1 Audit Events

| Category | Events |
|----------|--------|
| Auth | login, logout, failed_login, password_change |
| User | create, update, suspend, unsuspend, delete |
| Listing | create, update, submit, approve, reject, suspend |
| Breeder | apply, approve, reject, suspend, update |
| Payment | initiate, complete, fail, refund |
| Admin | action, config_change, role_change |

### 6.2 Audit Log Schema

```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    actor_id        UUID REFERENCES users(id),
    actor_type      VARCHAR(20) NOT NULL,  -- user, admin, system
    actor_ip        INET,
    actor_user_agent TEXT,
    
    -- Action
    action          VARCHAR(100) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    
    -- Target
    target_type     VARCHAR(50),           -- user, listing, breeder, etc.
    target_id       UUID,
    
    -- Details
    old_values      JSONB,
    new_values      JSONB,
    metadata        JSONB,
    
    -- Result
    status          VARCHAR(20) NOT NULL,  -- success, failure
    error_message   TEXT,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_action ON audit_logs(category, action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_search ON audit_logs USING GIN (metadata);
```

### 6.3 Audit Log API

#### GET /api/v1/admin/audit-logs

**Query Parameters:**
- `actor_id` - Filter by user
- `target_type`, `target_id` - Filter by target
- `category`, `action` - Filter by action type
- `start_date`, `end_date` - Date range
- `page`, `limit` - Pagination

**Response:**
```json
{
  "data": [
    {
      "id": "log000001-...",
      "actor": {
        "id": "u000001-...",
        "name": "Admin User",
        "type": "admin"
      },
      "action": "listing.approve",
      "category": "moderation",
      "target": {
        "type": "adoption_listing",
        "id": "al000001-..."
      },
      "changes": {
        "status": {"from": "pending_review", "to": "active"}
      },
      "metadata": {
        "notes": "Clean listing, meets guidelines"
      },
      "ip": "192.168.1.1",
      "created_at": "2024-02-06T12:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 7. Abuse Prevention

### 7.1 Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Auth endpoints | 5 requests | 1 minute |
| OTP send | 3 requests | 5 minutes |
| Listing create | 10 requests | 1 hour |
| Contact reveal | 20 requests | 1 hour |
| Search | 60 requests | 1 minute |

### 7.2 Spam Detection

```python
def calculate_spam_score(listing: Listing) -> int:
    score = 0
    
    # Text analysis
    if contains_phone_in_text(listing.description):
        score += 30
    if contains_email_in_text(listing.description):
        score += 20
    if excessive_caps_ratio(listing.description) > 0.3:
        score += 15
    if duplicate_content_detected(listing.description):
        score += 40
    
    # User history
    if user.account_age_days < 7:
        score += 20
    if user.previous_rejected_listings > 0:
        score += user.previous_rejected_listings * 15
    if user.reports_received > 0:
        score += user.reports_received * 10
    
    # Image analysis
    for image in listing.images:
        if image_contains_text(image):
            score += 10
        if image_is_stock_photo(image):
            score += 25
    
    return min(score, 100)
```

### 7.3 Blacklist Management

```sql
CREATE TABLE blacklists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    type            VARCHAR(50) NOT NULL,
    /* phone, email, ip, device_id, content_hash */
    
    value           TEXT NOT NULL,
    value_hash      VARCHAR(64) NOT NULL,  -- SHA-256 for lookup
    
    reason          VARCHAR(100) NOT NULL,
    severity        VARCHAR(20) NOT NULL,  -- warning, block, permanent
    
    expires_at      TIMESTAMPTZ,           -- NULL = permanent
    
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_blacklist_lookup ON blacklists(type, value_hash);
CREATE INDEX idx_blacklist_expiry ON blacklists(expires_at);
```

---

## 8. User Management

### 8.1 User Actions

| Action | Effect | Reversible |
|--------|--------|------------|
| Warn | Send warning message | Yes |
| Suspend | Temporarily disable account | Yes |
| Ban | Permanently disable account | With approval |
| Delete | GDPR deletion request | No |

### 8.2 Suspension Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        USER SUSPENSION FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

                              Violation Detected
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
               First Offense   Repeat Offense   Severe
                    │               │               │
                    ▼               ▼               ▼
             ┌──────────┐    ┌──────────┐    ┌──────────┐
             │  WARNING │    │  7-DAY   │    │ PERMANENT│
             │          │    │ SUSPEND  │    │   BAN    │
             └──────────┘    └──────────┘    └──────────┘
                                  │
                                  │ After 7 days
                                  ▼
                           ┌────────────┐
                           │ AUTO-UNSUP │
                           │ + PROBATION│
                           └────────────┘
```

### 8.3 User Management API

#### POST /api/v1/admin/users/{id}/moderate

**Request - Suspend:**
```json
{
  "action": "suspend",
  "duration_days": 7,
  "reason_code": "policy_violation",
  "reason_detail": "Multiple spam listings detected",
  "suspend_listings": true,
  "notify_user": true
}
```

**Request - Unsuspend:**
```json
{
  "action": "unsuspend",
  "notes": "Appeal reviewed and accepted",
  "probation_days": 30
}
```

---

## 9. Platform Configuration

### 9.1 Feature Flags

```json
{
  "feature_flags": {
    "breeder_registration_open": true,
    "paid_listings_enabled": true,
    "auto_approve_verified_users": false,
    "whatsapp_verification_required": true,
    "new_user_listing_limit": 3,
    "breeder_free_tier_enabled": true
  }
}
```

### 9.2 Content Settings

```json
{
  "content_settings": {
    "max_images_per_listing": 10,
    "max_description_length": 2000,
    "auto_moderation_threshold": 30,
    "listing_expiry_days": 90,
    "breeder_review_sla_hours": 72
  }
}
```

---

## 10. Database Schema Additions

### 10.1 Admin Users

```sql
CREATE TABLE admin_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_users (
    user_id     UUID PRIMARY KEY REFERENCES users(id),
    role_id     UUID NOT NULL REFERENCES admin_roles(id),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 10.2 Sample Permissions Structure

```json
{
  "super_admin": {
    "users": ["read", "write", "delete", "manage_roles"],
    "listings": ["read", "write", "delete", "approve", "reject"],
    "breeders": ["read", "write", "delete", "approve", "reject"],
    "payments": ["read", "refund"],
    "reports": ["read", "resolve", "escalate"],
    "config": ["read", "write"],
    "audit": ["read"]
  },
  "moderator": {
    "users": ["read"],
    "listings": ["read", "approve", "reject"],
    "breeders": ["read"],
    "reports": ["read", "resolve"]
  }
}
```

---

## 11. Implementation Checklist

### 11.1 Backend

- [ ] Admin authentication (separate from user auth)
- [ ] Role-based access control middleware
- [ ] Dashboard metrics endpoints
- [ ] Listing moderation queue + actions
- [ ] Breeder approval queue + actions
- [ ] Report handling system
- [ ] Audit logging service
- [ ] User management (suspend/ban/warn)
- [ ] Blacklist service
- [ ] Rate limiting middleware
- [ ] Spam detection service

### 11.2 Admin Panel (Frontend)

- [ ] Dashboard with real-time metrics
- [ ] Listing moderation queue
- [ ] Breeder application review
- [ ] Report management
- [ ] User management
- [ ] Audit log viewer
- [ ] Configuration panel
- [ ] Role management

### 11.3 Automation

- [ ] Auto-moderation based on spam score
- [ ] SLA breach alerts
- [ ] Suspension expiry cron job
- [ ] Report escalation automation

---

*This document completes the admin and safety system design. All 9 agent deliverables are now complete.*
