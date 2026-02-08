using System.ComponentModel.DataAnnotations.Schema;

namespace Mypaws.Domain.Entities;

public class ListingUsage : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // Listing reference
    public string ListingType { get; set; } = string.Empty;  // adoption, breeder
    public Guid ListingId { get; set; }

    // Tier info
    public string PricingTier { get; set; } = string.Empty;  // free, standard, premium
    public bool IsFreeTier { get; set; }

    // Payment (if paid)
    public Guid? PaymentId { get; set; }
    public Payment? Payment { get; set; }

    // Validity period
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }

    // Status
    public string Status { get; set; } = "active";
    /* active, expired, cancelled, refunded */

    // Extensions/renewals
    public Guid? RenewedFromId { get; set; }
    public ListingUsage? RenewedFrom { get; set; }
}
