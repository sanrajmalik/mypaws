namespace Mypaws.Domain.Entities;

public class Favorite : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid AdoptionListingId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public AdoptionListing AdoptionListing { get; set; } = null!;
}
