using Microsoft.EntityFrameworkCore;
using Mypaws.Application.Repositories;
using Mypaws.Domain.Entities;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Infrastructure.Repositories;

public class BreederRepository : IBreederRepository
{
    private readonly MypawsDbContext _context;

    public BreederRepository(MypawsDbContext context)
    {
        _context = context;
    }

    // Application
    public async Task<IEnumerable<BreederApplication>> GetPendingApplicationsAsync()
    {
        return await _context.BreederApplications
            .Where(a => a.Status == "Pending")
            .OrderByDescending(a => a.SubmittedAt)
            .ToListAsync();
    }

    public async Task<BreederApplication?> GetApplicationByUserIdAsync(Guid userId)
    {
        return await _context.BreederApplications.FirstOrDefaultAsync(a => a.UserId == userId);
    }

    public async Task<BreederApplication> CreateApplicationAsync(BreederApplication application)
    {
        _context.BreederApplications.Add(application);
        await _context.SaveChangesAsync();
        return application;
    }

    public async Task<BreederApplication?> GetApplicationByIdAsync(Guid id)
    {
        return await _context.BreederApplications.FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task UpdateApplicationAsync(BreederApplication application)
    {
        _context.BreederApplications.Update(application);
        await _context.SaveChangesAsync();
    }

    // Profile
    public async Task<BreederProfile?> GetProfileByUserIdAsync(Guid userId)
    {
        return await _context.BreederProfiles
            .Include(p => p.City)
                .ThenInclude(c => c.State)
            .FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<BreederProfile?> GetProfileBySlugAsync(string slug)
    {
        return await _context.BreederProfiles
            .Include(p => p.City)
                .ThenInclude(c => c.State)
            .FirstOrDefaultAsync(p => p.Slug == slug);
    }

    public async Task<BreederProfile?> GetProfileByIdAsync(Guid id)
    {
        return await _context.BreederProfiles
            .Include(p => p.City)
                .ThenInclude(c => c.State)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<BreederProfile> CreateProfileAsync(BreederProfile profile)
    {
        _context.BreederProfiles.Add(profile);
        await _context.SaveChangesAsync();
        return profile;
    }

    public async Task UpdateProfileAsync(BreederProfile profile)
    {
        _context.BreederProfiles.Update(profile);
        await _context.SaveChangesAsync();
    }

    // Listings
    public async Task<BreederListing> CreateListingAsync(BreederListing listing)
    {
        _context.BreederListings.Add(listing);
        await _context.SaveChangesAsync();
        return listing;
    }

    public async Task<int> GetActiveListingsCountAsync(Guid profileId)
    {
        return await _context.BreederListings
            .CountAsync(l => l.BreederProfileId == profileId && l.Status == "Active");
    }

    public async Task<IEnumerable<BreederListing>> GetListingsByProfileIdAsync(Guid profileId, bool onlyActive = false)
    {
        var query = _context.BreederListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
             .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Where(l => l.BreederProfileId == profileId);

        if (onlyActive)
        {
            query = query.Where(l => l.Status == "Active");
        }

        return await query.OrderByDescending(l => l.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<BreederListing>> SearchListingsAsync(string? petType, Guid? breedId, Guid? cityId, decimal? minPrice, decimal? maxPrice, int skip, int take)
    {
        var query = _context.BreederListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
            .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Include(l => l.Pet)
                .ThenInclude(p => p.PetType)
            .Include(l => l.BreederProfile)
                .ThenInclude(p => p.City)
                    .ThenInclude(c => c.State)
            .Where(l => l.Status == "Active");

        if (!string.IsNullOrEmpty(petType))
        {
            query = query.Where(l => l.Pet.PetType.Name.ToLower() == petType.ToLower());
            // Note: This relies on PetType being loaded or existing.
            // If PetType is null, this might fail or filter out.
            // Better to filter by PetTypeId if we had it, but filter dto sends string.
            // Assuming PetType entity is correctly linked.
        }

        if (breedId.HasValue)
        {
            query = query.Where(l => l.Pet.BreedId == breedId.Value);
        }

        if (cityId.HasValue)
        {
            query = query.Where(l => l.BreederProfile.CityId == cityId.Value);
        }
        
        if (minPrice.HasValue)
        {
             query = query.Where(l => l.Price >= minPrice.Value);
        }
        
        if (maxPrice.HasValue)
        {
             query = query.Where(l => l.Price <= maxPrice.Value);
        }

        return await query
            .OrderByDescending(l => l.IsFeatured)
            .ThenByDescending(l => l.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> GetTotalListingViewsAsync(Guid profileId)
    {
        return await _context.BreederListings
            .Where(l => l.BreederProfileId == profileId)
            .SumAsync(l => l.ViewCount);
    }

    public async Task<BreederListing?> GetListingBySlugAsync(string slug)
    {
        return await _context.BreederListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
             .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Include(l => l.Pet)
                .ThenInclude(p => p.PetType)
            .Include(l => l.BreederProfile)
                .ThenInclude(bp => bp.City)
                    .ThenInclude(c => c.State)
            .FirstOrDefaultAsync(l => l.Slug == slug);
    }

    public async Task<BreederListing?> GetListingByIdAsync(Guid id)
    {
        return await _context.BreederListings
            .Include(l => l.Pet)
                .ThenInclude(p => p.Images)
             .Include(l => l.Pet)
                .ThenInclude(p => p.Breed)
            .Include(l => l.Pet)
                .ThenInclude(p => p.PetType)
            .Include(l => l.BreederProfile)
                .ThenInclude(bp => bp.City)
                    .ThenInclude(c => c.State)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task UpdateListingAsync(BreederListing listing)
    {
        _context.BreederListings.Update(listing);
        await _context.SaveChangesAsync();
    }

    public async Task<Pet?> GetPetByIdAsync(Guid petId)
    {
        return await _context.Pets
            .Include(p => p.Images)
            .Include(p => p.Breed)
            .FirstOrDefaultAsync(p => p.Id == petId);
    }

    public async Task<City?> GetCityByIdAsync(Guid cityId)
    {
        return await _context.Cities.FindAsync(cityId);
    }

    public async Task<Breed?> GetBreedByIdAsync(Guid breedId)
    {
        return await _context.Breeds.FindAsync(breedId);
    }
    
    public async Task<List<Breed>> GetBreedsByIdsAsync(List<Guid> breedIds)
    {
        return await _context.Breeds
            .Where(b => breedIds.Contains(b.Id))
            .ToListAsync();
    }

    public async Task UpdateUserIsBreederAsync(Guid userId, bool isBreeder)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user != null)
        {
            user.IsBreeder = isBreeder;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Pet> CreatePetAsync(Pet pet)
    {
        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();
        return pet;
    }
}
