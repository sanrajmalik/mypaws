using Microsoft.AspNetCore.Mvc;
using Mypaws.Application.DTOs.Auth;
using Mypaws.Application.Services;
using Mypaws.Application.Repositories;
using System.Security.Claims;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;
    
    public AuthController(IAuthService authService, IConfiguration configuration, IUserRepository userRepository)
    {
        _authService = authService;
        _configuration = configuration;
        _userRepository = userRepository;
    }
    
    /// <summary>
    /// Mock login for development (when Auth:MockEnabled = true)
    /// </summary>
    [HttpPost("mock")]
    public async Task<ActionResult<AuthResponse>> MockLogin([FromBody] MockLoginRequest request)
    {
        var mockEnabled = _configuration.GetValue<bool>("Auth:MockEnabled", true);
        if (!mockEnabled)
        {
            return BadRequest(new { error = "mock_disabled", error_description = "Mock auth is disabled in this environment" });
        }
        
        var response = await _authService.MockLoginAsync(request);
        
        // Set httpOnly cookies
        SetAuthCookies(response.AccessToken, response.RefreshToken);
        
        return Ok(response);
    }
    
    /// <summary>
    /// Google OAuth login - accepts Google ID token from frontend
    /// </summary>
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var response = await _authService.GoogleLoginAsync(request.IdToken);
            SetAuthCookies(response.AccessToken, response.RefreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = "invalid_token", error_description = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "google_login_failed", error_description = ex.Message });
        }
    }
    
    /// <summary>
    /// Refresh access token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshResponse>> Refresh([FromBody] RefreshRequest request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            
            // Update access token cookie
            Response.Cookies.Append("mypaws_access_token", response.AccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.Equals("Development", StringComparison.OrdinalIgnoreCase) ?? false,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });
            
            return Ok(response);
        }
        catch (Exception)
        {
            return Unauthorized(new { error = "invalid_token", error_description = "Refresh token is invalid or expired" });
        }
    }
    
    /// <summary>
    /// Logout
    /// </summary>
    [HttpPost("logout")]
    public ActionResult Logout([FromBody] LogoutRequest? request)
    {
        // Clear cookies
        Response.Cookies.Delete("mypaws_access_token");
        Response.Cookies.Delete("mypaws_refresh_token");
        
        // TODO: If request.AllDevices, revoke all sessions in database
        
        return NoContent();
    }
    
    /// <summary>
    /// Get current user from token
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        // Try to get token from cookie or header
        var token = Request.Cookies["mypaws_access_token"] 
            ?? Request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "");
        
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { error = "not_authenticated", error_description = "No valid token found" });
        }
        
        var principal = _authService.ValidateToken(token);
        if (principal == null)
        {
            return Unauthorized(new { error = "invalid_token", error_description = "Token is invalid or expired" });
        }
        
        // Fix: Check both "sub" and ClaimTypes.NameIdentifier because ASP.NET Core maps them by default
        var userId = principal.FindFirst("sub")?.Value 
                  ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                  ?? "";

        var email = principal.FindFirst("email")?.Value 
                 ?? principal.FindFirst(ClaimTypes.Email)?.Value
                 ?? "";

        var name = principal.FindFirst("name")?.Value ?? "User";
        var phoneVerified = bool.Parse(principal.FindFirst("phone_verified")?.Value ?? "false");
        var status = principal.FindFirst("status")?.Value ?? "registered";
        
        // Security Check: If status is Suspended/Banned, block access.
        // We trust the token 'status' claim usually, but for immediate ban enforcement we should ideally check DB.
        // However, the user asked for API level restriction.
        // Let's rely on the token claim first. If the token was issued BEFORE ban, it has 'Active'.
        // To enforce IMMEDIATE ban, we MUST check DB or cache.
        // Since we don't have a cache layer, let's query the DB for this critical check.
        // We need to inject IUserRepository.
        var dbUser = await _authService.ValidateTokenDbCheck(token); // We need to add this method or use Repo
        
        if (dbUser != null)
        {
            Console.WriteLine($"[DEBUG] User {dbUser.Email} status: {dbUser.Status} (Int: {(int)dbUser.Status})");
        }

        // Emergency Hatch: Allow specific admin
        if (dbUser != null && dbUser.Email != "sanrajmalik@gmail.com" && (dbUser.Status == Domain.Entities.UserStatus.Suspended || dbUser.Status == Domain.Entities.UserStatus.Banned))
        {
             Console.WriteLine($"[DEBUG] BLOCKING User {dbUser.Email}");
             return Unauthorized(new { error = "account_suspended", error_description = "Your account has been suspended." });
        }

        // Use DB user for fresh roles if available, else fallback to token claims
        var isBreeder = dbUser?.IsBreeder ?? bool.Parse(principal.FindFirst("role")?.Value == "breeder" ? "true" : "false");
        var isAdmin = dbUser?.IsAdmin ?? bool.Parse(principal.FindFirst(c => c.Type == ClaimTypes.Role && c.Value == "admin") != null ? "true" : "false");

        var userDto = new UserDto(
            Guid.TryParse(userId, out var id) ? id : Guid.Empty,
            email,
            name,
            null,
            null,
            phoneVerified,
            dbUser?.Address, // Map from DB user if available
            dbUser?.CityId,
            dbUser?.Pincode,
            status,
            isBreeder,
            isAdmin,
            DateTime.UtcNow
        );
        
        return Ok(userDto);
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateUserDto request)
    {
        // Get user ID from claim and verify against DB
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId)) 
            return Unauthorized();

        var user = await _userRepository.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        // Update fields
        user.Name = request.Name;
        user.Phone = request.Phone;
        user.Address = request.Address;
        user.CityId = request.CityId;
        user.Pincode = request.Pincode;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Return updated DTO
        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.Name ?? "User",
            user.AvatarUrl,
            user.Phone,
            user.PhoneVerified,
            user.Address,
            user.CityId,
            user.Pincode,
            user.Status.ToString().ToLowerInvariant(),
            user.IsBreeder,
            user.IsAdmin,
            user.CreatedAt
        );
        
        return Ok(userDto);
    }

    [HttpDelete("me")]
    public async Task<ActionResult> DeleteAccount()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId)) 
            return Unauthorized();

        var user = await _userRepository.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        // Soft Delete
        user.Status = Domain.Entities.UserStatus.Deleted;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);
        
        // Logout
        Response.Cookies.Delete("mypaws_access_token");
        Response.Cookies.Delete("mypaws_refresh_token");

        return NoContent();
    }
    
    /// <summary>
    /// Debug: Show all received cookies and validate token
    /// </summary>
    [HttpGet("debug")]
    public ActionResult Debug()
    {
        var allCookies = Request.Cookies.ToDictionary(c => c.Key, c => c.Value.Length > 20 ? c.Value[..20] + "..." : c.Value);
        var accessToken = Request.Cookies["mypaws_access_token"];
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        
        object? tokenClaims = null;
        if (!string.IsNullOrEmpty(accessToken))
        {
            var principal = _authService.ValidateToken(accessToken);
            if (principal != null)
            {
                tokenClaims = principal.Claims.ToDictionary(c => c.Type, c => c.Value);
            }
        }
        
        return Ok(new
        {
            cookiesReceived = allCookies,
            accessTokenPresent = !string.IsNullOrEmpty(accessToken),
            authHeaderPresent = !string.IsNullOrEmpty(authHeader),
            tokenValid = tokenClaims != null,
            claims = tokenClaims
        });
    }
    
    private void SetAuthCookies(string accessToken, string refreshToken)
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?.Equals("Development", StringComparison.OrdinalIgnoreCase) ?? false;
        
        Response.Cookies.Append("mypaws_access_token", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax, // Changed to Lax for cross-origin OAuth
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });
        
        Response.Cookies.Append("mypaws_refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30)
        });
    }
}

// Request DTOs
public record GoogleLoginRequest(string IdToken);
