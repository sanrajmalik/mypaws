using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.DTOs.Adoption;
using Mypaws.Application.DTOs.Public;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/public/adoption-listings")]
public class PublicAdoptionController : ControllerBase
{
    private readonly MypawsDbContext _db;

    public PublicAdoptionController(MypawsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// List adoption listings with filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<AdoptionListingCardDto>>> GetAll(
        [FromQuery] string? city = null,
        [FromQuery] string? breed = null,
        [FromQuery] string? petType = null,
        [FromQuery] string? gender = null,
        [FromQuery] int? ageMin = null,
        [FromQuery] int? ageMax = null,
        [FromQuery] string? size = null,
        [FromQuery] string sort = "recent",
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        limit = Math.Clamp(limit, 1, 50);
        page = Math.Max(1, page);

        var query = _db.AdoptionListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.PetType)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
            .Include(l => l.Pet)
                .ThenInclude(p => p.City)
            .Where(l => (l.Status == "active" || l.Status == "Active") && l.DeletedAt == null);

        // Filters
        if (!string.IsNullOrEmpty(city))
        {
            query = query.Where(l => l.Pet.City.Slug == city);
        }

        if (!string.IsNullOrEmpty(breed))
        {
            query = query.Where(l => l.Pet.Breed != null && l.Pet.Breed.Slug == breed);
        }

        if (!string.IsNullOrEmpty(petType))
        {
            query = query.Where(l => l.Pet.PetType.Slug == petType);
        }

        if (!string.IsNullOrEmpty(gender))
        {
            query = query.Where(l => l.Pet.Gender == gender);
        }

        if (!string.IsNullOrEmpty(size))
        {
            query = query.Where(l => l.Pet.SizeCategory == size);
        }

        // Age filter (in months)
        if (ageMin.HasValue || ageMax.HasValue)
        {
            query = query.Where(l => 
                (l.Pet.AgeYears * 12 + (l.Pet.AgeMonths ?? 0)) >= (ageMin ?? 0) &&
                (l.Pet.AgeYears * 12 + (l.Pet.AgeMonths ?? 0)) <= (ageMax ?? 999)
            );
        }

        // Sorting
        query = sort switch
        {
            "popular" => query.OrderByDescending(l => l.ViewCount),
            _ => query.OrderByDescending(l => l.PublishedAt)
        };

        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

        var listings = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(l => new AdoptionListingCardDto(
                l.Id,
                l.Slug,
                l.Title,
                new PetSummaryDto(
                    l.Pet.Id,
                    l.Pet.Name,
                    l.Pet.Breed == null ? null : new BreedShortDto(
                        l.Pet.Breed.Id,
                        l.Pet.Breed.Name,
                        l.Pet.Breed.Slug
                    ),
                    new PetTypeShortDto(l.Pet.PetType.Slug, l.Pet.PetType.Name),
                    l.Pet.Gender,
                    FormatAge(l.Pet.AgeYears, l.Pet.AgeMonths),
                    l.Pet.Images.Where(i => i.IsPrimary).Select(i => new PetImageDto(
                        i.ThumbUrl,
                        i.AltText
                    )).FirstOrDefault()
                ),
                new CityShortDto(l.Pet.City.Name, l.Pet.City.Slug),
                l.AdoptionFee,
                l.IsFeatured,
                l.PublishedAt ?? l.CreatedAt
            ))
            .ToListAsync();

        return Ok(new PaginatedResult<AdoptionListingCardDto>(
            listings,
            new PaginationInfo(page, limit, totalItems, totalPages)
        ));
    }

    /// <summary>
    /// Get single adoption listing by slug (public view)
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<AdoptionListingDetailDto>> GetBySlug(string slug)
    {
        var listing = await _db.AdoptionListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.PetType)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Faqs)
            .Include(l => l.Pet)
                .ThenInclude(p => p.City)
                    .ThenInclude(c => c.State)
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Slug == slug && (l.Status == "active" || l.Status == "Active") && l.DeletedAt == null);

        if (listing == null)
        {
            return NotFound(new { error = "listing_not_found", error_description = "Listing not found" });
        }

        // Increment view count
        listing.ViewCount++;
        await _db.SaveChangesAsync();

        var pet = listing.Pet;
        var result = new AdoptionListingDetailDto(
            listing.Id,
            listing.Slug,
            listing.Title,
            new PetDetailDto(
                pet.Id,
                pet.Name,
                pet.Breed == null ? null : new BreedDetailShortDto(
                    pet.Breed.Name,
                    pet.Breed.Slug,
                    pet.Breed.SizeCategory
                ),
                new PetTypeShortDto(pet.PetType.Slug, pet.PetType.Name),
                pet.Gender,
                FormatAge(pet.AgeYears, pet.AgeMonths),
                pet.Color,
                pet.IsNeutered,
                pet.IsVaccinated,
                pet.Temperament != null ? System.Text.Json.JsonSerializer.Deserialize<TemperamentDto>(pet.Temperament) : null,
                pet.FunFacts,
                pet.Description,
                pet.Images.OrderBy(i => i.DisplayOrder).Select(i => new PetImageDetailDto(
                    i.LargeUrl,
                    i.ThumbUrl,
                    i.AltText
                )).ToArray(),
                pet.Faqs.Where(f => f.IsActive).OrderBy(f => f.DisplayOrder).Select(f => new PetFaqDto(
                    f.Question,
                    f.Answer
                )).ToArray()
            ),
            new CityDetailShortDto(
                pet.City.Name,
                pet.City.Slug,
                pet.City.State.Name
            ),
            listing.AdoptionFee,
            listing.FeeIncludes,
            listing.AdopterRequirements,
            listing.HomeCheckRequired,
            new OwnerPublicDto(
                listing.User.Name ?? "Pet Owner",
                listing.User.AvatarUrl,
                null  // Contact info hidden for public view
            ),
            listing.PublishedAt ?? listing.CreatedAt,
            listing.ViewCount,
            new SeoDto(
                $"Adopt {pet.Name} - {pet.Breed?.Name ?? "Pet"} in {pet.City.Name} | mypaws",
                $"{pet.Name} is a {FormatAge(pet.AgeYears, pet.AgeMonths)} old {pet.Gender} {pet.Breed?.Name ?? pet.PetType.Name} available for adoption in {pet.City.Name}.",
                $"https://mypaws.in/adopt-a-pet/{listing.Slug}"
            )
        );

        return Ok(result);
    }

    private static string FormatAge(int? years, int? months)
    {
        if (years == null && months == null) return "Unknown";
        if (years == null || years == 0) return $"{months ?? 0} months";
        if (months == null || months == 0) return $"{years} year{(years > 1 ? "s" : "")}";
        return $"{years} year{(years > 1 ? "s" : "")} {months} month{(months > 1 ? "s" : "")}";
    }
}
