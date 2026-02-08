namespace Mypaws.Domain.Entities;

/// <summary>
/// Pet types (Dog, Cat) as a table for extensibility
/// </summary>
public class PetType : BaseEntity
{
    public string Name { get; set; } = string.Empty;        // Dog
    public string Slug { get; set; } = string.Empty;        // dog
    public string PluralName { get; set; } = string.Empty;  // Dogs
    public string? IconUrl { get; set; }
    
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    
    // Navigation
    public ICollection<Breed> Breeds { get; set; } = new List<Breed>();
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}
