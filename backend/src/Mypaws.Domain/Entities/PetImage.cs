namespace Mypaws.Domain.Entities;

public class PetImage : BaseEntity
{
    public Guid PetId { get; set; }
    
    // Image URLs (different sizes)
    public string OriginalUrl { get; set; } = string.Empty;
    public string LargeUrl { get; set; } = string.Empty;
    public string ThumbUrl { get; set; } = string.Empty;
    public string? BlurHash { get; set; }
    
    // Metadata
    public string? AltText { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public long? FileSize { get; set; }
    
    // Status
    public bool IsPrimary { get; set; } = false;
    public string Status { get; set; } = "pending";     // pending, approved, rejected
    public int DisplayOrder { get; set; } = 0;
    
    // Navigation
    public Pet Pet { get; set; } = null!;
}
