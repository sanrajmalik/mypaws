using System.ComponentModel.DataAnnotations.Schema;

namespace Mypaws.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // Gateway info
    public string Gateway { get; set; } = "razorpay";
    public string? GatewayOrderId { get; set; }        // Razorpay order_id
    public string? GatewayPaymentId { get; set; }      // Razorpay payment_id
    public string? GatewaySignature { get; set; }      // For verification

    // Amount
    [Column(TypeName = "decimal(10, 2)")]
    public decimal Amount { get; set; }
    
    public string Currency { get; set; } = "INR";

    // Tax (GST for India)
    [Column(TypeName = "decimal(10, 2)")]
    public decimal Subtotal { get; set; }
    
    [Column(TypeName = "decimal(5, 2)")]
    public decimal TaxRate { get; set; } = 18.00m;  // 18% GST
    
    [Column(TypeName = "decimal(10, 2)")]
    public decimal TaxAmount { get; set; }

    // Purpose
    public string PaymentType { get; set; } = string.Empty;
    /* listing_fee, featured_boost, subscription, bulk_purchase */

    public string? ListingType { get; set; }          // adoption, breeder
    public Guid? ListingId { get; set; }                 // Reference to listing

    // Pricing tier selected
    public string PricingTier { get; set; } = string.Empty; // free, standard, premium, bulk_5

    // Status
    public string Status { get; set; } = "pending";
    /* pending, processing, completed, failed, refunded, disputed, expired */

    public string? FailureCode { get; set; }
    public string? FailureReason { get; set; }

    // Receipt
    public string? ReceiptNumber { get; set; }   // MYPAWS-2024-00001
    public string? InvoiceUrl { get; set; }                 // S3 path to invoice PDF

    // Metadata
    [Column(TypeName = "jsonb")]
    public string? Metadata { get; set; }
    /*
    {
      "ip_address": "...",
      "user_agent": "...",
      "utm_source": "...",
      "coupon_code": "..."
    }
    */

    // Refund info
    public string? RefundId { get; set; }
    
    [Column(TypeName = "decimal(10, 2)")]
    public decimal? RefundAmount { get; set; }
    
    public string? RefundReason { get; set; }
    public DateTime? RefundedAt { get; set; }

    // Timestamps
    public DateTime? PaidAt { get; set; }
    public DateTime? ExpiresAt { get; set; }          // For pending payments
}
