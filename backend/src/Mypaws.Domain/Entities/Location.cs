namespace Mypaws.Domain.Entities;

public class Country : BaseEntity
{
    public string Name { get; set; } = string.Empty;        // India
    public string Slug { get; set; } = string.Empty;        // india
    public string IsoCode { get; set; } = string.Empty;     // IN
    public string PhoneCode { get; set; } = string.Empty;   // +91
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public ICollection<State> States { get; set; } = new List<State>();
}

public class State : BaseEntity
{
    public Guid CountryId { get; set; }
    
    public string Name { get; set; } = string.Empty;        // Maharashtra
    public string Slug { get; set; } = string.Empty;        // maharashtra
    public string? StateCode { get; set; }                  // MH
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public Country Country { get; set; } = null!;
    public ICollection<City> Cities { get; set; } = new List<City>();
}
