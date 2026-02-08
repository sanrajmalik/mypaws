namespace Mypaws.Application.DTOs.Adoption;

// List view (card)
public record AdoptionListingCardDto(
    Guid Id,
    string Slug,
    string Title,
    PetSummaryDto Pet,
    CityShortDto City,
    decimal? AdoptionFee,
    bool IsFeatured,
    DateTime PublishedAt
);

public record PetSummaryDto(
    Guid Id,
    string Name,
    BreedShortDto? Breed,
    PetTypeShortDto PetType,
    string Gender,
    string AgeDisplay,
    PetImageDto? PrimaryImage
);

public record BreedShortDto(
    Guid Id,
    string Name,
    string Slug
);

public record PetTypeShortDto(
    string Slug,
    string Name
);

public record CityShortDto(
    string Name,
    string Slug
);

public record PetImageDto(
    string ThumbUrl,
    string? AltText
);

// Detail view
public record AdoptionListingDetailDto(
    Guid Id,
    string Slug,
    string Title,
    PetDetailDto Pet,
    CityDetailShortDto City,
    decimal? AdoptionFee,
    string[]? FeeIncludes,
    string? AdopterRequirements,
    bool HomeCheckRequired,
    OwnerPublicDto Owner,
    DateTime PublishedAt,
    int ViewCount,
    SeoDto Seo
);

public record PetDetailDto(
    Guid Id,
    string Name,
    BreedDetailShortDto? Breed,
    PetTypeShortDto PetType,
    string Gender,
    string AgeDisplay,
    string? Color,
    bool? IsNeutered,
    bool? IsVaccinated,
    TemperamentDto? Temperament,
    string[]? FunFacts,
    string? Description,
    PetImageDetailDto[] Images,
    PetFaqDto[] Faqs
);

public record BreedDetailShortDto(
    string Name,
    string Slug,
    string? SizeCategory
);

public record CityDetailShortDto(
    string Name,
    string Slug,
    string State
);

public record TemperamentDto(
    bool? GoodWithKids,
    bool? GoodWithDogs,
    bool? GoodWithCats,
    string? EnergyLevel,
    string? TrainingLevel,
    string[]? Traits
);

public record PetImageDetailDto(
    string LargeUrl,
    string ThumbUrl,
    string? AltText
);

public record PetFaqDto(
    string Question,
    string Answer
);

public record OwnerPublicDto(
    string DisplayName,
    string? AvatarUrl,
    OwnerContactDto? ContactInfo  // null for anonymous
);

public record OwnerContactDto(
    string Phone,
    bool WhatsAppEnabled,
    string? Email,
    string PreferredContact
);

public record SeoDto(
    string Title,
    string Description,
    string CanonicalUrl
);

// Create/Update
public record CreateAdoptionListingRequest(
    CreatePetRequest Pet,
    Guid CityId,
    string Title,
    decimal? AdoptionFee,
    string[]? FeeIncludes,
    string? AdopterRequirements,
    bool HomeCheckRequired,
    CreatePetFaqRequest[]? Faqs,
    bool SubmitForReview
);

public record CreatePetRequest(
    string Name,
    Guid PetTypeId,
    Guid? BreedId,
    string Gender,
    DateTime? DateOfBirth,
    int? AgeYears,
    int? AgeMonths,
    string? Color,
    string? SizeCategory,
    bool? IsNeutered,
    bool? IsVaccinated,
    string? VaccinationDetails,
    TemperamentDto? Temperament,
    string[]? FunFacts,
    string? RescueStory,
    string? Description,
    string[]? Images
);

public record CreatePetFaqRequest(
    string Question,
    string Answer
);

public record CreateListingResponse(
    Guid Id,
    Guid PetId,
    string Status,
    string Slug,
    DateTime CreatedAt
);
