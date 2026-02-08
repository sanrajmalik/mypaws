namespace Mypaws.Domain.Entities;

public class City : BaseEntity
{
    public Guid StateId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    
    // SEO metadata
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    
    // Geo data
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    
    // Stats (denormalized)
    public int AdoptionCount { get; set; } = 0;
    public int BreederCount { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    
    // Navigation
    public State State { get; set; } = null!;
    public ICollection<AdoptionListing> AdoptionListings { get; set; } = new List<AdoptionListing>();
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<BreederProfile> BreederProfiles { get; set; } = new List<BreederProfile>();
}
