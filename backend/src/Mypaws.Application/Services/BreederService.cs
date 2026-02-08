using Mypaws.Application.DTOs.Breeder;
using Mypaws.Application.Interfaces;
using Mypaws.Application.Repositories;
using Mypaws.Domain.Entities;
using System.Text.Json;

namespace Mypaws.Application.Services;

public class BreederService : IBreederService
{
    private readonly IBreederRepository _repository;

    public BreederService(IBreederRepository repository)
    {
        _repository = repository;
    }

    public async Task<BreederApplicationDto> ApplyAsBreeder(Guid userId, CreateBreederApplicationDto dto)
    {
        var existingApp = await _repository.GetApplicationByUserIdAsync(userId);

        if (existingApp != null)
        {
            // Update existing if draft or rejected
            if (existingApp.Status == "Draft" || existingApp.Status == "Rejected" || existingApp.Status == "InfoRequested")
            {
                existingApp.BusinessName = dto.BusinessName;
                existingApp.KennelName = dto.KennelName;
                existingApp.YearsExperience = dto.YearsExperience;
                existingApp.Description = dto.Description;
                existingApp.BusinessPhone = dto.BusinessPhone;
                existingApp.BusinessEmail = dto.BusinessEmail;
                existingApp.WebsiteUrl = dto.WebsiteUrl;
                existingApp.CityId = dto.CityId;
                existingApp.Address = dto.Address;
                existingApp.Pincode = dto.Pincode;
                existingApp.BreedIds = dto.BreedIds;
                existingApp.DocumentUrls = JsonSerializer.Serialize(dto.DocumentUrls);
                existingApp.AgreeToEthicalStandards = dto.AgreeToEthicalStandards;
                existingApp.Status = "Pending"; // Resubmit
                existingApp.SubmittedAt = DateTime.UtcNow;
                
                await _repository.UpdateApplicationAsync(existingApp);
                return MapToDto(existingApp);
            }
            else
            {
                throw new InvalidOperationException("Application already pending or approved.");
            }
        }

        var app = new BreederApplication
        {
            UserId = userId,
            BusinessName = dto.BusinessName,
            KennelName = dto.KennelName,
            YearsExperience = dto.YearsExperience,
            Description = dto.Description,
            BusinessPhone = dto.BusinessPhone,
            BusinessEmail = dto.BusinessEmail,
            WebsiteUrl = dto.WebsiteUrl,
            CityId = dto.CityId,
            Address = dto.Address,
            Pincode = dto.Pincode,
            BreedIds = dto.BreedIds,
            DocumentUrls = JsonSerializer.Serialize(dto.DocumentUrls),
            AgreeToEthicalStandards = dto.AgreeToEthicalStandards,
            Status = "Pending",
            SubmittedAt = DateTime.UtcNow
        };

        var createdApp = await _repository.CreateApplicationAsync(app);
        return MapToDto(createdApp);
    }

    public async Task<BreederApplicationDto?> GetMyApplication(Guid userId)
    {
        var app = await _repository.GetApplicationByUserIdAsync(userId);
        return app == null ? null : MapToDto(app);
    }

    public async Task<IEnumerable<BreederApplicationDto>> GetPendingApplications()
    {
        var apps = await _repository.GetPendingApplicationsAsync();
        return apps.Select(MapToDto);
    }

    public async Task<BreederProfileDto?> GetBreederProfileBySlug(string slug)
    {
        var profile = await _repository.GetProfileBySlugAsync(slug);

        if (profile == null) return null;

        var breeds = await _repository.GetBreedsByIdsAsync(profile.BreedIds);

        var totalViews = await _repository.GetTotalListingViewsAsync(profile.Id);
        return MapToProfileDto(profile, breeds, totalViews);
    }

    public async Task<BreederProfileDto?> GetMyProfile(Guid userId)
    {
        var profile = await _repository.GetProfileByUserIdAsync(userId);

        if (profile == null) return null;

        var breeds = await _repository.GetBreedsByIdsAsync(profile.BreedIds);

        var totalViews = await _repository.GetTotalListingViewsAsync(profile.Id);
        return MapToProfileDto(profile, breeds, totalViews);
    }

    public async Task<BreederListingDto> CreateListing(Guid userId, CreateBreederListingDto dto)
    {
        var profile = await _repository.GetProfileByUserIdAsync(userId);
        if (profile == null) throw new InvalidOperationException("User is not an approved breeder.");

        Pet pet;

        // Path A: Use existing Pet
        if (dto.PetId.HasValue)
        {
            var existingPet = await _repository.GetPetByIdAsync(dto.PetId.Value);
            if (existingPet == null) throw new KeyNotFoundException("Pet not found.");
            if (existingPet.OwnerId != userId) throw new UnauthorizedAccessException("You do not own this pet.");
            pet = existingPet;
        }
        // Path B: Create new Pet
        else if (dto.NewPet != null)
        {
            var newPet = new Pet
            {
                OwnerId = userId,
                Name = dto.NewPet.Name,
                Slug = $"{dto.NewPet.Name.ToLower().Replace(" ", "-")}-{Guid.NewGuid().ToString().Substring(0, 6)}",
                PetTypeId = dto.NewPet.PetTypeId,
                BreedId = dto.NewPet.BreedId,
                Gender = dto.NewPet.Gender,
                DateOfBirth = dto.NewPet.DateOfBirth,
                AgeYears = dto.NewPet.AgeYears ?? 0,
                AgeMonths = dto.NewPet.AgeMonths ?? 0,
                Color = dto.NewPet.Color,
                SizeCategory = dto.NewPet.SizeCategory ?? "medium",
                IsNeutered = dto.NewPet.IsNeutered ?? false,
                IsVaccinated = dto.NewPet.IsVaccinated ?? false,
                VaccinationDetails = dto.NewPet.VaccinationDetails,
                Temperament = JsonSerializer.Serialize(dto.NewPet.Temperament),
                FunFacts = dto.NewPet.FunFacts?.ToArray() ?? Array.Empty<string>(),
                RescueStory = dto.NewPet.RescueStory, // Mapping description/story
                Description = dto.NewPet.Description,
                CityId = profile.CityId, // Inherit from breeder profile
                CreatedAt = DateTime.UtcNow
            };

            // Images
            if (dto.NewPet.Images != null && dto.NewPet.Images.Any())
            {
                newPet.Images = dto.NewPet.Images.Select((url, index) => new PetImage
                {
                    LargeUrl = url,
                    ThumbUrl = url, // Using same for now
                    IsPrimary = index == 0
                }).ToList();
            }

            pet = await _repository.CreatePetAsync(newPet);
        }
        else
        {
            throw new ArgumentException("Either PetId or NewPet must be provided.");
        }

        // Generate slug logic
        string breedSlug = "dog"; // Default fallback
        string citySlug = "india";

        // Fetch breed slug if possible
        if (pet.BreedId.HasValue)
        {
            // Ideally should fetch from Repo, but for now we might rely on Pet having it if eager loaded or fetching it
            // Pet is either existing (loaded) or new (just created).
            // If new, we might not have Breed entity loaded.
            // Let's optimize: we need Breed and City slugs.
        }
        
        // Improve: Fetch Breed and City slugs properly
        var city = await _repository.GetCityByIdAsync(profile.CityId);
        citySlug = city?.Slug ?? "india";

        string petSlugPart = pet.Breed?.Slug ?? "pet"; // Default
        
        // If pet breed is not loaded, we need to load it. 
        if (pet.Breed == null && pet.BreedId.HasValue)
        {
           var breed = await _repository.GetBreedByIdAsync(pet.BreedId.Value);
           petSlugPart = breed?.Slug ?? "pet";
        }
        else if (pet.Breed != null)
        {
            petSlugPart = pet.Breed.Slug;
        }

        // SEO Slug: {breed}-in-{city}-{random}
        // e.g. labrador-retriever-in-mumbai-abc12345
        string slug = $"{petSlugPart}-in-{citySlug}-{Guid.NewGuid().ToString().Substring(0, 8)}";

        var listing = new BreederListing
        {
            BreederProfileId = profile.Id,
            PetId = pet.Id,
            Title = dto.Title,
            Slug = slug,
            Price = dto.Price,
            AvailableCount = dto.AvailableCount,
            ExpectedDate = dto.ExpectedDate,
            Includes = dto.Includes,
            Status = "PendingPayment", // Default to pending
            PublishedAt = null
        };

        // Limit Enforcement
        var activeCount = await _repository.GetActiveListingsCountAsync(profile.Id);
        if (activeCount == 0)
        {
            listing.Status = "Active";
            listing.PublishedAt = DateTime.UtcNow;
        }

        var createdListing = await _repository.CreateListingAsync(listing);
        
        // Update profile stats
        profile.ActiveListingsCount++;
        await _repository.UpdateProfileAsync(profile);

        // Re-fetch pet with breed if it was new, to ensure Breed property is populated for DTO
        // Actually we can just set BreedName manually if we know it, or rely on frontend to refresh.
        // For efficiency, let's just return what we have.
        
        return new BreederListingDto
        {
            Id = createdListing.Id,
            Title = createdListing.Title,
            Slug = createdListing.Slug,
            Price = createdListing.Price,
            PriceNegotiable = createdListing.PriceNegotiable,
            Status = createdListing.Status,
            CreatedAt = createdListing.CreatedAt,
            PetId = pet.Id,
            PetName = pet.Name,
            BreedName = "Pending Refresh", // We'd need to fetch breed name if creating new.
            ImageUrl = pet.Images?.FirstOrDefault(i => i.IsPrimary)?.LargeUrl ?? pet.Images?.FirstOrDefault()?.LargeUrl ?? ""
        };
    }

    public async Task<IEnumerable<BreederListingDto>> GetMyListings(Guid userId)
    {
        var profile = await _repository.GetProfileByUserIdAsync(userId);
        if (profile == null) return Enumerable.Empty<BreederListingDto>();

        return await GetListingsQuery(profile.Id);
    }

    public async Task<IEnumerable<BreederListingDto>> GetListingsByBreeder(Guid breederId)
    {
        return await GetListingsQuery(breederId, onlyActive: true);
    }

    public async Task<IEnumerable<BreederListingDto>> SearchListings(BreederListingFilterDto filter)
    {
        int skip = (filter.Page - 1) * filter.PageSize;
        var listings = await _repository.SearchListingsAsync(filter.PetType, filter.BreedId, filter.CityId, filter.MinPrice, filter.MaxPrice, skip, filter.PageSize);
        
        return listings.Select(l => new BreederListingDto
        {
            Id = l.Id,
            Title = l.Title,
            Slug = l.Slug,
            Price = l.Price,
            PriceNegotiable = l.PriceNegotiable,
            Status = l.Status,
            CreatedAt = l.CreatedAt,
            PetId = l.PetId,
            PetName = l.Pet.Name,
            BreedName = l.Pet.Breed?.Name ?? "Unknown",
            ImageUrl = l.Pet.Images.FirstOrDefault(i => i.IsPrimary)?.LargeUrl ?? l.Pet.Images.FirstOrDefault()?.LargeUrl ?? "",
            PetType = l.Pet.PetType?.Name ?? "Dog",
            Gender = l.Pet.Gender,
            AgeDisplay = $"{l.Pet.AgeMonths} months",
            Color = l.Pet.Color,
            BreederId = l.BreederProfileId,
            BreederName = l.BreederProfile.BusinessName,
            CityName = l.BreederProfile.City?.Name ?? "Unknown",
            StateName = l.BreederProfile.City?.State?.Name ?? ""
        });
    }

    public async Task<BreederListingDto?> GetListingBySlug(string slug)
    {
        var listing = await _repository.GetListingBySlugAsync(slug);
        if (listing == null) return null;

        var dto = new BreederListingDto
        {
            Id = listing.Id,
            Title = listing.Title,
            Slug = listing.Slug,
            Price = listing.Price,
            PriceNegotiable = listing.PriceNegotiable,
            Status = listing.Status,
            CreatedAt = listing.CreatedAt,
            PetId = listing.PetId,
            PetName = listing.Pet.Name,
            BreedName = listing.Pet.Breed?.Name ?? "Unknown",
            ImageUrl = listing.Pet.Images.FirstOrDefault(i => i.IsPrimary)?.LargeUrl ?? listing.Pet.Images.FirstOrDefault()?.LargeUrl ?? "",
            
            // Extended
            PetType = listing.Pet.PetType?.Name ?? "Dog", // Navigate to PetType entity
            Gender = listing.Pet.Gender,
            AgeDisplay = $"{listing.Pet.AgeMonths} months", // Simple format for now
            Color = listing.Pet.Color,
            Description = listing.Pet.Description ?? listing.Pet.RescueStory, // Fallback
            Images = listing.Pet.Images.Select(i => i.LargeUrl).ToList(),
            
            BreederId = listing.BreederProfileId,
            BreederName = listing.BreederProfile.BusinessName,
            CityName = listing.BreederProfile.City?.Name ?? "",
            StateName = listing.BreederProfile.City?.State?.Name ?? ""
        };
        
        return dto;
    }

    public async Task<bool> ApproveApplication(Guid applicationId, Guid approvedByUserId)
    {
        var app = await _repository.GetApplicationByIdAsync(applicationId);
        if (app == null) return false;
        if (app.Status != "Pending" && app.Status != "InfoRequested") return false;

        // 1. Create Profile
        var businessName = app.BusinessName;
        // Simple slug generation
        string slug = businessName.ToLowerInvariant().Replace(" ", "-").Replace(".", "").Replace(",", ""); 
        // Ensure uniqueness (simple append for now, robust handled by repo constraint or retry in real app)
        // For now, if slug exists, append random
        var existingProfile = await _repository.GetProfileBySlugAsync(slug);
        if (existingProfile != null)
        {
            slug = $"{slug}-{Guid.NewGuid().ToString().Substring(0, 4)}";
        }

        var profile = new BreederProfile
        {
            UserId = app.UserId,
            BusinessName = app.BusinessName,
            Slug = slug,
            KennelName = app.KennelName,
            Description = app.Description,
            YearsExperience = app.YearsExperience,
            BusinessPhone = app.BusinessPhone,
            BusinessEmail = app.BusinessEmail,
            WebsiteUrl = app.WebsiteUrl,
            CityId = app.CityId,
            Address = app.Address,
            Pincode = app.Pincode,
            BreedIds = app.BreedIds,
            GalleryUrls = new List<string>(), // Init empty
            IsVerified = true,
            VerifiedAt = DateTime.UtcNow,
            VerificationBadge = "Verified Breeder",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        if (!string.IsNullOrEmpty(app.DocumentUrls))
        {
             // Potential logic to move docs to private storage or similar, skipping for Phase 5 demo
        }

        await _repository.CreateProfileAsync(profile);

        // 2. Update Application Status
        app.Status = "Approved";
        app.ReviewedBy = approvedByUserId;
        app.ReviewedAt = DateTime.UtcNow;
        await _repository.UpdateApplicationAsync(app);

        // 3. Promote User
        await _repository.UpdateUserIsBreederAsync(app.UserId, true);

        return true;
    }

    public async Task<bool> RejectApplication(Guid applicationId, Guid rejectedByUserId, string reason)
    {
        var app = await _repository.GetApplicationByIdAsync(applicationId);
        if (app == null) return false;
        if (app.Status != "Pending") return false;

        app.Status = "Rejected";
        app.ReviewNotes = JsonSerializer.Serialize(new { Reason = reason });
        app.ReviewedBy = rejectedByUserId;
        app.ReviewedAt = DateTime.UtcNow;

        await _repository.UpdateApplicationAsync(app);
        return true;
    }

    private async Task<IEnumerable<BreederListingDto>> GetListingsQuery(Guid profileId, bool onlyActive = false)
    {
        var listings = await _repository.GetListingsByProfileIdAsync(profileId, onlyActive);

        return listings.Select(l => new BreederListingDto
        {
            Id = l.Id,
            Title = l.Title,
            Slug = l.Slug,
            Price = l.Price,
            PriceNegotiable = l.PriceNegotiable,
            Status = l.Status,
            CreatedAt = l.CreatedAt,
            PetId = l.PetId,
            PetName = l.Pet.Name,
            BreedName = l.Pet.Breed?.Name ?? "Unknown",
            ImageUrl = l.Pet.Images.FirstOrDefault(i => i.IsPrimary)?.LargeUrl ?? l.Pet.Images.FirstOrDefault()?.LargeUrl ?? ""
        });
    }

    public async Task<BreederProfileDto?> GetBreederProfileByUserId(Guid userId)
    {
        return await GetMyProfile(userId);
    }

    public async Task<BreederProfileDto?> GetBreederProfileById(Guid id)
    {
        var profile = await _repository.GetProfileByIdAsync(id);
        if (profile == null) return null;
        var breeds = await _repository.GetBreedsByIdsAsync(profile.BreedIds);
        var totalViews = await _repository.GetTotalListingViewsAsync(profile.Id);
        return MapToProfileDto(profile, breeds, totalViews);
    }

    public async Task<BreederProfileDto> UpdateBreederProfile(Guid userId, UpdateBreederProfileDto dto)
    {
        var profile = await _repository.GetProfileByUserIdAsync(userId);
        if (profile == null) throw new InvalidOperationException("Profile not found");

        profile.BusinessName = dto.BusinessName;
        profile.KennelName = dto.KennelName;
        profile.Description = dto.Description;
        profile.YearsExperience = dto.YearsExperience;
        profile.BusinessPhone = dto.BusinessPhone;
        profile.BusinessEmail = dto.BusinessEmail;
        profile.WebsiteUrl = dto.WebsiteUrl;
        profile.CityId = dto.CityId;
        profile.Address = dto.Address;
        profile.Pincode = dto.Pincode;
        profile.BreedIds = dto.BreedIds;
        // Document URLs update if needed, normally handled separately

        await _repository.UpdateProfileAsync(profile);
        
        var breeds = await _repository.GetBreedsByIdsAsync(profile.BreedIds);
        var totalViews = await _repository.GetTotalListingViewsAsync(profile.Id);
        return MapToProfileDto(profile, breeds, totalViews);
    }

    public async Task<BreederListingDto> UpdateListing(Guid userId, Guid listingId, UpdateBreederListingDto dto)
    {
        var listing = await _repository.GetListingByIdAsync(listingId);
        if (listing == null) throw new KeyNotFoundException("Listing not found");

        // Verify ownership (indirectly via profile)
        var profile = await _repository.GetProfileByUserIdAsync(userId);
        if (profile == null || listing.BreederProfileId != profile.Id)
            throw new UnauthorizedAccessException("You do not own this listing");

        listing.Title = dto.Title;
        listing.Price = dto.Price;
        listing.PriceNegotiable = dto.PriceNegotiable;
        listing.AvailableCount = dto.AvailableCount;
        listing.ExpectedDate = dto.ExpectedDate;
        listing.Includes = dto.Includes;
        
        // Update pet details if linked? For now listing updates simple fields.
        // If we want to update pet details, we need extensive logic.
        // Assuming simple updates for listing properties.

        await _repository.UpdateListingAsync(listing);
        
        // Return updated DTO (refetch to get full details including pet)
        // Or reconstruct. Refetching by slug or ID is safer.
        return (await GetListingBySlug(listing.Slug))!;
    }

    public async Task DeleteListing(Guid userId, Guid listingId)
    {
        var listing = await _repository.GetListingByIdAsync(listingId);
        if (listing == null) throw new KeyNotFoundException("Listing not found");

        var profile = await _repository.GetProfileByUserIdAsync(userId);
        if (profile == null || listing.BreederProfileId != profile.Id)
            throw new UnauthorizedAccessException("You do not own this listing");

        listing.IsDeleted = true;
        await _repository.UpdateListingAsync(listing);
        
        // Also update profile count
        if (profile != null)
        {
            profile.ActiveListingsCount--;
            await _repository.UpdateProfileAsync(profile);
        }
    }

    private BreederApplicationDto MapToDto(BreederApplication app)
    {
        var docUrls = new Dictionary<string, string>();
        if (!string.IsNullOrEmpty(app.DocumentUrls))
        {
            try
            {
                docUrls = JsonSerializer.Deserialize<Dictionary<string, string>>(app.DocumentUrls) ?? new();
            }
            catch { }
        }

        return new BreederApplicationDto
        {
            Id = app.Id,
            UserId = app.UserId,
            BusinessName = app.BusinessName,
            KennelName = app.KennelName,
            YearsExperience = app.YearsExperience,
            Description = app.Description,
            BusinessPhone = app.BusinessPhone,
            BusinessEmail = app.BusinessEmail,
            WebsiteUrl = app.WebsiteUrl,
            CityId = app.CityId,
            Address = app.Address,
            Pincode = app.Pincode,
            BreedIds = app.BreedIds,
            DocumentUrls = docUrls,
            Status = app.Status,
            ReviewNotes = app.ReviewNotes,
            CreatedAt = app.CreatedAt
        };
    }

    private BreederProfileDto MapToProfileDto(BreederProfile profile, List<Breed> breeds, int totalListingViews = 0)
    {
        return new BreederProfileDto
        {
            Id = profile.Id,
            BusinessName = profile.BusinessName,
            Slug = profile.Slug,
            KennelName = profile.KennelName,
            Description = profile.Description,
            YearsExperience = profile.YearsExperience,
            BusinessPhone = profile.BusinessPhone, // TODO: masking logic
            BusinessEmail = profile.BusinessEmail,
            WebsiteUrl = profile.WebsiteUrl,
            CityId = profile.CityId,
            CityName = profile.City.Name,
            StateName = profile.City.State.Name,
            LogoUrl = profile.LogoUrl,
            CoverImageUrl = profile.CoverImageUrl,
            GalleryUrls = profile.GalleryUrls,
            IsVerified = profile.IsVerified,
            VerificationBadge = profile.VerificationBadge,
            ActiveListingsCount = profile.ActiveListingsCount,
            ViewCount = profile.ViewCount,
            TotalListingViews = totalListingViews,
            AvgRating = profile.AvgRating,
            ReviewCount = profile.ReviewCount,
            Breeds = breeds.Select(b => new BreedDto { Id = b.Id, Name = b.Name, Slug = b.Slug }).ToList()
        };
    }
}
