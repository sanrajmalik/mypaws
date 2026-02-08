using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mypaws.Application.DTOs.Breeder;
using Mypaws.Application.Interfaces;
using System.Security.Claims;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/breeders")]
public class BreedersController : ControllerBase
{
    private readonly IBreederService _breederService;
    private readonly ILogger<BreedersController> _logger;

    public BreedersController(IBreederService breederService, ILogger<BreedersController> logger)
    {
        _breederService = breederService;
        _logger = logger;
    }

    [HttpPost("apply")]
    [Authorize]
    public async Task<ActionResult<BreederApplicationDto>> ApplyAsBreeder(CreateBreederApplicationDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _breederService.ApplyAsBreeder(userId, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting breeder application");
            return StatusCode(500, "An error occurred while submitting application");
        }
    }

    [HttpGet("application")]
    [Authorize]
    public async Task<ActionResult<BreederApplicationDto>> GetApplication()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _breederService.GetMyApplication(userId);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application");
            return StatusCode(500, "An error occurred while retrieving application");
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<BreederProfileDto>> GetMyProfile()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _breederService.GetMyProfile(userId);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving breeder profile");
            return StatusCode(500, "An error occurred while retrieving profile");
        }
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<BreederProfileDto>> UpdateProfile(UpdateBreederProfileDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _breederService.UpdateBreederProfile(userId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating breeder profile");
            return StatusCode(500, "An error occurred while updating profile");
        }
    }

    [HttpGet("listings")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BreederListingDto>>> GetMyListings()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var listings = await _breederService.GetMyListings(userId);
            return Ok(listings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving breeder listings");
            return StatusCode(500, "An error occurred while retrieving listings");
        }
    }

    [HttpPost("listings")]
    [Authorize]
    public async Task<ActionResult<BreederListingDto>> CreateListing(CreateBreederListingDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _breederService.CreateListing(userId, dto);
            return CreatedAtAction(nameof(GetListingBySlug), new { slug = result.Slug }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating listing");
            return StatusCode(500, "An error occurred while creating listing");
        }
    }

    [HttpPut("listings/{id}")]
    [Authorize]
    public async Task<ActionResult<BreederListingDto>> UpdateListing(Guid id, UpdateBreederListingDto dto)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _breederService.UpdateListing(userId, id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating listing");
            return StatusCode(500, "An error occurred while updating listing");
        }
    }

    [HttpDelete("listings/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteListing(Guid id)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            await _breederService.DeleteListing(userId, id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting listing");
            return StatusCode(500, "An error occurred while deleting listing");
        }
    }

    // Public endpoints
    [HttpGet("public/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<BreederProfileDto>> GetPublicProfile(Guid id)
    {
        try
        {
            var result = await _breederService.GetBreederProfileById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public profile");
            return StatusCode(500, "An error occurred while retrieving profile");
        }
    }

    [HttpGet("public/slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<BreederProfileDto>> GetPublicProfileBySlug(string slug)
    {
        try
        {
            var result = await _breederService.GetBreederProfileBySlug(slug);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public profile by slug");
            return StatusCode(500, "An error occurred while retrieving profile");
        }
    }

    [HttpGet("public/{id}/listings")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BreederListingDto>>> GetBreederListings(Guid id)
    {
        try
        {
            var listings = await _breederService.GetListingsByBreeder(id);
            return Ok(listings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public breeder listings");
            return StatusCode(500, "An error occurred while retrieving listings");
        }
    }

    [HttpGet("listings/search")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BreederListingDto>>> SearchListings([FromQuery] BreederListingFilterDto filter)
    {
        try
        {
            var listings = await _breederService.SearchListings(filter);
            return Ok(listings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching listings");
            return StatusCode(500, "An error occurred while searching");
        }
    }

    [HttpGet("listings/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<BreederListingDto>> GetListingBySlug(string slug)
    {
        try
        {
            var listing = await _breederService.GetListingBySlug(slug);
            if (listing == null) return NotFound();
            return Ok(listing);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving listing by slug");
            return StatusCode(500, "An error occurred while retrieving listing");
        }
    }
}
