using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.DTOs.Adoption;
using Mypaws.Application.Services;
using Mypaws.Domain.Entities;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Api.Controllers;

/// <summary>
/// Protected adoption endpoints (require authentication)
/// </summary>
[ApiController]
[Route("api/v1/adoption-listings")]
public class AdoptionController : ControllerBase
{
    private readonly MypawsDbContext _db;
    private readonly IAuthService _authService;

    public AdoptionController(MypawsDbContext db, IAuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    /// <summary>
    /// Get a single listing for editing (owner only)
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }

        var listing = await _db.AdoptionListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.PetType)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Include(l => l.Pet)
                .ThenInclude(p => p.City)
                    .ThenInclude(c => c.State)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Faqs)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (listing == null)
        {
            return NotFound(new { error = "listing_not_found", error_description = "Listing not found" });
        }

        var pet = listing.Pet;
        
        // Parse temperament JSON
        Mypaws.Application.DTOs.Adoption.TemperamentDto? temperament = null;
        if (!string.IsNullOrEmpty(pet.Temperament))
        {
            try
            {
                temperament = System.Text.Json.JsonSerializer.Deserialize<Mypaws.Application.DTOs.Adoption.TemperamentDto>(pet.Temperament);
            }
            catch { }
        }

        return Ok(new
        {
            id = listing.Id,
            title = listing.Title,
            slug = listing.Slug,
            status = listing.Status,
            cityId = pet.CityId,
            city = new { pet.City.Id, pet.City.Name, pet.City.Slug, state = pet.City.State.Name },
            adoptionFee = listing.AdoptionFee,
            feeIncludes = listing.FeeIncludes,
            adopterRequirements = listing.AdopterRequirements,
            homeCheckRequired = listing.HomeCheckRequired,
            pet = new
            {
                id = pet.Id,
                name = pet.Name,
                petTypeId = pet.PetTypeId,
                petType = new { pet.PetType.Name, pet.PetType.Slug },
                breedId = pet.BreedId,
                breed = pet.Breed != null ? new { pet.Breed.Name, pet.Breed.Slug } : null,
                gender = pet.Gender,
                ageYears = pet.AgeYears,
                ageMonths = pet.AgeMonths,
                color = pet.Color,
                sizeCategory = pet.SizeCategory,
                isNeutered = pet.IsNeutered,
                isVaccinated = pet.IsVaccinated,
                vaccinationDetails = pet.VaccinationDetails,
                temperament = temperament,
                funFacts = pet.FunFacts,
                rescueStory = pet.RescueStory,
                description = pet.Description,
                images = pet.Images.OrderBy(i => i.DisplayOrder).Select(i => i.OriginalUrl).ToList(),
            },
            faqs = pet.Faqs?.OrderBy(f => f.DisplayOrder).Select(f => new
            {
                question = f.Question,
                answer = f.Answer
            }).ToList(),
            createdAt = listing.CreatedAt,
            updatedAt = listing.UpdatedAt,
        });
    }

    /// <summary>
    /// Create a new adoption listing
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateListingResponse>> Create([FromBody] CreateAdoptionListingRequest request)
    {
        // TODO: Get userId from JWT claims
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }

        // Validate pet type
        var petType = await _db.PetTypes.FindAsync(request.Pet.PetTypeId);
        if (petType == null)
        {
            return BadRequest(new { error = "invalid_pet_type", error_description = "Pet type not found" });
        }

        // Validate breed if provided
        Breed? breed = null;
        if (request.Pet.BreedId.HasValue)
        {
            breed = await _db.Breeds.FindAsync(request.Pet.BreedId.Value);
            if (breed == null || breed.PetTypeId != request.Pet.PetTypeId)
            {
                return BadRequest(new { error = "invalid_breed", error_description = "Breed not found or does not match pet type" });
            }
        }

        // Validate city
        var city = await _db.Cities.FindAsync(request.CityId);
        if (city == null)
        {
            return BadRequest(new { error = "invalid_city", error_description = "City not found" });
        }

        // Create pet
        var pet = new Pet
        {
            Id = Guid.NewGuid(),
            OwnerId = userId.Value,
            PetTypeId = request.Pet.PetTypeId,
            BreedId = request.Pet.BreedId,
            CityId = request.CityId,
            Name = request.Pet.Name,
            Slug = GenerateSlug(request.Pet.Name),
            Gender = request.Pet.Gender,
            DateOfBirth = request.Pet.DateOfBirth,
            AgeYears = request.Pet.AgeYears,
            AgeMonths = request.Pet.AgeMonths,
            Color = request.Pet.Color,
            SizeCategory = request.Pet.SizeCategory,
            IsNeutered = request.Pet.IsNeutered,
            IsVaccinated = request.Pet.IsVaccinated,
            VaccinationDetails = request.Pet.VaccinationDetails,
            Temperament = request.Pet.Temperament != null 
                ? System.Text.Json.JsonSerializer.Serialize(request.Pet.Temperament, new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase }) 
                : null,
            FunFacts = request.Pet.FunFacts,
            RescueStory = request.Pet.RescueStory,
            Description = request.Pet.Description
        };

        _db.Pets.Add(pet);

        // Create Images
        if (request.Pet.Images?.Any() == true)
        {
            var images = request.Pet.Images.Select((url, i) => new PetImage
            {
                Id = Guid.NewGuid(),
                PetId = pet.Id,
                OriginalUrl = url,
                LargeUrl = url,
                ThumbUrl = url,
                IsPrimary = i == 0,
                DisplayOrder = i,
                Status = "approved"
            });
            _db.PetImages.AddRange(images);
        }

        // Create FAQs
        if (request.Faqs?.Any() == true)
        {
            var faqs = request.Faqs.Select((f, i) => new PetFaq
            {
                Id = Guid.NewGuid(),
                PetId = pet.Id,
                Question = f.Question,
                Answer = f.Answer,
                DisplayOrder = i
            });
            _db.PetFaqs.AddRange(faqs);
        }

        // Check for active listings to enforce limit
        var activeListingsCount = await _db.AdoptionListings.CountAsync(l => l.UserId == userId && l.Status == "Active");
        
        // Default status
        string status = "PendingPayment";

        // Free tier logic: If no active listings, this one is free
        if (activeListingsCount == 0)
        {
            status = "Active";
        }

        // Create listing
        var listing = new AdoptionListing
        {
            Id = Guid.NewGuid(),
            PetId = pet.Id,
            UserId = userId.Value,
            Title = request.Title,
            Slug = GenerateListingSlug(request.Title, petType.Name, breed?.Name ?? "Mixed", pet.Name, city.Slug),
            AdoptionFee = request.AdoptionFee,
            FeeIncludes = request.FeeIncludes,
            AdopterRequirements = request.AdopterRequirements,
            HomeCheckRequired = request.HomeCheckRequired,
            Status = status,
            PublishedAt = status == "Active" ? DateTime.UtcNow : null
        };

        _db.AdoptionListings.Add(listing);
        await _db.SaveChangesAsync();

        return Created($"/api/v1/adoption-listings/{listing.Id}", new CreateListingResponse(
            listing.Id,
            pet.Id,
            listing.Status,
            listing.Slug,
            listing.CreatedAt
        ));
    }

    /// <summary>
    /// Update an existing listing
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] CreateAdoptionListingRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }

        var listing = await _db.AdoptionListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (listing == null)
        {
            return NotFound(new { error = "listing_not_found", error_description = "Listing not found" });
        }

        // Allow updates in draft, rejected, or active status
        if (listing.Status != "draft" && listing.Status != "rejected" && listing.Status != "active")
        {
            return BadRequest(new { error = "invalid_status", error_description = "Cannot update listing in current status" });
        }

        // Update pet
        var pet = listing.Pet;
        pet.Name = request.Pet.Name;
        pet.Gender = request.Pet.Gender;
        pet.AgeYears = request.Pet.AgeYears;
        pet.AgeMonths = request.Pet.AgeMonths;
        pet.Color = request.Pet.Color;
        pet.SizeCategory = request.Pet.SizeCategory;
        pet.IsNeutered = request.Pet.IsNeutered;
        pet.IsVaccinated = request.Pet.IsVaccinated;
        pet.Description = request.Pet.Description;

        // Update images (Full replace strategy)
        if (request.Pet.Images != null)
        {
            // Remove old images
            _db.PetImages.RemoveRange(pet.Images);
            
            // Add new images
            var newImages = request.Pet.Images.Select((url, i) => new PetImage
            {
                Id = Guid.NewGuid(),
                PetId = pet.Id,
                OriginalUrl = url,
                LargeUrl = url,
                ThumbUrl = url,
                IsPrimary = i == 0,
                DisplayOrder = i,
                Status = "approved"
            });
            _db.PetImages.AddRange(newImages);
        }

        // Update listing
        listing.Title = request.Title;
        listing.AdoptionFee = request.AdoptionFee;
        listing.FeeIncludes = request.FeeIncludes;
        listing.AdopterRequirements = request.AdopterRequirements;
        listing.HomeCheckRequired = request.HomeCheckRequired;

        if (request.SubmitForReview && listing.Status == "draft")
        {
            listing.Status = "pending_review";
        }
        else if (listing.Status == "Active" && listing.PublishedAt == null)
        {
            listing.PublishedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Submit listing for review
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult> SubmitForReview(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }

        var listing = await _db.AdoptionListings
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (listing == null)
        {
            return NotFound(new { error = "listing_not_found", error_description = "Listing not found" });
        }

        if (listing.Status != "draft" && listing.Status != "rejected")
        {
            return BadRequest(new { error = "invalid_status", error_description = "Can only submit from draft or rejected status" });
        }

        listing.Status = "pending_review";
        listing.RejectionReason = null;
        await _db.SaveChangesAsync();

        return Ok(new { status = listing.Status });
    }

    /// <summary>
    /// Mark pet as adopted
    /// </summary>
    [HttpPost("{id:guid}/mark-adopted")]
    public async Task<ActionResult> MarkAsAdopted(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }

        var listing = await _db.AdoptionListings
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (listing == null)
        {
            return NotFound(new { error = "listing_not_found", error_description = "Listing not found" });
        }

        if (listing.Status != "active")
        {
            return BadRequest(new { error = "invalid_status", error_description = "Can only mark active listings as adopted" });
        }

        listing.Status = "adopted";
        listing.AdoptedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { status = listing.Status, adoptedAt = listing.AdoptedAt });
    }

    /// <summary>
    /// Get owner contact info (requires login)
    /// </summary>
    [HttpGet("{slug}/contact")]
    public async Task<ActionResult<OwnerContactDto>> GetContactInfo(string slug)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Login required to view contact info" });
        }

        var listing = await _db.AdoptionListings
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Slug == slug && l.Status == "active");

        if (listing == null)
        {
            return NotFound(new { error = "listing_not_found", error_description = "Listing not found" });
        }

        // Increment inquiry count
        listing.InquiryCount++;
        await _db.SaveChangesAsync();

        var user = listing.User;
        return Ok(new OwnerContactDto(
            user.Phone ?? "",
            user.PhoneVerified,
            user.Email,
            user.Phone != null ? "whatsapp" : "email"
        ));
    }

    /// <summary>
    /// Get current user's listings
    /// </summary>
    [HttpGet("my-listings")]
    public async Task<ActionResult> GetMyListings(
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }

        var query = _db.AdoptionListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.PetType)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
            .Include(l => l.Pet)
                .ThenInclude(p => p.City)
            .Where(l => l.UserId == userId);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(l => l.Status == status);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(l => new
            {
                l.Id,
                l.Slug,
                l.Title,
                l.Status,
                Pet = new
                {
                    l.Pet.Name,
                    PetType = l.Pet.PetType.Name,
                    Breed = l.Pet.Breed != null ? l.Pet.Breed.Name : null,
                    City = l.Pet.City.Name,
                    PrimaryImage = l.Pet.Images.Where(i => i.IsPrimary).Select(i => i.ThumbUrl).FirstOrDefault()
                },
                l.ViewCount,
                l.InquiryCount,
                l.CreatedAt,
                l.PublishedAt
            })
            .ToListAsync();

        return Ok(new
        {
            data = items,
            pagination = new
            {
                page,
                limit,
                totalItems = total,
                totalPages = (int)Math.Ceiling(total / (double)limit)
            }
        });
    }

    // Helper methods
    private Guid? GetCurrentUserId()
    {
        // Get token from cookie or Authorization header
        var token = Request.Cookies["mypaws_access_token"] 
            ?? Request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "");
        
        if (string.IsNullOrEmpty(token))
        {
            return null;
        }
        
        // Validate and extract user ID from JWT
        var principal = _authService.ValidateToken(token);
        if (principal == null)
        {
            return null;
        }
        
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        
        return null;
    }

    private static string GenerateSlug(string input)
    {
        return input.ToLower()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            + "-" + Guid.NewGuid().ToString("N")[..8];
    }

    private static string GenerateListingSlug(string title, string petTypeName, string breedName, string petName, string citySlug)
    {
        var safePetName = petName.ToLower().Replace(" ", "-");
        var safeBreed = breedName.ToLower().Replace(" ", "-");
        var safeType = petTypeName.ToLower().Replace(" ", "-");
        var id = Guid.NewGuid().ToString("N")[..8];
        
        // Format: adopt-{breed}-{type}-in-{city}-{pet-name}-{id}
        // Example: adopt-labrador-retriever-dog-in-mumbai-bruno-a1b2c3d4
        return $"adopt-{safeBreed}-{safeType}-in-{citySlug}-{safePetName}-{id}";
    }
}
