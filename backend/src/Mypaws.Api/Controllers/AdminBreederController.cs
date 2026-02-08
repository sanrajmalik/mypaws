using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mypaws.Application.Interfaces;
using System.Security.Claims;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/admin/breeders")]
public class AdminBreederController : ControllerBase
{
    private readonly IBreederService _breederService;
    private readonly ILogger<AdminBreederController> _logger;

    public AdminBreederController(IBreederService breederService, ILogger<AdminBreederController> logger)
    {
        _breederService = breederService;
        _logger = logger;
    }

    [HttpGet("stats")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStats()
    {
        var pendingApps = await _breederService.GetPendingApplications();
        // In a real app, we'd fetch other stats too. For now, mocking or partial.
        return Ok(new
        {
            PendingApplications = pendingApps.Count(),
            TotalUsers = 0, // Placeholder
            Revenue = 0 // Placeholder
        });
    }

    [HttpGet("applications/pending")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingApplications()
    {
        var apps = await _breederService.GetPendingApplications();
        return Ok(apps);
    }

    [HttpPost("applications/{id}/approve")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveApplication(Guid id)
    {
        try
        {
            // For now, simulate admin ID from current user or system
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
            
            var success = await _breederService.ApproveApplication(id, adminId);
            
            if (!success)
            {
                return BadRequest("Application not found or valid for approval.");
            }

            return Ok(new { message = "Application approved and breeder profile created." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving breeder application");
            return StatusCode(500, "An error occurred.");
        }
    }

    [HttpPost("applications/{id}/reject")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectApplication(Guid id, [FromBody] RejectRequest request)
    {
        try
        {
            var adminId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
            
            var success = await _breederService.RejectApplication(id, adminId, request.Reason);
            
            if (!success)
            {
                return BadRequest("Application not found or valid for rejection.");
            }

            return Ok(new { message = "Application rejected." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting breeder application");
            return StatusCode(500, "An error occurred.");
        }
    }

    public class RejectRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
