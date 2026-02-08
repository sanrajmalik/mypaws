namespace Mypaws.Domain.Entities;

public class AdoptionListing : BaseEntity
{
    // References
    public Guid PetId { get; set; }
    public Guid UserId { get; set; }
    
    // SEO slug
    public string Slug { get; set; } = string.Empty;
    
    // Listing details
    public string Title { get; set; } = string.Empty;
    public decimal? AdoptionFee { get; set; }
    public string[]? FeeIncludes { get; set; }
    
    // Requirements
    public string? AdopterRequirements { get; set; }
    public bool HomeCheckRequired { get; set; } = false;
    
    // Status
    public string Status { get; set; } = "draft";
    public string? RejectionReason { get; set; }
    
    // Moderation
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }
    
    // Visibility
    public bool IsFeatured { get; set; } = false;
    public DateTime? FeaturedUntil { get; set; }
    
    // Stats
    public int ViewCount { get; set; } = 0;
    public int InquiryCount { get; set; } = 0;
    
    // Payment tracking
    public bool IsPaid { get; set; } = false;
    public Guid? PaymentId { get; set; }
    
    // Dates
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? AdoptedAt { get; set; }
    
    // Navigation
    public Pet Pet { get; set; } = null!;
    public User User { get; set; } = null!;
}
