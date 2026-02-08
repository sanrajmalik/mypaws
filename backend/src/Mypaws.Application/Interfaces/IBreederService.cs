using Mypaws.Application.DTOs.Breeder;
using Mypaws.Domain.Entities;

namespace Mypaws.Application.Interfaces;

public interface IBreederService
{
    // Application Flow
    Task<BreederApplicationDto> ApplyAsBreeder(Guid userId, CreateBreederApplicationDto dto);
    Task<BreederApplicationDto?> GetMyApplication(Guid userId);
    Task<IEnumerable<BreederApplicationDto>> GetPendingApplications();
    
    // Profile Management
    Task<BreederProfileDto?> GetBreederProfileByUserId(Guid userId);
    Task<BreederProfileDto?> GetBreederProfileById(Guid id);
    Task<BreederProfileDto?> GetBreederProfileBySlug(string slug);
    Task<BreederProfileDto?> GetMyProfile(Guid userId);
    Task<BreederProfileDto> UpdateBreederProfile(Guid userId, UpdateBreederProfileDto dto);
    
    // Listing Management
    Task<BreederListingDto> CreateListing(Guid userId, CreateBreederListingDto dto);
    Task<BreederListingDto> UpdateListing(Guid userId, Guid listingId, UpdateBreederListingDto dto);
    Task DeleteListing(Guid userId, Guid listingId);

    Task<IEnumerable<BreederListingDto>> GetMyListings(Guid userId);
    Task<IEnumerable<BreederListingDto>> GetListingsByBreeder(Guid breederId); // Public view
    Task<BreederListingDto?> GetListingBySlug(string slug);
    Task<IEnumerable<BreederListingDto>> SearchListings(BreederListingFilterDto filter);
    
    // Admin
    Task<bool> ApproveApplication(Guid applicationId, Guid approvedByUserId);
    Task<bool> RejectApplication(Guid applicationId, Guid rejectedByUserId, string reason);
}
