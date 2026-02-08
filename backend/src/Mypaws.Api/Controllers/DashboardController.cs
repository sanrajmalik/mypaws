using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mypaws.Application.Services;
using Mypaws.Infrastructure.Persistence;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly MypawsDbContext _db;
    private readonly IAuthService _authService;

    public DashboardController(MypawsDbContext db, IAuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized(new { error = "unauthorized" });

        var activeListings = await _db.AdoptionListings
            .CountAsync(l => l.UserId == userId && l.Status == "active");

        var totalListings = await _db.AdoptionListings
            .CountAsync(l => l.UserId == userId);

        var totalViews = await _db.AdoptionListings
            .Where(l => l.UserId == userId)
            .SumAsync(l => l.ViewCount);
            
        var inquiries = await _db.AdoptionListings
            .Where(l => l.UserId == userId)
            .SumAsync(l => l.InquiryCount);

        return Ok(new
        {
            activeListings,
            totalListings,
            totalViews,
            inquiries
        });
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
}
