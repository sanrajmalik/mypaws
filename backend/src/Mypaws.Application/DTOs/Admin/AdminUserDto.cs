namespace Mypaws.Application.DTOs.Admin;

public record AdminUserDto(
    Guid Id,
    string Email,
    string? Name,
    string? AvatarUrl,
    string? Phone,
    bool PhoneVerified,
    string Status,
    bool IsBreeder,
    bool IsAdmin,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    int ListingsCount, // Number of Adoption Listings created
    string UserType // Adopter, Seller, Breeder
);

public record UpdateUserStatusRequest(string Status); // Active, Suspended
