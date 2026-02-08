# mypaws Payment & Monetization System

> Agent 8 – Monetization & Payments Engineer  
> Deliverable: Payment flow, listing usage tracking, database schema, failure & refund handling

---

## 1. Payment Strategy Overview

### 1.1 Revenue Streams

| Stream | Type | Model |
|--------|------|-------|
| Adoption Listings | One-time | Free tier (1) + Paid per listing |
| Breeder Listings | One-time | Free tier (1) + Paid per listing |
| Featured Listings | Add-on | Paid upgrade for extra visibility |
| Subscription (Future) | Recurring | Premium breeder plans |

### 1.2 Payment Gateway

| Market | Gateway | Reason |
|--------|---------|--------|
| India (Primary) | Razorpay | UPI, cards, wallets, bank transfers |
| International (Future) | Stripe | Global cards, PayPal |

---

## 2. Pricing Structure

### 2.1 Adoption Listings

| Tier | Price (INR) | Duration | Features |
|------|-------------|----------|----------|
| Free | ₹0 | 90 days | 1 per user, standard visibility |
| Standard | ₹199 | 90 days | Additional listing, standard visibility |
| Featured | ₹399 | 90 days | Featured badge, higher search rank |

### 2.2 Breeder Listings

| Tier | Price (INR) | Duration | Features |
|------|-------------|----------|----------|
| Free | ₹0 | 90 days | 1 per breeder, standard visibility |
| Standard | ₹499 | 90 days | Additional listing |
| Premium | ₹999 | 90 days | Featured, priority support, analytics |
| Bulk (5) | ₹1,999 | 90 days each | 20% discount on 5 listings |

### 2.3 Featured Boost (Add-on)

| Duration | Price (INR) | Effect |
|----------|-------------|--------|
| 7 days | ₹149 | Top of search, homepage featured |
| 14 days | ₹249 | Top of search, homepage featured |
| 30 days | ₹399 | Top of search, homepage featured |

---

## 3. Payment Flow

### 3.1 Listing Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LISTING PAYMENT FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

     Browser                    Next.js                  .NET API              Razorpay
        │                          │                         │                    │
        │── Click "Publish" ──────►│                         │                    │
        │   (free tier used)       │                         │                    │
        │                          │── Check tier usage ────►│                    │
        │                          │◄── "payment_required" ──│                    │
        │                          │                         │                    │
        │◄── Show Payment Modal ───│                         │                    │
        │    (Select tier)         │                         │                    │
        │                          │                         │                    │
        │── Select Standard ──────►│                         │                    │
        │   (₹499)                 │                         │                    │
        │                          │── POST /payments/ ─────►│                    │
        │                          │   initiate              │                    │
        │                          │                         │                    │
        │                          │                         │── Create Order ───►│
        │                          │                         │◄── order_id ───────│
        │                          │                         │                    │
        │                          │◄── {order_id, key} ─────│                    │
        │                          │                         │                    │
        │◄── Open Razorpay ────────│                         │                    │
        │    Checkout              │                         │                    │
        │                          │                         │                    │
        │────────────────── User completes payment ──────────────────────────────►│
        │                          │                         │                    │
        │◄─── Success callback ────│                         │                    │
        │    (payment_id, sig)     │                         │                    │
        │                          │                         │                    │
        │── POST /payments/ ──────►│                         │                    │
        │   verify {payment_id,    │── Verify signature ────►│                    │
        │   order_id, signature}   │                         │                    │
        │                          │                         │── Verify ─────────►│
        │                          │                         │◄── Valid ──────────│
        │                          │                         │                    │
        │                          │                         │── Update payment   │
        │                          │                         │   status           │
        │                          │                         │── Activate listing │
        │                          │                         │── Create usage     │
        │                          │                         │   record           │
        │                          │                         │                    │
        │                          │◄── {success, listing} ──│                    │
        │                          │                         │                    │
        │◄── Redirect to listing ──│                         │                    │
```

### 3.2 Webhook Flow (Async Confirmation)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           WEBHOOK FLOW                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

  Razorpay                         .NET API                    Database
      │                               │                            │
      │── POST /webhooks/razorpay ───►│                            │
      │   {event: "payment.captured"} │                            │
      │                               │                            │
      │                               │── Verify webhook sig       │
      │                               │                            │
      │                               │── Find payment by ─────────►
      │                               │   order_id                 │
      │                               │◄──────────────────────────│
      │                               │                            │
      │                               │── Update status ───────────►
      │                               │   to "completed"           │
      │                               │                            │
      │                               │── Activate listing ────────►
      │                               │   (if not already)         │
      │                               │                            │
      │                               │── Send confirmation ───────►
      │                               │   email                    │
      │                               │                            │
      │◄── 200 OK ────────────────────│                            │
```

---

## 4. Database Schema

### 4.1 Payments Table (Extended)

```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- Gateway info
    gateway         VARCHAR(20) NOT NULL DEFAULT 'razorpay',
    gateway_order_id VARCHAR(100),        -- Razorpay order_id
    gateway_payment_id VARCHAR(100),      -- Razorpay payment_id
    gateway_signature VARCHAR(255),       -- For verification
    
    -- Amount
    amount          DECIMAL(10, 2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Tax (GST for India)
    subtotal        DECIMAL(10, 2) NOT NULL,
    tax_rate        DECIMAL(5, 2) NOT NULL DEFAULT 18.00,  -- 18% GST
    tax_amount      DECIMAL(10, 2) NOT NULL,
    
    -- Purpose
    payment_type    VARCHAR(50) NOT NULL,
    /* listing_fee, featured_boost, subscription, bulk_purchase */
    
    listing_type    VARCHAR(20),          -- adoption, breeder
    listing_id      UUID,                 -- Reference to listing
    
    -- Pricing tier selected
    pricing_tier    VARCHAR(50) NOT NULL, -- free, standard, premium, bulk_5
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    /* pending, processing, completed, failed, refunded, disputed, expired */
    
    failure_code    VARCHAR(50),
    failure_reason  TEXT,
    
    -- Receipt
    receipt_number  VARCHAR(50) UNIQUE,   -- MYPAWS-2024-00001
    invoice_url     TEXT,                 -- S3 path to invoice PDF
    
    -- Metadata
    metadata        JSONB,
    /*
    {
      "ip_address": "...",
      "user_agent": "...",
      "utm_source": "...",
      "coupon_code": "..."
    }
    */
    
    -- Refund info
    refund_id       VARCHAR(100),
    refund_amount   DECIMAL(10, 2),
    refund_reason   TEXT,
    refunded_at     TIMESTAMPTZ,
    
    -- Timestamps
    paid_at         TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,          -- For pending payments
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_gateway_order ON payments(gateway_order_id);
CREATE INDEX idx_payments_gateway_payment ON payments(gateway_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_listing ON payments(listing_type, listing_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
```

### 4.2 Listing Usage Table (Extended)

```sql
CREATE TABLE listing_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- Listing reference
    listing_type    VARCHAR(20) NOT NULL,  -- adoption, breeder
    listing_id      UUID NOT NULL,
    
    -- Tier info
    pricing_tier    VARCHAR(50) NOT NULL,  -- free, standard, premium
    is_free_tier    BOOLEAN NOT NULL,
    
    -- Payment (if paid)
    payment_id      UUID REFERENCES payments(id),
    
    -- Validity period
    valid_from      TIMESTAMPTZ NOT NULL,
    valid_until     TIMESTAMPTZ NOT NULL,
    
    -- Status
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    /* active, expired, cancelled, refunded */
    
    -- Extensions/renewals
    renewed_from    UUID REFERENCES listing_usage(id),
    
    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listing_usage_user ON listing_usage(user_id);
CREATE INDEX idx_listing_usage_listing ON listing_usage(listing_type, listing_id);
CREATE INDEX idx_listing_usage_status ON listing_usage(status);

-- Unique constraint: only one free tier per user per listing type
CREATE UNIQUE INDEX idx_listing_usage_free_tier 
    ON listing_usage(user_id, listing_type) 
    WHERE is_free_tier = true AND status = 'active';
```

### 4.3 Coupons Table

```sql
CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    
    -- Discount
    discount_type   VARCHAR(20) NOT NULL,  -- percentage, fixed
    discount_value  DECIMAL(10, 2) NOT NULL,
    max_discount    DECIMAL(10, 2),        -- Cap for percentage discounts
    
    -- Applicability
    applies_to      VARCHAR(50)[],         -- ['adoption', 'breeder', 'featured']
    min_order_amount DECIMAL(10, 2),
    
    -- Limits
    total_uses      INTEGER,               -- NULL = unlimited
    uses_per_user   INTEGER DEFAULT 1,
    current_uses    INTEGER NOT NULL DEFAULT 0,
    
    -- Validity
    valid_from      TIMESTAMPTZ NOT NULL,
    valid_until     TIMESTAMPTZ NOT NULL,
    
    -- Status
    is_active       BOOLEAN NOT NULL DEFAULT true,
    
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_from, valid_until);
```

---

## 5. API Endpoints

### 5.1 Payment Initiation

#### POST /api/v1/payments/initiate

**Request:**
```json
{
  "payment_type": "listing_fee",
  "listing_type": "breeder",
  "listing_id": "bl000001-...",
  "pricing_tier": "standard",
  "coupon_code": "LAUNCH20"
}
```

**Response (200 OK):**
```json
{
  "payment_id": "pay000001-...",
  "gateway": "razorpay",
  "order_id": "order_JHG7D3faJH2342",
  "key_id": "rzp_live_xxx",
  "amount": 41916,           // Amount in paise (₹419.16)
  "currency": "INR",
  "breakdown": {
    "subtotal": 499.00,
    "discount": {
      "code": "LAUNCH20",
      "amount": 99.80
    },
    "taxable_amount": 399.20,
    "tax_rate": 18,
    "tax_amount": 71.86,
    "total": 419.16
  },
  "prefill": {
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "+919876543210"
  },
  "notes": {
    "listing_id": "bl000001-...",
    "listing_type": "breeder"
  },
  "expires_at": "2024-02-06T12:30:00Z"
}
```

---

### 5.2 Payment Verification

#### POST /api/v1/payments/verify

**Request:**
```json
{
  "razorpay_order_id": "order_JHG7D3faJH2342",
  "razorpay_payment_id": "pay_JHG7D3faJH2343",
  "razorpay_signature": "xxx"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "payment_id": "pay000001-...",
  "status": "completed",
  "receipt_number": "MYPAWS-2024-00001",
  "listing": {
    "id": "bl000001-...",
    "status": "active",
    "valid_until": "2024-05-06T12:00:00Z"
  }
}
```

**Response (400 Bad Request) - Verification Failed:**
```json
{
  "success": false,
  "error": "signature_mismatch",
  "error_description": "Payment verification failed. Please contact support if amount was deducted."
}
```

---

### 5.3 Payment Status

#### GET /api/v1/payments/{id}

**Response (200 OK):**
```json
{
  "id": "pay000001-...",
  "status": "completed",
  "amount": 419.16,
  "currency": "INR",
  "payment_type": "listing_fee",
  "listing_type": "breeder",
  "listing_id": "bl000001-...",
  "pricing_tier": "standard",
  "receipt_number": "MYPAWS-2024-00001",
  "invoice_url": "https://cdn.mypaws.in/invoices/pay000001.pdf",
  "paid_at": "2024-02-06T12:05:00Z",
  "created_at": "2024-02-06T12:00:00Z"
}
```

---

### 5.4 User Payment History

#### GET /api/v1/users/me/payments

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "pay000001-...",
      "amount": 419.16,
      "status": "completed",
      "payment_type": "listing_fee",
      "receipt_number": "MYPAWS-2024-00001",
      "paid_at": "2024-02-06T12:05:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "total_spent": 419.16,
    "total_payments": 1
  }
}
```

---

### 5.5 Coupon Validation

#### POST /api/v1/coupons/validate

**Request:**
```json
{
  "code": "LAUNCH20",
  "listing_type": "breeder",
  "pricing_tier": "standard"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "coupon": {
    "code": "LAUNCH20",
    "discount_type": "percentage",
    "discount_value": 20,
    "max_discount": 200
  },
  "discount_amount": 99.80,
  "message": "20% off applied!"
}
```

**Response (400 Bad Request):**
```json
{
  "valid": false,
  "error": "coupon_expired",
  "error_description": "This coupon has expired"
}
```

---

## 6. Failure & Refund Handling

### 6.1 Payment Failure Scenarios

| Scenario | Status | Action |
|----------|--------|--------|
| Card declined | `failed` | Show retry option |
| Bank timeout | `pending` | Wait for webhook, show pending state |
| Signature mismatch | `failed` | Log for investigation, show support contact |
| Duplicate payment | `failed` | Auto-refund, notify user |
| Order expired | `expired` | Create new order |

### 6.2 Failure Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT FAILURE HANDLING                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

                              Payment Failed
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            User-recoverable   Gateway error   System error
                    │               │               │
                    ▼               ▼               ▼
             ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
             │ Show retry  │ │ Show "try   │ │ Log error   │
             │ with card   │ │ again later"│ │ Notify dev  │
             │ error msg   │ │ message     │ │ Show support│
             └─────────────┘ └─────────────┘ └─────────────┘
```

### 6.3 Refund Policy

| Condition | Refund | Timeline |
|-----------|--------|----------|
| Listing not published (draft) | Full refund | Within 24 hours |
| Technical issue on our side | Full refund | Immediate |
| Listing rejected by admin | Full refund | Within 48 hours |
| User request (< 24h, 0 views) | Full refund | Within 5 days |
| User request (> 24h or viewed) | No refund | N/A |
| Duplicate payment | Full refund | Automatic |

### 6.4 Refund Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REFUND FLOW                                            │
└─────────────────────────────────────────────────────────────────────────────────┘

     Admin/System                .NET API                 Razorpay
          │                          │                        │
          │── Initiate refund ──────►│                        │
          │   {payment_id, reason}   │                        │
          │                          │                        │
          │                          │── Check eligibility    │
          │                          │                        │
          │                          │── POST refunds ────────►
          │                          │   /payments/{id}/refund│
          │                          │◄── refund_id ──────────│
          │                          │                        │
          │                          │── Update payment       │
          │                          │   (status=refunded)    │
          │                          │                        │
          │                          │── Deactivate listing   │
          │                          │                        │
          │                          │── Send email to user   │
          │                          │                        │
          │◄── Refund initiated ─────│                        │
```

### 6.5 Refund API

#### POST /api/v1/admin/payments/{id}/refund

**Request:**
```json
{
  "reason": "listing_rejected",
  "notes": "Content violated community guidelines"
}
```

**Response (200 OK):**
```json
{
  "refund_id": "rfnd_JHG7D3faJH2344",
  "payment_id": "pay000001-...",
  "amount": 419.16,
  "status": "processed",
  "estimated_arrival": "5-7 business days"
}
```

---

## 7. Invoice Generation

### 7.1 Invoice Data

```json
{
  "invoice_number": "MYPAWS-2024-00001",
  "invoice_date": "2024-02-06",
  "seller": {
    "name": "Mypaws Technologies Pvt Ltd",
    "address": "...",
    "gstin": "27AABCM1234A1ZM"
  },
  "buyer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  },
  "items": [
    {
      "description": "Breeder Listing - Standard (90 days)",
      "hsn_code": "998314",
      "quantity": 1,
      "unit_price": 499.00,
      "discount": 99.80,
      "taxable_value": 399.20,
      "cgst": 35.93,
      "sgst": 35.93,
      "total": 471.06
    }
  ],
  "payment": {
    "method": "Razorpay",
    "transaction_id": "pay_JHG7D3faJH2343",
    "date": "2024-02-06T12:05:00Z"
  }
}
```

### 7.2 Invoice Storage

- Generate PDF on payment completion
- Store in S3: `invoices/{year}/{month}/{invoice_number}.pdf`
- Make available via signed URL in user dashboard
- Retain for 7 years (tax compliance)

---

## 8. Listing Usage Tracking

### 8.1 Free Tier Check Logic

```python
def check_free_tier_available(user_id: str, listing_type: str) -> bool:
    """
    Check if user can use free tier for this listing type.
    Returns True if:
    - User has never used free tier for this type, OR
    - Previous free listing expired/cancelled > 180 days ago
    """
    existing = db.query("""
        SELECT * FROM listing_usage
        WHERE user_id = :user_id
        AND listing_type = :listing_type
        AND is_free_tier = true
        AND status = 'active'
    """, user_id=user_id, listing_type=listing_type)
    
    if not existing:
        return True
    
    return False


def use_free_tier(user_id: str, listing_type: str, listing_id: str) -> None:
    """Create free tier usage record."""
    db.execute("""
        INSERT INTO listing_usage 
        (user_id, listing_type, listing_id, pricing_tier, is_free_tier, 
         valid_from, valid_until, status)
        VALUES 
        (:user_id, :listing_type, :listing_id, 'free', true,
         NOW(), NOW() + INTERVAL '90 days', 'active')
    """, ...)
```

### 8.2 Listing Expiry Job

```python
# Background job: runs daily at midnight

def expire_listings():
    """Mark expired listings and notify users."""
    
    # Find listings expiring today
    expiring = db.query("""
        SELECT lu.*, al.id as adoption_id, bl.id as breeder_id
        FROM listing_usage lu
        LEFT JOIN adoption_listings al ON lu.listing_id = al.id
        LEFT JOIN breeder_listings bl ON lu.listing_id = bl.id
        WHERE lu.valid_until::date = CURRENT_DATE
        AND lu.status = 'active'
    """)
    
    for usage in expiring:
        # Update usage status
        db.execute("""
            UPDATE listing_usage SET status = 'expired' WHERE id = :id
        """, id=usage.id)
        
        # Update listing status
        if usage.listing_type == 'adoption':
            db.execute("""
                UPDATE adoption_listings SET status = 'expired' WHERE id = :id
            """, id=usage.adoption_id)
        else:
            db.execute("""
                UPDATE breeder_listings SET status = 'expired' WHERE id = :id
            """, id=usage.breeder_id)
        
        # Send notification
        notify_user(usage.user_id, "listing_expired", {...})
```

---

## 9. Razorpay Integration

### 9.1 Configuration

```csharp
// appsettings.json
{
  "Razorpay": {
    "KeyId": "rzp_live_xxx",
    "KeySecret": "xxx",
    "WebhookSecret": "xxx",
    "Currency": "INR"
  }
}
```

### 9.2 Service Implementation

```csharp
public class RazorpayService : IPaymentGatewayService
{
    private readonly RazorpayClient _client;
    
    public async Task<CreateOrderResult> CreateOrder(CreateOrderRequest request)
    {
        var options = new Dictionary<string, object>
        {
            { "amount", request.AmountInPaise },
            { "currency", "INR" },
            { "receipt", request.ReceiptId },
            { "notes", new Dictionary<string, string>
                {
                    { "listing_id", request.ListingId },
                    { "listing_type", request.ListingType }
                }
            }
        };
        
        var order = _client.Order.Create(options);
        
        return new CreateOrderResult
        {
            OrderId = order["id"].ToString(),
            AmountInPaise = (int)order["amount"]
        };
    }
    
    public bool VerifySignature(string orderId, string paymentId, string signature)
    {
        var payload = orderId + "|" + paymentId;
        var expectedSignature = ComputeHmacSha256(payload, _keySecret);
        return CryptographicEquals(signature, expectedSignature);
    }
}
```

### 9.3 Webhook Handler

```csharp
[HttpPost("webhooks/razorpay")]
public async Task<IActionResult> HandleWebhook()
{
    var payload = await new StreamReader(Request.Body).ReadToEndAsync();
    var signature = Request.Headers["X-Razorpay-Signature"];
    
    if (!_razorpayService.VerifyWebhookSignature(payload, signature))
    {
        return Unauthorized();
    }
    
    var webhookEvent = JsonSerializer.Deserialize<RazorpayWebhook>(payload);
    
    switch (webhookEvent.Event)
    {
        case "payment.captured":
            await HandlePaymentCaptured(webhookEvent.Payload);
            break;
        case "payment.failed":
            await HandlePaymentFailed(webhookEvent.Payload);
            break;
        case "refund.created":
            await HandleRefundCreated(webhookEvent.Payload);
            break;
    }
    
    return Ok();
}
```

---

## 10. Implementation Checklist

### 10.1 Backend

- [ ] Razorpay SDK integration
- [ ] Order creation endpoint
- [ ] Payment verification endpoint
- [ ] Webhook handler with signature verification
- [ ] Refund initiation endpoint
- [ ] Invoice PDF generation
- [ ] Coupon validation service
- [ ] Listing usage tracking
- [ ] Expiry background job (Hangfire)
- [ ] Email notifications for payment events

### 10.2 Database

- [ ] Payments table migration
- [ ] Listing usage table migration
- [ ] Coupons table migration
- [ ] Indexes for payment lookups

### 10.3 Frontend

- [ ] Razorpay checkout integration
- [ ] Payment modal component
- [ ] Payment status page
- [ ] Invoice download
- [ ] Payment history in dashboard

### 10.4 Testing

- [ ] Razorpay test mode integration
- [ ] Webhook testing with ngrok
- [ ] Refund flow testing
- [ ] Coupon application testing
- [ ] Expiry job testing

---

*This document defines the payment and monetization system. Admin tools for payment management are covered in the next agent deliverable.*
