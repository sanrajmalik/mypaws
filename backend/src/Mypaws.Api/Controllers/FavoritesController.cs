using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.DTOs.Adoption;
using Mypaws.Application.DTOs.Public; 
using Mypaws.Application.Services;
using Mypaws.Domain.Entities;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/favorites")]
public class FavoritesController : ControllerBase
{
    private readonly MypawsDbContext _db;
    private readonly IAuthService _authService;

    public FavoritesController(MypawsDbContext db, IAuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    /// <summary>
    /// List user's favorite listings
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<AdoptionListingCardDto>>> GetFavorites()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var favorites = await _db.Favorites
            .Include(f => f.AdoptionListing)
                .ThenInclude(l => l.Pet)
                    .ThenInclude(p => p.PetType)
            .Include(f => f.AdoptionListing)
                .ThenInclude(l => l.Pet)
                    .ThenInclude(p => p.Breed)
            .Include(f => f.AdoptionListing)
                .ThenInclude(l => l.Pet)
                    .ThenInclude(p => p.Images)
            .Include(f => f.AdoptionListing)
                .ThenInclude(l => l.Pet)
                    .ThenInclude(p => p.City)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.AdoptionListing)
            .ToListAsync();

        var dtos = favorites.Select(l => new AdoptionListingCardDto(
            l.Id,
            l.Slug,
            l.Title,
            new PetSummaryDto(
                l.Pet.Id,
                l.Pet.Name,
                l.Pet.Breed == null ? null : new BreedShortDto(l.Pet.Breed.Id, l.Pet.Breed.Name, l.Pet.Breed.Slug),
                new PetTypeShortDto(l.Pet.PetType.Slug, l.Pet.PetType.Name),
                l.Pet.Gender,
                FormatAge(l.Pet.AgeYears, l.Pet.AgeMonths),
                l.Pet.Images.Where(i => i.IsPrimary).Select(i => new PetImageDto(i.ThumbUrl, i.AltText)).FirstOrDefault()
            ),
            new CityShortDto(l.Pet.City.Name, l.Pet.City.Slug),
            l.AdoptionFee,
            l.IsFeatured,
            l.PublishedAt ?? l.CreatedAt
        )).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Add listing to favorites
    /// </summary>
    [HttpPost("{listingId:guid}")]
    public async Task<ActionResult> AddFavorite(Guid listingId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var exists = await _db.Favorites
            .AnyAsync(f => f.UserId == userId && f.AdoptionListingId == listingId);

        if (exists) return Ok();

        var favorite = new Favorite
        {
            Id = Guid.NewGuid(),
            UserId = userId.Value,
            AdoptionListingId = listingId
        };

        _db.Favorites.Add(favorite);
        await _db.SaveChangesAsync();

        return Ok();
    }

    /// <summary>
    /// Remove listing from favorites
    /// </summary>
    [HttpDelete("{listingId:guid}")]
    public async Task<ActionResult> RemoveFavorite(Guid listingId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var favorite = await _db.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.AdoptionListingId == listingId);

        if (favorite != null)
        {
            _db.Favorites.Remove(favorite);
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    // Helper - validates JWT and extracts user ID
    private Guid? GetCurrentUserId()
    {
        var token = Request.Cookies["mypaws_access_token"] 
            ?? Request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "");
        
        if (string.IsNullOrEmpty(token)) return null;
        
        var principal = _authService.ValidateToken(token);
        if (principal == null) return null;
        
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static string FormatAge(int? years, int? months)
    {
        if (years == null && months == null) return "Unknown";
        if (years == null || years == 0) return $"{months ?? 0} months";
        if (months == null || months == 0) return $"{years} year{(years > 1 ? "s" : "")}";
        return $"{years} year{(years > 1 ? "s" : "")} {months} month{(months > 1 ? "s" : "")}";
    }
}
