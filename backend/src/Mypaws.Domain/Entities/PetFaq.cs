namespace Mypaws.Domain.Entities;

public class PetFaq : BaseEntity
{
    public Guid PetId { get; set; }
    
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public Pet Pet { get; set; } = null!;
}
