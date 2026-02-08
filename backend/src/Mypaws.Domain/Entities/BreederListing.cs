using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mypaws.Domain.Entities;

public class BreederListing : BaseEntity
{
    [Required]
    public Guid BreederProfileId { get; set; }

    [ForeignKey("BreederProfileId")]
    public virtual BreederProfile BreederProfile { get; set; } = null!;

    [Required]
    public Guid PetId { get; set; }

    [ForeignKey("PetId")]
    public virtual Pet Pet { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Slug { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public bool PriceNegotiable { get; set; }

    public int AvailableCount { get; set; } = 1;
    public DateTime? ExpectedDate { get; set; } // For upcoming litters

    public List<string> Includes { get; set; } = new(); // Vaccination, KCI, etc.

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, PendingReview, Active, Sold, Expired, Rejected

    public string? RejectionReason { get; set; }

    // Visibility
    public bool IsFeatured { get; set; }
    public DateTime? FeaturedUntil { get; set; }

    // Stats
    public int ViewCount { get; set; }
    public int InquiryCount { get; set; }

    // Dates
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? SoldAt { get; set; }
}
