using System.ComponentModel.DataAnnotations;

namespace Mypaws.Application.DTOs.Breeder;

// Application DTOs
public class CreateBreederApplicationDto
{
    [Required]
    [MaxLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    public string? KennelName { get; set; }
    public int YearsExperience { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    // Contact
    [Required]
    public string BusinessPhone { get; set; } = string.Empty;

    [EmailAddress]
    public string? BusinessEmail { get; set; }

    [Url]
    public string? WebsiteUrl { get; set; }

    // Location
    [Required]
    public Guid CityId { get; set; }

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    public string Pincode { get; set; } = string.Empty;

    // Specialization
    public List<Guid> BreedIds { get; set; } = new();

    // Documents
    // Dictionary of document types to URLs
    public Dictionary<string, string> DocumentUrls { get; set; } = new();

    public bool AgreeToEthicalStandards { get; set; }
}

public class BreederApplicationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? KennelName { get; set; }
    public int YearsExperience { get; set; }
    public string Description { get; set; } = string.Empty;
    public string BusinessPhone { get; set; } = string.Empty;
    public string? BusinessEmail { get; set; }
    public string? WebsiteUrl { get; set; }
    public Guid CityId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public List<Guid> BreedIds { get; set; } = new();
    public Dictionary<string, string> DocumentUrls { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public string? ReviewNotes { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Profile DTOs
public class BreederProfileDto
{
    public Guid Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? KennelName { get; set; }
    public string? Description { get; set; }
    public int YearsExperience { get; set; }
    
    // Contact
    public string? BusinessPhone { get; set; } // Null if masked/not verified
    public string? BusinessEmail { get; set; }
    public string? WebsiteUrl { get; set; }
    
    // Location
    public Guid CityId { get; set; }
    public string CityName { get; set; } = string.Empty;
    public string StateName { get; set; } = string.Empty;
    
    // Media
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public List<string> GalleryUrls { get; set; } = new();
    
    // Trust
    public bool IsVerified { get; set; }
    public string? VerificationBadge { get; set; }
    
    // Stats
    public int ActiveListingsCount { get; set; }
    public int ViewCount { get; set; }
    public int TotalListingViews { get; set; }
    public decimal AvgRating { get; set; }
    public int ReviewCount { get; set; }
    
    // Breeds
    public List<BreedDto> Breeds { get; set; } = new(); 
}

public class BreedDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}

// Listing DTOs
public class CreateBreederListingDto
{
    // Option 1: Link existing pet (if already created)
    public Guid? PetId { get; set; }

    // Option 2: Create new pet on the fly
    public BreederCreatePetDto? NewPet { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public bool PriceNegotiable { get; set; }

    public int AvailableCount { get; set; } = 1;
    public DateTime? ExpectedDate { get; set; }

    public List<string> Includes { get; set; } = new();
}

public class BreederListingFilterDto
{
    public string? PetType { get; set; } // "Dog", "Cat"
    public Guid? BreedId { get; set; }
    public Guid? CityId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class BreederCreatePetDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public Guid PetTypeId { get; set; }
    public Guid? BreedId { get; set; }
    public string Gender { get; set; } = "male";
    public DateTime? DateOfBirth { get; set; }
    public int? AgeYears { get; set; }
    public int? AgeMonths { get; set; }
    public string? Color { get; set; }
    public string? SizeCategory { get; set; }
    public bool? IsNeutered { get; set; }
    public bool? IsVaccinated { get; set; }
    public string? VaccinationDetails { get; set; }
    public BreederPetTemperamentDto? Temperament { get; set; }
    public List<string>? FunFacts { get; set; }
    public string? RescueStory { get; set; }
    public string? Description { get; set; }
    public List<string>? Images { get; set; }
}

public class BreederPetTemperamentDto
{
    public bool? GoodWithKids { get; set; }
    public bool? GoodWithDogs { get; set; }
    public bool? GoodWithCats { get; set; }
    public string? EnergyLevel { get; set; }
    public string? TrainingLevel { get; set; }
    public List<string>? Traits { get; set; }
}

public class BreederListingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool PriceNegotiable { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Pet Info (Simplified)
    public Guid PetId { get; set; }
    public string PetName { get; set; } = string.Empty;
    public string BreedName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    
    // Extended Pet Details
    public string Gender { get; set; } = string.Empty;
    public string AgeDisplay { get; set; } = string.Empty; // e.g., "2 months"
    public string? Color { get; set; }
    public string? Description { get; set; }
    public List<string> Images { get; set; } = new();

    // Type
    public string PetType { get; set; } = "Dog";

    // Breeder Context
    public Guid BreederId { get; set; }
    public string BreederName { get; set; } = string.Empty; // Business Name
    public string CityName { get; set; } = string.Empty;
    public string StateName { get; set; } = string.Empty;
}

public class CreateBreederProfileDto
{
    public string BusinessName { get; set; } = string.Empty;
    public string? KennelName { get; set; }
    public string Description { get; set; } = string.Empty;
    public int YearsExperience { get; set; }
    public string BusinessPhone { get; set; } = string.Empty;
    public string? BusinessEmail { get; set; }
    public string? WebsiteUrl { get; set; }
    public Guid CityId { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public List<Guid> BreedIds { get; set; } = new();
    public Dictionary<string, string> DocumentUrls { get; set; } = new();
}

public class UpdateBreederProfileDto : CreateBreederProfileDto
{
    // Inherits everything for now, can be specific if needed
}

public class UpdateBreederListingDto : CreateBreederListingDto
{
    // Inherits everything for now
}
