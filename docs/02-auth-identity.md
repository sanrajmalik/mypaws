# mypaws Authentication & Identity Design

> Agent 2 – Authentication & Identity Engineer  
> Deliverable: Complete auth flows, user states, schemas, API contracts, abuse prevention

---

## 1. Authentication Flow Overview

### 1.1 Login Methods

| Method | Purpose | Implementation |
|--------|---------|----------------|
| Google OAuth 2.0 | Primary login | OIDC flow via Google Identity |
| WhatsApp OTP | Verification (required) | Meta Cloud API |

**Design Decision**: Google OAuth for login, WhatsApp for verification (not login). This separates identity from contact verification.

---

## 2. Complete Auth Flow Diagrams

### 2.1 Google OAuth Login Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           GOOGLE OAUTH LOGIN FLOW                             │
└──────────────────────────────────────────────────────────────────────────────┘

     Browser                    Next.js                  .NET API              Google
        │                          │                         │                    │
        │──── Click Login ────────►│                         │                    │
        │                          │                         │                    │
        │◄───── Redirect ──────────│                         │                    │
        │                          │                         │                    │
        │──────────────────────────────────────────────────────────────────────►│
        │                          │                         │      Auth Page    │
        │                          │                         │                    │
        │◄──────────────────────────────────────────────────────────────────────│
        │                       auth_code                    │                    │
        │                          │                         │                    │
        │──── /auth/callback ─────►│                         │                    │
        │     (with code)          │                         │                    │
        │                          │── POST /api/auth/google ──►│                │
        │                          │   {code, redirect_uri}  │                    │
        │                          │                         │                    │
        │                          │                         │── Exchange Code ──►│
        │                          │                         │◄── ID Token ───────│
        │                          │                         │                    │
        │                          │                         │── Validate Token   │
        │                          │                         │── Upsert User      │
        │                          │                         │── Generate JWT     │
        │                          │                         │                    │
        │                          │◄─── {access_token, ─────│                    │
        │                          │      refresh_token,     │                    │
        │                          │      user_profile}      │                    │
        │                          │                         │                    │
        │◄─── Set httpOnly ────────│                         │                    │
        │     cookies              │                         │                    │
        │                          │                         │                    │
        │◄─── Redirect to ─────────│                         │                    │
        │     dashboard            │                         │                    │
```

### 2.2 WhatsApp Verification Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       WHATSAPP VERIFICATION FLOW                              │
└──────────────────────────────────────────────────────────────────────────────┘

     Browser                    Next.js                  .NET API           Meta WhatsApp
        │                          │                         │                    │
        │── Enter Phone Number ───►│                         │                    │
        │   (+91 9876543210)       │                         │                    │
        │                          │                         │                    │
        │                          │── POST /api/verify/     │                    │
        │                          │   whatsapp/send         │                    │
        │                          │   {phone: "+919..."}    │                    │
        │                          │                         │                    │
        │                          │                         │── Generate OTP     │
        │                          │                         │   (6-digit)        │
        │                          │                         │── Store in Redis   │
        │                          │                         │   (5 min TTL)      │
        │                          │                         │                    │
        │                          │                         │── Send Template ──►│
        │                          │                         │   Message          │
        │                          │                         │                    │
        │                          │◄─── {success, ──────────│◄─── Delivered ─────│
        │                          │      expires_in: 300}   │                    │
        │                          │                         │                    │
        │◄─── Show OTP Input ──────│                         │                    │
        │                          │                         │                    │
        │                                                    │                    │
        │   (User receives WhatsApp message with OTP)        │                    │
        │                                                    │                    │
        │── Enter OTP ────────────►│                         │                    │
        │   (123456)               │                         │                    │
        │                          │── POST /api/verify/     │                    │
        │                          │   whatsapp/confirm      │                    │
        │                          │   {phone, otp}          │                    │
        │                          │                         │                    │
        │                          │                         │── Validate OTP     │
        │                          │                         │   from Redis       │
        │                          │                         │── Mark Verified    │
        │                          │                         │── Delete OTP       │
        │                          │                         │── Issue New JWT    │
        │                          │                         │   (phone_verified) │
        │                          │                         │                    │
        │                          │◄─── {verified: true, ───│                    │
        │                          │      new_token}         │                    │
        │                          │                         │                    │
        │◄─── Refresh Cookies ─────│                         │                    │
        │◄─── Show Success ────────│                         │                    │
```

---

## 3. User State Transitions

### 3.1 State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER STATE MACHINE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   ANONYMOUS  │
                              │   (No auth)  │
                              └──────┬───────┘
                                     │
                              Google OAuth
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │      REGISTERED        │
                        │   (Email verified,     │
                        │    Phone unverified)   │
                        └───────────┬────────────┘
                                    │
                           WhatsApp OTP Verified
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │       VERIFIED         │
                        │   (Can create listings,│
                        │    contact users)      │
                        └───────────┬────────────┘
                                    │
                           Breeder Application
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │   BREEDER_PENDING      │
                        │   (Awaiting admin      │
                        │    approval)           │
                        └───────────┬────────────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   Approved                  Rejected
                        │                       │
                        ▼                       ▼
           ┌────────────────────┐    ┌────────────────────┐
           │  BREEDER_APPROVED  │    │  BREEDER_REJECTED  │
           │  (Full breeder     │    │  (Can reapply      │
           │   privileges)      │    │   after 30 days)   │
           └────────────────────┘    └────────────────────┘
```

### 3.2 State Transitions Table

| Current State | Action | New State | Side Effects |
|--------------|--------|-----------|--------------|
| Anonymous | Google login | Registered | Create user record |
| Registered | WhatsApp verify | Verified | Update phone_verified_at |
| Verified | Submit breeder app | BreederPending | Create breeder_applications record |
| BreederPending | Admin approve | BreederApproved | Create breeder_profiles record |
| BreederPending | Admin reject | BreederRejected | Store rejection reason |
| BreederRejected | Reapply (30d+) | BreederPending | New application record |
| Any | Admin suspend | Suspended | Set suspended_at, reason |
| Suspended | Admin unsuspend | Previous state | Clear suspended_at |

---

## 4. Database Schema

### 4.1 Users Table

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    email_verified  BOOLEAN NOT NULL DEFAULT true,  -- Google ensures this
    
    -- Phone verification
    phone           VARCHAR(20),                     -- E.164 format: +919876543210
    phone_verified  BOOLEAN NOT NULL DEFAULT false,
    phone_verified_at TIMESTAMPTZ,
    
    -- Profile
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    
    -- Google OAuth
    google_id       VARCHAR(255) UNIQUE,
    
    -- State
    status          VARCHAR(20) NOT NULL DEFAULT 'registered',
                    -- registered, verified, breeder_pending, 
                    -- breeder_approved, breeder_rejected, suspended
    suspended_at    TIMESTAMPTZ,
    suspension_reason TEXT,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ,
    
    -- Soft delete
    deleted_at      TIMESTAMPTZ,
    
    CONSTRAINT chk_phone_format CHECK (phone ~ '^\+[1-9]\d{6,14}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
```

### 4.2 User Sessions Table

```sql
CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- Token info (hashed)
    refresh_token_hash VARCHAR(64) NOT NULL,
    
    -- Device info
    user_agent      TEXT,
    ip_address      INET,
    device_id       VARCHAR(100),
    
    -- Validity
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at) WHERE revoked_at IS NULL;
```

### 4.3 Verification Attempts Table (Audit & Rate Limiting)

```sql
CREATE TABLE verification_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    phone           VARCHAR(20) NOT NULL,
    
    -- Attempt info
    attempt_type    VARCHAR(20) NOT NULL,  -- send_otp, verify_otp
    status          VARCHAR(20) NOT NULL,  -- pending, success, failed, expired
    
    -- OTP (stored temporarily, cleared on verify)
    otp_hash        VARCHAR(64),
    expires_at      TIMESTAMPTZ,
    
    -- Metadata
    ip_address      INET,
    user_agent      TEXT,
    failure_reason  TEXT,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verification_phone ON verification_attempts(phone);
CREATE INDEX idx_verification_user_id ON verification_attempts(user_id);
CREATE INDEX idx_verification_created ON verification_attempts(created_at);
```

### 4.4 Breeder Applications Table

```sql
CREATE TABLE breeder_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- Application data
    business_name   VARCHAR(200) NOT NULL,
    kennel_name     VARCHAR(200),
    breeds_specialization TEXT[] NOT NULL,
    years_experience INTEGER NOT NULL,
    
    -- Location
    address         TEXT NOT NULL,
    city_id         UUID NOT NULL REFERENCES cities(id),
    pincode         VARCHAR(10) NOT NULL,
    
    -- Verification documents (S3 paths)
    id_proof_url    TEXT NOT NULL,
    address_proof_url TEXT NOT NULL,
    kennel_photos   TEXT[],
    
    -- Application state
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
                    -- pending, approved, rejected, withdrawn
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_breeder_apps_user ON breeder_applications(user_id);
CREATE INDEX idx_breeder_apps_status ON breeder_applications(status);
CREATE INDEX idx_breeder_apps_created ON breeder_applications(created_at);
```

---

## 5. API Contracts

### 5.1 Authentication Endpoints

#### POST /api/v1/auth/google

**Request:**
```json
{
  "code": "4/0AeaYSHA...",
  "redirect_uri": "https://mypaws.in/auth/callback"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "phone_verified": false,
    "status": "registered"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "invalid_grant",
  "error_description": "Authorization code has expired or is invalid"
}
```

---

#### POST /api/v1/auth/refresh

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

---

#### POST /api/v1/auth/logout

**Request (Authenticated):**
```json
{
  "all_devices": false
}
```

**Response (204 No Content)**

---

### 5.2 Verification Endpoints

#### POST /api/v1/verify/whatsapp/send

**Request (Authenticated):**
```json
{
  "phone": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "expires_in": 300,
  "attempts_remaining": 2,
  "cooldown_seconds": 0
}
```

**Error (429 Too Many Requests):**
```json
{
  "error": "rate_limit_exceeded",
  "error_description": "Too many verification attempts",
  "retry_after": 3600
}
```

---

#### POST /api/v1/verify/whatsapp/confirm

**Request (Authenticated):**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_verified": true,
    "status": "verified"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "error": "invalid_otp",
  "error_description": "OTP is invalid or expired",
  "attempts_remaining": 2
}
```

---

### 5.3 User Profile Endpoints

#### GET /api/v1/users/me

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://cdn.mypaws.in/users/.../avatar.jpg",
  "phone": "+919876543210",
  "phone_verified": true,
  "status": "verified",
  "created_at": "2024-02-06T12:00:00Z",
  "listing_counts": {
    "adoption": 1,
    "breeder": 0
  },
  "breeder_profile": null
}
```

---

### 5.4 JWT Token Structure

**Access Token Claims:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "phone_verified": true,
  "status": "verified",
  "roles": ["user"],
  "iat": 1707234567,
  "exp": 1707238167,
  "iss": "mypaws.in",
  "aud": "mypaws-api"
}
```

**Token Lifetimes:**
| Token Type | Lifetime | Storage |
|------------|----------|---------|
| Access Token | 1 hour | httpOnly cookie |
| Refresh Token | 30 days | httpOnly cookie + DB |

---

## 6. Abuse Prevention Measures

### 6.1 Rate Limiting

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `/auth/google` | 10 | 15 min | IP |
| `/verify/whatsapp/send` | 3 | 1 hour | Phone |
| `/verify/whatsapp/confirm` | 5 | 15 min | Phone |
| All authenticated | 1000 | 1 hour | User ID |
| All unauthenticated | 100 | 1 hour | IP |

### 6.2 OTP Security

```
┌─────────────────────────────────────────────────────────────────┐
│                     OTP SECURITY MEASURES                        │
└─────────────────────────────────────────────────────────────────┘

1. OTP Generation
   - 6-digit numeric
   - Cryptographically random
   - Stored as SHA-256 hash in Redis

2. OTP Validation
   - 3 max attempts per OTP
   - 5-minute expiry
   - Constant-time comparison
   - Auto-delete on success or max attempts

3. Phone Verification Limits
   - 3 OTP sends per phone per hour
   - 5 OTP sends per phone per day
   - 24-hour lockout after 10 failed verifications

4. Cross-Account Protection
   - Phone can only be linked to one account
   - Phone change requires re-verification
```

### 6.3 Session Security

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION SECURITY MEASURES                      │
└─────────────────────────────────────────────────────────────────┘

1. Token Storage
   - Access token: httpOnly, secure, sameSite=strict
   - Refresh token: httpOnly, secure, sameSite=strict
   - No localStorage/sessionStorage

2. Token Rotation
   - New refresh token on each refresh
   - Old refresh token invalidated

3. Session Management
   - Max 5 concurrent sessions per user
   - Oldest session auto-revoked on new login
   - "Logout all devices" functionality

4. Suspicious Activity Detection
   - Geo-impossibility checks
   - Device fingerprinting
   - Notify user of new device login
```

### 6.4 Account Protection

| Threat | Mitigation |
|--------|-----------|
| Credential stuffing | Google OAuth only (no passwords) |
| Session hijacking | httpOnly + secure + sameSite cookies |
| Phone spoofing | WhatsApp API verification (not SMS) |
| Fake accounts | WhatsApp verification required for actions |
| Account takeover | Multi-device login notifications |
| Enumeration | Generic error messages |

---

## 7. Error Handling

### 7.1 Standard Error Response

```json
{
  "error": "error_code",
  "error_description": "Human readable description",
  "details": {},
  "request_id": "req_abc123"
}
```

### 7.2 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `invalid_grant` | 401 | OAuth code invalid/expired |
| `invalid_token` | 401 | Access token invalid/expired |
| `token_revoked` | 401 | Token has been revoked |
| `insufficient_scope` | 403 | Missing required permission |
| `phone_required` | 403 | Phone verification needed |
| `account_suspended` | 403 | Account has been suspended |
| `rate_limit_exceeded` | 429 | Too many requests |
| `invalid_otp` | 400 | OTP invalid or expired |
| `phone_already_verified` | 409 | Phone linked to another account |

---

## 8. WhatsApp Template Message

### 8.1 OTP Template

**Template Name:** `mypaws_otp_verification`

**Language:** English (en)

**Format:**
```
Your mypaws verification code is: {{1}}

This code expires in 5 minutes. Do not share this code with anyone.

If you did not request this code, please ignore this message.
```

**Variables:**
- `{{1}}`: 6-digit OTP

---

## 9. Implementation Checklist

- [ ] Configure Google OAuth credentials in GCP Console
- [ ] Set up Meta WhatsApp Business API
- [ ] Create and approve WhatsApp message template
- [ ] Implement JWT signing with RS256 (asymmetric)
- [ ] Set up Redis for OTP and rate limiting
- [ ] Configure CORS for frontend domain
- [ ] Implement cookie settings for production domain
- [ ] Set up session cleanup background job
- [ ] Create database migrations
- [ ] Write integration tests for auth flows

---

*This document defines authentication and identity verification. User roles and permissions for specific features are covered in subsequent agent deliverables.*
