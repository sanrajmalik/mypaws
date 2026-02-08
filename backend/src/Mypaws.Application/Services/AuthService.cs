using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Mypaws.Application.DTOs.Auth;
using Mypaws.Application.Interfaces;
using Mypaws.Application.Repositories;
using Mypaws.Domain.Entities;

namespace Mypaws.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> MockLoginAsync(MockLoginRequest request);
    Task<AuthResponse> GoogleLoginAsync(string idToken);
    Task<RefreshResponse> RefreshTokenAsync(string refreshToken);
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
    Task<User?> ValidateTokenDbCheck(string token);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;
    private readonly string _jwtSecret;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly string? _googleClientId;
    
    public AuthService(IConfiguration configuration, IUserRepository userRepository)
    {
        _configuration = configuration;
        _userRepository = userRepository;
        _jwtSecret = configuration["Auth:JwtSecret"] ?? "mypaws-dev-secret-key-minimum-32-characters-required";
        _issuer = configuration["Auth:Issuer"] ?? "mypaws.in";
        _audience = configuration["Auth:Audience"] ?? "mypaws-api";
        _googleClientId = configuration["Auth:GoogleClientId"];
    }
    
    public async Task<AuthResponse> GoogleLoginAsync(string idToken)
    {
        // Validate the Google ID token
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = _googleClientId != null ? new[] { _googleClientId } : null
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        }
        catch (InvalidJwtException)
        {
            throw new UnauthorizedAccessException("Invalid Google ID token");
        }
        
        // Find or create user
        var user = await _userRepository.FindByGoogleIdOrEmailAsync(payload.Subject, payload.Email);
        
        if (user == null)
        {
            // Create new user
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = payload.Email,
                Name = payload.Name ?? payload.Email.Split('@')[0],
                AvatarUrl = payload.Picture,
                GoogleId = payload.Subject,
                PhoneVerified = false,
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            // Auto-promote Admin based on config
            var adminEmails = _configuration.GetSection("AdminSettings:AdminEmails").Get<string[]>() ?? Array.Empty<string>();
            if (adminEmails.Contains(user.Email))
            {
                user.IsAdmin = true;
            }

            await _userRepository.CreateAsync(user);
        }
        // Else: existing user, maybe auto-promote too if config changed?
        else 
        {
            var adminEmails = _configuration.GetSection("AdminSettings:AdminEmails").Get<string[]>() ?? Array.Empty<string>();
            if (adminEmails.Contains(user.Email) && !user.IsAdmin)
            {
                user.IsAdmin = true;
                // If existing user didn't have Google ID linked, link it now
                if (user.GoogleId == null) 
                {
                    user.GoogleId = payload.Subject;
                    user.AvatarUrl ??= payload.Picture;
                }
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }
            else if (user.GoogleId == null)
            {
                user.GoogleId = payload.Subject;
                user.AvatarUrl ??= payload.Picture;
                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
            }
        }
        
        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();
        
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
            user.IsAdmin, // Added IsAdmin
            user.CreatedAt
        );
        
        return new AuthResponse(
            accessToken,
            refreshToken,
            3600, // 1 hour
            "Bearer",
            userDto
        );
    }
    
    public async Task<AuthResponse> MockLoginAsync(MockLoginRequest request)
    {
        // In mock mode, find or create user for development
        var user = await _userRepository.FindByEmailAsync(request.Email);
        
        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Name,
                Phone = null,
                PhoneVerified = false,
                Status = UserStatus.Active,
                GoogleId = $"mock_{Guid.NewGuid():N}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            // Auto-promote Admin based on config
            var adminEmails = _configuration.GetSection("AdminSettings:AdminEmails").Get<string[]>() ?? Array.Empty<string>();
            if (adminEmails.Contains(user.Email))
            {
                user.IsAdmin = true;
            }

            await _userRepository.CreateAsync(user);
        }
        else 
        {
            var adminEmails = _configuration.GetSection("AdminSettings:AdminEmails").Get<string[]>() ?? Array.Empty<string>();
            if (adminEmails.Contains(user.Email) && !user.IsAdmin)
            {
                user.IsAdmin = true;
                await _userRepository.UpdateAsync(user);
            }
        }
        
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        
        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();
        
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
            user.IsAdmin, // Added IsAdmin
            user.CreatedAt
        );
        
        return new AuthResponse(
            accessToken,
            refreshToken,
            3600, // 1 hour
            "Bearer",
            userDto
        );
    }
    
    public async Task<RefreshResponse> RefreshTokenAsync(string refreshToken)
    {
        // In a real implementation, validate the refresh token from database
        // For now, just generate a new access token for mock purposes
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "mock@example.com",
            Name = "Mock User",
            Status = UserStatus.Active
        };
        
        var accessToken = GenerateAccessToken(user);
        
        return new RefreshResponse(accessToken, 3600, "Bearer");
    }
    
    public string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("name", user.Name ?? "User"),
            new("phone_verified", user.PhoneVerified.ToString().ToLowerInvariant()),
            new("status", user.Status.ToString().ToLowerInvariant()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
        };
        
        if (user.IsAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "admin"));
        }
        
        if (user.IsBreeder)
        {
            claims.Add(new Claim(ClaimTypes.Role, "breeder"));
        }
        
        claims.Add(new Claim(ClaimTypes.Role, "user"));
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }
    
    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var handler = new JwtSecurityTokenHandler();
            
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);
            
            return principal;
        }
        catch
        {
            return null;
        }
    }

    public async Task<User?> ValidateTokenDbCheck(string token)
    {
        var principal = ValidateToken(token);
        if (principal == null) return null;

        var userIdStr = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                     ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId)) return null;

        return await _userRepository.FindByIdAsync(userId);
    }
}
