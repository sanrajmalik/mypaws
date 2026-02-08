using Mypaws.Domain.Entities;

namespace Mypaws.Application.Repositories;

/// <summary>
/// Repository interface for User operations
/// </summary>
public interface IUserRepository
{
    Task<User?> FindByGoogleIdAsync(string googleId);
    Task<User?> FindByEmailAsync(string email);
    Task<User?> FindByGoogleIdOrEmailAsync(string googleId, string email);
    Task<User?> FindByIdAsync(Guid id);
    Task<List<User>> GetUsersAsync(string? search, string? userType, string? status, int page, int limit);
    Task<int> GetUsersCountAsync(string? search, string? userType, string? status);
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
}
