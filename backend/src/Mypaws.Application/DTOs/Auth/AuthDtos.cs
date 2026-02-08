namespace Mypaws.Application.DTOs.Auth;

public record LoginRequest(string Code, string RedirectUri);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    string TokenType,
    UserDto User
);

public record RefreshRequest(string RefreshToken);

public record RefreshResponse(
    string AccessToken,
    int ExpiresIn,
    string TokenType
);

public record LogoutRequest(bool AllDevices = false);

public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? AvatarUrl,
    string? Phone,
    bool PhoneVerified,
    string? Address,
    int? CityId,
    string? Pincode,
    string Status,
    bool IsBreeder,
    bool IsAdmin,
    DateTime CreatedAt
);

public record UpdateUserDto(
    string Name,
    string Phone,
    string Address,
    int? CityId,
    string Pincode
);

public record MockLoginRequest(string Email, string Name);
