# Credit System & Direct Payments Design

**Status:** Deferred
**Date:** 2026-02-08

## Overview
Currently, the system requires a `ListingId` to be present when initiating a payment. This prevents users from navigating directly to the `/pricing` page and purchasing a plan "for later use" (Credits).
This document outlines the changes required to support purchasing listing credits that can be applied to listings created at a later time.

## Database Changes

### `ListingUsage` Entity
- **Change**: Make `ListingId` nullable.
- **Reason**: A `ListingUsage` record represents the *right* to use a listing slot. If bought directly, it won't be assigned to a specific listing yet.

```csharp
public class ListingUsage : BaseEntity
{
    // ... existing fields
    
    // Make nullable
    public Guid? ListingId { get; set; } 
    
    // Add Status enum/const if not present
    // Status: "Available", "Active", "Expired"
}
```

### Migration
- Run `dotnet ef migrations add AllowNullableListingIdInUsage`
- Run `dotnet ef database update`

## Backend Implementation

### `PaymentsController`

#### `InitiatePayment`
- Allow `request.ListingId` to be null or empty.
- If null, skip the "Free Tier" check for *specific* listing eligibility (since we don't know the listing yet), but still check if they are buying a "Free" tier (which shouldn't be allowed as a credit, only valid for immediate use).

#### `VerifyPayment`
- When creating `ListingUsage`:
  - If `payment.ListingId` is null, set `ListingUsage.ListingId = null` and `Status = "Available"`.
  - Do *not* activate any `AdoptionListing` or `BreederListing` (since none is linked).

### `BreederService` / `AdoptionController` (Listing Creation)

#### Logic Update
When a user creates a new listing (or submits a draft):
1. **Check for Credits**: Query `ListingUsage` for records where:
   - `UserId == currentUser`
   - `ListingType == type` (Breeder/Adoption)
   - `ListingId == null`
   - `Status == "Available"`
2. **Apply Credit**:
   - If a credit is found, assign the new `ListingId` to that `ListingUsage`.
   - Update `ListingUsage.Status = "Active"`.
   - Set `Listing.Status = "Active"` (and apply any tier benefits like Featured).
3. **No Credit**:
   - If no credit found, proceed with existing logic (Check limit -> `Active` or `PendingPayment`).

## Frontend Considerations

### `PricingPage`
- Handle cases where `listingId` query param is missing.
- Verification flow is effectively the same, just passing null listingId.

### Dashboard
- Show "Available Credits" somewhere in the UI? (Optional but good UX).
- When clicking "Create Listing", maybe show "You have 1 Premium Credit available".

## Edge Cases to Handle
- **Refunds**: If a user cancels a listing, does the credit become available again? (Business decision).
- **Expirations**: Credits should probably valid for X days even if not applied.