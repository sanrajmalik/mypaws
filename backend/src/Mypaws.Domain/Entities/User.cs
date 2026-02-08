namespace Mypaws.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    
    // Address
    public string? Address { get; set; }
    public int? CityId { get; set; }
    public string? Pincode { get; set; }
    
    // Auth
    public string? GoogleId { get; set; }
    public bool PhoneVerified { get; set; } = false;
    public DateTime? PhoneVerifiedAt { get; set; }
    
    // Status
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime? LastLoginAt { get; set; }
    public DateTime? SuspendedAt { get; set; }
    public string? SuspendReason { get; set; }
    
    // Roles
    public bool IsBreeder { get; set; } = false;
    public bool IsAdmin { get; set; } = false;
    
    // Navigation
    public BreederProfile? BreederProfile { get; set; }
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<AdoptionListing> AdoptionListings { get; set; } = new List<AdoptionListing>();
}

public enum UserStatus
{
    Active,
    Suspended,
    Banned,
    Deleted
}
