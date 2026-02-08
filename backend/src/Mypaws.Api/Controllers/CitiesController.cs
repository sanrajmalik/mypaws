using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.DTOs.Public;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/public/cities")]
public class CitiesController : ControllerBase
{
    private readonly MypawsDbContext _db;

    public CitiesController(MypawsDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// List cities with optional search
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<CityListDto>>> GetAll(
        [FromQuery] string? state = null,
        [FromQuery] bool? featured = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 500)
    {
        // Allow limit=0 to mean "all", otherwise clamp to reasonable range
        var effectiveLimit = limit == 0 ? int.MaxValue : Math.Clamp(limit, 1, 500);
        page = Math.Max(1, page);

        var query = _db.Cities
            .Include(c => c.State)
            .Where(c => c.IsActive);

        // Filters
        if (!string.IsNullOrEmpty(state))
        {
            query = query.Where(c => c.State.Slug == state);
        }

        if (featured == true)
        {
            query = query.Where(c => c.IsFeatured);
        }

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(searchLower));
        }

        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)effectiveLimit);

        var cities = await query
            .OrderByDescending(c => c.IsFeatured)
            .ThenByDescending(c => c.AdoptionCount + c.BreederCount)
            .ThenBy(c => c.Name)
            .Skip((page - 1) * effectiveLimit)
            .Take(effectiveLimit)
            .Select(c => new CityListDto(
                c.Id,
                c.Name,
                c.Slug,
                c.State.Name,
                c.AdoptionCount,
                c.BreederCount,
                c.IsFeatured
            ))
            .ToListAsync();

        return Ok(new PaginatedResult<CityListDto>(
            cities,
            new PaginationInfo(page, effectiveLimit, totalItems, totalPages)
        ));
    }

    /// <summary>
    /// Get city by slug
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<ActionResult<CityDetailDto>> GetBySlug(string slug)
    {
        var city = await _db.Cities
            .Include(c => c.State)
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive);

        if (city == null)
        {
            return NotFound(new { error = "city_not_found", error_description = "City not found" });
        }

        var result = new CityDetailDto(
            city.Id,
            city.Name,
            city.Slug,
            new StateDto(
                city.State.Id,
                city.State.Name,
                city.State.Slug,
                city.State.StateCode
            ),
            city.Latitude,
            city.Longitude,
            city.AdoptionCount,
            city.BreederCount,
            new SeoMetadata(
                city.MetaTitle ?? $"Adopt Pets in {city.Name} | mypaws",
                city.MetaDescription ?? $"Find dogs and cats for adoption in {city.Name}, {city.State.Name}. Browse verified listings from local pet owners.",
                $"https://mypaws.in/adopt-a-pet?city={city.Slug}"
            )
        );

        return Ok(result);
    }
}
