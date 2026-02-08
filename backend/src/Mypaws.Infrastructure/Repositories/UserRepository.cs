using Microsoft.EntityFrameworkCore;
using Mypaws.Application.Repositories;
using Mypaws.Domain.Entities;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of IUserRepository
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly MypawsDbContext _dbContext;

    public UserRepository(MypawsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> FindByGoogleIdAsync(string googleId)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> FindByGoogleIdOrEmailAsync(string googleId, string email)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId || u.Email == email);
    }

    public async Task<User?> FindByIdAsync(Guid id)
    {
        return await _dbContext.Users.FindAsync(id);
    }

    public async Task<List<User>> GetUsersAsync(string? search, string? userType, string? status, int page, int limit)
    {
        var query = _dbContext.Users
            .Include(u => u.AdoptionListings)
            .Include(u => u.BreederProfile)
            .AsQueryable();

        query = ApplyFilters(query, search, userType, status);

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> GetUsersCountAsync(string? search, string? userType, string? status)
    {
        var query = _dbContext.Users.AsQueryable();
        query = ApplyFilters(query, search, userType, status);
        return await query.CountAsync();
    }

    private IQueryable<User> ApplyFilters(IQueryable<User> query, string? search, string? userType, string? status)
    {
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(u => u.Email.ToLower().Contains(s) || (u.Name != null && u.Name.ToLower().Contains(s)));
        }

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<UserStatus>(status, true, out var statusEnum))
        {
            query = query.Where(u => u.Status == statusEnum);
        }

        if (!string.IsNullOrEmpty(userType))
        {
            switch (userType.ToLower())
            {
                case "breeder":
                    query = query.Where(u => u.IsBreeder);
                    break;
                case "seller": // Rehomers: Have listings but not breeder
                    query = query.Where(u => !u.IsBreeder && u.AdoptionListings.Any());
                    break;
                case "adopter": // Pure Adopters: No listings, not breeder
                    query = query.Where(u => !u.IsBreeder && !u.AdoptionListings.Any());
                    break;
            }
        }

        return query;
    }

    public async Task<User> CreateAsync(User user)
    {
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _dbContext.Users.Update(user);
        await _dbContext.SaveChangesAsync();
    }
}
