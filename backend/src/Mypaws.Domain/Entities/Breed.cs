namespace Mypaws.Domain.Entities;

public class Breed : BaseEntity
{
    public Guid PetTypeId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    
    // Breed info
    public string? OriginCountry { get; set; }
    public string? SizeCategory { get; set; }       // small, medium, large, giant
    public int? LifeExpectancyMin { get; set; }
    public int? LifeExpectancyMax { get; set; }
    
    // SEO
    public string? Description { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    
    // Media
    public string? ImageUrl { get; set; }
    
    // Stats (denormalized)
    public int AdoptionCount { get; set; } = 0;
    public int BreederCount { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    public bool IsPopular { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    
    // Navigation
    public PetType PetType { get; set; } = null!;
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}
