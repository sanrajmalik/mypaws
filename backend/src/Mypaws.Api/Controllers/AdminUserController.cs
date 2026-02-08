using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mypaws.Application.DTOs.Admin;
using Mypaws.Application.Repositories;
using Mypaws.Domain.Entities;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
// [Authorize(Roles = "Admin")] // Uncomment when ready to enforce
public class AdminUserController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public AdminUserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminUserDto>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? type, // adopter, seller, breeder
        [FromQuery] string? status, // active, suspended, etc.
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        var users = await _userRepository.GetUsersAsync(search, type, status, page, limit);
        var total = await _userRepository.GetUsersCountAsync(search, type, status);

        var dtos = users.Select(u => new AdminUserDto(
            u.Id,
            u.Email,
            u.Name,
            u.AvatarUrl,
            u.Phone,
            u.PhoneVerified,
            u.Status.ToString(),
            u.IsBreeder,
            u.IsAdmin,
            u.CreatedAt,
            u.LastLoginAt,
            u.AdoptionListings?.Count ?? 0,
            DetermineUserType(u)
        )).ToList();

        return Ok(new PagedResult<AdminUserDto>
        {
            Items = dtos,
            TotalCount = total,
            Page = page,
            Limit = limit,
            TotalPages = (int)Math.Ceiling(total / (double)limit)
        });
    }

    [HttpPost("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _userRepository.FindByIdAsync(id);
        if (user == null) return NotFound();

        if (user == null) return NotFound();

        // Prevent suspending self (if the caller is the same user)
        // Note: For now we trust the caller is an admin.
        // Ideally we check HttpContext.User.GetUserId() == id
        // but we haven't implemented User.GetUserId extension method yet.
        // Let's rely on checking if the target user is an Admin for now as a safety measure
        // OR better, we can get current user ID from claims.
        var currentUserIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;
        
        if (Guid.TryParse(currentUserIdStr, out var currentUserId) && currentUserId == id)
        {
             return BadRequest(new { error = "cannot_suspend_self", message = "You cannot suspend your own account." });
        }

        if (Enum.TryParse<UserStatus>(request.Status, true, out var newStatus))
        {
            user.Status = newStatus;
            
            if (newStatus == UserStatus.Suspended)
            {
                user.SuspendedAt = DateTime.UtcNow;
            }
            else if (newStatus == UserStatus.Active)
            {
                user.SuspendedAt = null;
                user.SuspendReason = null;
            }

            await _userRepository.UpdateAsync(user);
            return Ok(new { message = $"User status updated to {newStatus}" });
        }

        return BadRequest("Invalid status");
    }

    private string DetermineUserType(User u)
    {
        if (u.IsBreeder) return "Breeder";
        if (u.AdoptionListings != null && u.AdoptionListings.Any()) return "Seller";
        return "Adopter";
    }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
    public int TotalPages { get; set; }
}
