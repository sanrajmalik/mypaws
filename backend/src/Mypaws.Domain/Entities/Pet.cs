namespace Mypaws.Domain.Entities;

public class Pet : BaseEntity
{
    // Classification
    public Guid PetTypeId { get; set; }
    public Guid? BreedId { get; set; }              // NULL for mixed/unknown
    public Guid CityId { get; set; }
    public Guid OwnerId { get; set; }
    
    // Basic info
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Gender { get; set; } = "male";    // male, female
    
    // Age
    public DateTime? DateOfBirth { get; set; }
    public int? AgeYears { get; set; }
    public int? AgeMonths { get; set; }
    
    // Physical
    public string? Color { get; set; }
    public string? SizeCategory { get; set; }       // small, medium, large
    public decimal? Weight { get; set; }            // in kg
    
    // Status
    public bool? IsNeutered { get; set; }
    public bool? IsVaccinated { get; set; }
    public string? VaccinationDetails { get; set; }
    
    // Temperament (JSON)
    public string? Temperament { get; set; }
    
    // Content
    public string[]? FunFacts { get; set; }
    public string? RescueStory { get; set; }
    public string? Description { get; set; }
    
    // Navigation
    public PetType PetType { get; set; } = null!;
    public Breed? Breed { get; set; }
    public City City { get; set; } = null!;
    public User Owner { get; set; } = null!;
    public ICollection<PetImage> Images { get; set; } = new List<PetImage>();
    public ICollection<PetFaq> Faqs { get; set; } = new List<PetFaq>();
    public AdoptionListing? AdoptionListing { get; set; }
}
