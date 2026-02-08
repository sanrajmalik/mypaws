namespace Mypaws.Application.DTOs.Public;

// Pet Types
public record PetTypeDto(
    Guid Id,
    string Name,
    string Slug,
    string PluralName,
    string? IconUrl
);

// Breeds
public record BreedListDto(
    Guid Id,
    string Name,
    string Slug,
    string PetType,
    string? SizeCategory,
    string? ImageUrl,
    int AdoptionCount,
    int BreederCount,
    bool IsPopular
);

public record BreedDetailDto(
    Guid Id,
    string Name,
    string Slug,
    PetTypeDto PetType,
    string? OriginCountry,
    string? SizeCategory,
    int? LifeExpectancyMin,
    int? LifeExpectancyMax,
    string? Description,
    string? ImageUrl,
    int AdoptionCount,
    int BreederCount,
    SeoMetadata Seo
);

// Cities
public record CityListDto(
    Guid Id,
    string Name,
    string Slug,
    string State,
    int AdoptionCount,
    int BreederCount,
    bool IsFeatured
);

public record CityDetailDto(
    Guid Id,
    string Name,
    string Slug,
    StateDto State,
    decimal? Latitude,
    decimal? Longitude,
    int AdoptionCount,
    int BreederCount,
    SeoMetadata Seo
);

public record StateDto(
    Guid Id,
    string Name,
    string Slug,
    string? StateCode
);

// SEO
public record SeoMetadata(
    string Title,
    string Description,
    string CanonicalUrl
);

// Pagination
public record PaginatedResult<T>(
    IEnumerable<T> Data,
    PaginationInfo Pagination
);

public record PaginationInfo(
    int Page,
    int Limit,
    int TotalItems,
    int TotalPages
);
