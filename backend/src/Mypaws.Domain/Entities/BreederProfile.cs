using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mypaws.Domain.Entities;

public class BreederProfile : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? KennelName { get; set; }

    public string? Description { get; set; }
    public int YearsExperience { get; set; }

    // Contact (Public)
    [MaxLength(20)]
    public string? BusinessPhone { get; set; }

    [MaxLength(255)]
    public string? BusinessEmail { get; set; }

    public string? WebsiteUrl { get; set; }

    // Location
    [Required]
    public Guid CityId { get; set; }

    [ForeignKey("CityId")]
    public virtual City City { get; set; } = null!;

    public string Address { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    // Specialization
    public List<Guid> BreedIds { get; set; } = new();

    // Media
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public List<string> GalleryUrls { get; set; } = new();

    // Social
    public string? InstagramUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? YoutubeUrl { get; set; }

    // Verification & Trust
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerificationBadge { get; set; } // Basic, Trusted, Premium

    // Stats (Denormalized)
    public int ViewCount { get; set; }
    public int ActiveListingsCount { get; set; }
    public int TotalSalesCount { get; set; }
    public decimal AvgRating { get; set; }
    public int ReviewCount { get; set; }

    public virtual ICollection<BreederListing> Listings { get; set; } = new List<BreederListing>();
}
