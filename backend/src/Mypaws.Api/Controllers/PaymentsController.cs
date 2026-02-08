using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.DTOs.Payment;
using Mypaws.Application.Interfaces;
using Mypaws.Domain.Entities;
using Mypaws.Infrastructure.Persistence;
using System.Security.Claims;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentGatewayService _paymentGateway;
    private readonly MypawsDbContext _context;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPaymentGatewayService paymentGateway,
        MypawsDbContext context,
        ILogger<PaymentsController> logger)
    {
        _paymentGateway = paymentGateway;
        _context = context;
        _logger = logger;
    }

    [HttpPost("initiate")]
    public async Task<ActionResult<PaymentResponse>> InitiatePayment([FromBody] InitiatePaymentRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

        // 1. Determine Amount based on Tier
        decimal amount = 0;
        string currency = "INR";
        
        // Simple pricing logic (Can be moved to a service/config)
        // Adoption: Free (0), Standard (199), Featured (399)
        // Breeder: Free (0), Standard (499), Premium (999)

        if (request.ListingType == "adoption")
        {
            if (request.PricingTier == "standard") amount = 199;
            else if (request.PricingTier == "featured") amount = 399;
        }
        else if (request.ListingType == "breeder")
        {
            if (request.PricingTier == "standard") amount = 499;
            else if (request.PricingTier == "premium") amount = 999;
            else if (request.PricingTier == "bulk_5") amount = 1999;
        }

        // If Free tier
        if (request.PricingTier == "free" || amount == 0)
        {
             // Check if eligible for free tier
             bool hasActiveListing = false;

             if (request.ListingType == "breeder")
             {
                 var profile = await _context.BreederProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                 if (profile != null)
                 {
                     hasActiveListing = await _context.BreederListings.AnyAsync(l => l.BreederProfileId == profile.Id && l.Status == "Active");
                 }
             }
             else if (request.ListingType == "adoption")
             {
                 hasActiveListing = await _context.AdoptionListings.AnyAsync(l => l.UserId == userId && l.Status == "Active");
             }

             if (hasActiveListing)
             {
                 return BadRequest(new { message = "You have already used your free listing slot. Please upgrade to a paid plan." });
             }
             
             // Double check ListingUsages for good measure
             var hasFreeUsage = await _context.ListingUsages
                 .AnyAsync(u => u.UserId == userId && u.ListingType == request.ListingType && u.IsFreeTier && u.Status == "Active");

             if (hasFreeUsage)
             {
                 return BadRequest(new { message = "You have already used your free listing slot. Please upgrade to a paid plan." });
             }

             // If valid, just activate immediately (No Razorpay order needed)
             // In a real app, we might still create a zero-amount generic payment record or just skip to usage creation.
             // For now, let's return a special response indicating no payment needed
             return Ok(new PaymentResponse 
             { 
                 Amount = 0, 
                 Status = "free_activation",
                 PaymentId = "free_" + Guid.NewGuid() 
             });
        }

        // 2. Create Payment Record (Pending)
        var payment = new Payment
        {
            UserId = userId,
            Amount = amount,
            Subtotal = Math.Round(amount / 1.18m, 2), // Removing 18% GST (Back calculation)
            TaxAmount = amount - Math.Round(amount / 1.18m, 2),
            Currency = currency,
            PaymentType = "listing_fee",
            ListingType = request.ListingType,
            ListingId = request.ListingId,
            PricingTier = request.PricingTier,
            Status = "pending"
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        // 3. Create Razorpay Order
        var receipt = $"rcpt_{payment.Id.ToString().Substring(0, 8)}";
        var notes = new Dictionary<string, string>
        {
            { "payment_id", payment.Id.ToString() },
            { "listing_id", request.ListingId.ToString() }
        };

        try 
        {
            var order = await _paymentGateway.CreateOrderAsync(amount, currency, receipt, notes);
            
            // 4. Update Payment with Order ID
            payment.GatewayOrderId = order.OrderId;
            await _context.SaveChangesAsync();

            return Ok(new PaymentResponse
            {
                PaymentId = payment.Id.ToString(),
                OrderId = order.OrderId,
                KeyId = order.KeyId,
                Amount = amount,
                Currency = currency
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create Razorpay order");
            payment.Status = "failed";
            payment.FailureReason = ex.Message;
            await _context.SaveChangesAsync();
            return StatusCode(500, new { message = "Failed to initiate payment" });
        }
    }

    [HttpPost("verify")]
    public async Task<ActionResult<PaymentResponse>> VerifyPayment([FromBody] VerifyPaymentRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.GatewayOrderId == request.RazorpayOrderId);

        if (payment == null) return NotFound(new { message = "Payment record not found" });

        if (payment.Status == "completed") return Ok(new { success = true, message = "Payment already verified" });

        // 1. Verify Signature
        var isValid = _paymentGateway.VerifySignature(
            request.RazorpayOrderId, 
            request.RazorpayPaymentId, 
            request.RazorpaySignature);

        if (!isValid)
        {
            payment.Status = "failed";
            payment.FailureReason = "Signature mismatch";
            await _context.SaveChangesAsync();
            return BadRequest(new { message = "Payment verification failed" });
        }

        // 2. Update Payment Status
        payment.Status = "completed";
        payment.GatewayPaymentId = request.RazorpayPaymentId;
        payment.GatewaySignature = request.RazorpaySignature;
        payment.PaidAt = DateTime.UtcNow;
        
        // 3. Create/Update Listing Usage
        var usage = new ListingUsage
        {
            UserId = userId,
            ListingType = payment.ListingType!,
            ListingId = payment.ListingId!.Value,
            PricingTier = payment.PricingTier,
            IsFreeTier = false,
            PaymentId = payment.Id,
            ValidFrom = DateTime.UtcNow,
            ValidUntil = DateTime.UtcNow.AddDays(90), // 90 days validity
            Status = "Active"
        };
        
        _context.ListingUsages.Add(usage);
        
        // 4. Activate the actual listing (Adoption / Breeder)
        // 4. Activate the actual listing (Adoption / Breeder)
        if (payment.ListingType == "breeder")
        {
            var listing = await _context.BreederListings.FindAsync(payment.ListingId);
            if (listing != null) 
            {
                listing.Status = "Active";
                
                // Tier Logic
                if (payment.PricingTier == "premium" || payment.PricingTier == "bulk_5")
                {
                    listing.IsFeatured = true;
                    // Featured for 30 days
                    listing.FeaturedUntil = DateTime.UtcNow.AddDays(30);
                }

                // Verify Breeder Profile if creating a paid listing
                var profile = await _context.BreederProfiles.FindAsync(listing.BreederProfileId);
                if (profile != null && !profile.IsVerified)
                {
                     // Verify if paying for standard or above (anything not free)
                     if (payment.PricingTier != "free")
                     {
                         profile.IsVerified = true;
                         profile.VerifiedAt = DateTime.UtcNow;
                         profile.VerificationBadge = "Trusted"; 
                     }
                }
            }
        }
        else if (payment.ListingType == "adoption")
        {
            var listing = await _context.AdoptionListings.FindAsync(payment.ListingId);
            if (listing != null) 
            {
                listing.Status = "Active";
                
                if (payment.PricingTier == "featured")
                {
                    listing.IsFeatured = true;
                    listing.FeaturedUntil = DateTime.UtcNow.AddDays(30);
                }
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpGet("me")]
    public async Task<ActionResult<IEnumerable<PaymentResponseExtension>>> GetMyPayments()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

        var payments = await _context.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(payments.Select(p => new PaymentResponseExtension
        {
            PaymentId = p.Id.ToString(),
            OrderId = p.GatewayOrderId,
            Amount = p.Amount,
            Currency = p.Currency,
            Status = p.Status,
            ListingType = p.ListingType, // Assuming extension has this or we need to add to DTO
            PricingTier = p.PricingTier, 
            CreatedAt = p.CreatedAt
        }));
    }
}

// Add properties to PaymentResponse
public class PaymentResponseExtension : PaymentResponse 
{ 
    public string Status { get; set; } = "created"; 
    public string? ListingType { get; set; }
    public string? PricingTier { get; set; }
    public DateTime CreatedAt { get; set; }
}
