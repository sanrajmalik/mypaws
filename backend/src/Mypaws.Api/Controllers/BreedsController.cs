using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.DTOs.Public;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/public/breeds")]
public class BreedsController : ControllerBase
{
    private readonly MypawsDbContext _db;

    public BreedsController(MypawsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// List breeds with optional filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<BreedListDto>>> GetAll(
        [FromQuery] string? petType = null,
        [FromQuery] Guid? petTypeId = null,
        [FromQuery] string? size = null,
        [FromQuery] bool? popular = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 500)
    {
        // Allow limit=0 to mean "all", otherwise clamp to reasonable range
        var effectiveLimit = limit == 0 ? int.MaxValue : Math.Clamp(limit, 1, 500);
        page = Math.Max(1, page);

        var query = _db.Breeds
            .Include(b => b.PetType)
            .Where(b => b.IsActive);

        // Filters - support both slug and ID for pet type
        if (petTypeId.HasValue)
        {
            query = query.Where(b => b.PetTypeId == petTypeId.Value);
        }
        else if (!string.IsNullOrEmpty(petType))
        {
            query = query.Where(b => b.PetType.Slug == petType);
        }

        if (!string.IsNullOrEmpty(size))
        {
            query = query.Where(b => b.SizeCategory == size);
        }

        if (popular == true)
        {
            query = query.Where(b => b.IsPopular);
        }

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(b => b.Name.ToLower().Contains(searchLower));
        }

        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)effectiveLimit);

        var breeds = await query
            .OrderBy(b => b.DisplayOrder)
            .ThenBy(b => b.Name)
            .Skip((page - 1) * effectiveLimit)
            .Take(effectiveLimit)
            .Select(b => new BreedListDto(
                b.Id,
                b.Name,
                b.Slug,
                b.PetType.Name,
                b.SizeCategory,
                b.ImageUrl,
                b.AdoptionCount,
                b.BreederCount,
                b.IsPopular
            ))
            .ToListAsync();

        return Ok(new PaginatedResult<BreedListDto>(
            breeds,
            new PaginationInfo(page, effectiveLimit, totalItems, totalPages)
        ));
    }

    /// <summary>
    /// Get breed by slug
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<BreedDetailDto>> GetBySlug(string slug)
    {
        var breed = await _db.Breeds
            .Include(b => b.PetType)
            .FirstOrDefaultAsync(b => b.Slug == slug && b.IsActive);

        if (breed == null)
        {
            return NotFound(new { error = "breed_not_found", error_description = "Breed not found" });
        }

        var result = new BreedDetailDto(
            breed.Id,
            breed.Name,
            breed.Slug,
            new PetTypeDto(
                breed.PetType.Id,
                breed.PetType.Name,
                breed.PetType.Slug,
                breed.PetType.PluralName,
                breed.PetType.IconUrl
            ),
            breed.OriginCountry,
            breed.SizeCategory,
            breed.LifeExpectancyMin,
            breed.LifeExpectancyMax,
            breed.Description,
            breed.ImageUrl,
            breed.AdoptionCount,
            breed.BreederCount,
            new SeoMetadata(
                breed.MetaTitle ?? $"{breed.Name} - Dog Breed Information | mypaws",
                breed.MetaDescription ?? $"Learn about {breed.Name} breed. Find {breed.Name} puppies for adoption or from verified breeders in India.",
                $"https://mypaws.in/breeds/{breed.PetType.Slug}s/{breed.Slug}"
            )
        );

        return Ok(result);
    }
}
