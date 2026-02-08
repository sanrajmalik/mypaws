using Mypaws.Domain.Entities;

namespace Mypaws.Application.Repositories;

public interface IBreederRepository
{
    // Application
    Task<BreederApplication?> GetApplicationByUserIdAsync(Guid userId);
    Task<BreederApplication> CreateApplicationAsync(BreederApplication application);
    Task<BreederApplication?> GetApplicationByIdAsync(Guid id);
    Task UpdateApplicationAsync(BreederApplication application);
    Task<IEnumerable<BreederApplication>> GetPendingApplicationsAsync();

    // Profile
    Task<BreederProfile?> GetProfileByUserIdAsync(Guid userId);
    Task<BreederProfile?> GetProfileBySlugAsync(string slug);
    Task<BreederProfile?> GetProfileByIdAsync(Guid id);
    Task<BreederProfile> CreateProfileAsync(BreederProfile profile);
    Task UpdateProfileAsync(BreederProfile profile);

    // Listings
    Task<BreederListing> CreateListingAsync(BreederListing listing);
    Task<int> GetActiveListingsCountAsync(Guid profileId);
    Task<IEnumerable<BreederListing>> GetListingsByProfileIdAsync(Guid profileId, bool onlyActive = false);
    Task<IEnumerable<BreederListing>> SearchListingsAsync(string? petType, Guid? breedId, Guid? cityId, decimal? minPrice, decimal? maxPrice, int skip, int take);
    Task<int> GetTotalListingViewsAsync(Guid profileId);
    Task<BreederListing?> GetListingBySlugAsync(string slug);
    Task<BreederListing?> GetListingByIdAsync(Guid id);
    Task UpdateListingAsync(BreederListing listing);
    
    // Helpers
    Task<Pet?> GetPetByIdAsync(Guid petId);
    
    // Low-level lookups for slug generation
    Task<City?> GetCityByIdAsync(Guid cityId);
    Task<Breed?> GetBreedByIdAsync(Guid breedId);
    
    // Breeds (Helper)
    Task<List<Breed>> GetBreedsByIdsAsync(List<Guid> breedIds);

    // User (Helper)
    Task UpdateUserIsBreederAsync(Guid userId, bool isBreeder);

    // Pet Creation (for seamless listing)
    Task<Pet> CreatePetAsync(Pet pet);
}
