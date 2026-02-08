namespace Mypaws.Application.DTOs.Payment;

public class InitiatePaymentRequest
{
    public string PaymentType { get; set; } = string.Empty; // listing_fee, featured_boost
    public string ListingType { get; set; } = string.Empty; // adoption, breeder
    public Guid ListingId { get; set; }
    public string PricingTier { get; set; } = string.Empty; // standard, premium
    public string? CouponCode { get; set; }
}

public class VerifyPaymentRequest
{
    public string RazorpayOrderId { get; set; } = string.Empty;
    public string RazorpayPaymentId { get; set; } = string.Empty;
    public string RazorpaySignature { get; set; } = string.Empty;
}

public class PaymentResponse
{
    public string Status { get; set; } = "created";
    public string PaymentId { get; set; } = string.Empty;
    public string Gateway { get; set; } = "razorpay";
    public string OrderId { get; set; } = string.Empty;
    public string KeyId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public PaymentBreakdown? Breakdown { get; set; }
    public Dictionary<string, string>? Notes { get; set; }
}

public class PaymentBreakdown
{
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
}
