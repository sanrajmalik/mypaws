using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mypaws.Domain.Entities;

public class BreederApplication : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? KennelName { get; set; }

    public int YearsExperience { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;

    // Contact Info
    [Required]
    [MaxLength(20)]
    public string BusinessPhone { get; set; } = string.Empty;

    [EmailAddress]
    [MaxLength(255)]
    public string? BusinessEmail { get; set; }

    [Url]
    public string? WebsiteUrl { get; set; }

    // Location
    [Required]
    public Guid CityId { get; set; }

    [ForeignKey("CityId")]
    public virtual City City { get; set; } = null!;

    [Required]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string Pincode { get; set; } = string.Empty;

    // Specialization (stored as JSON array of Breed IDs or similar if simple, 
    // but better to have defined structure if querying is needed. 
    // For application, a list of IDs is fine).
    public List<Guid> BreedIds { get; set; } = new();

    // Verification Documents (JSON)
    // { "id_proof": "url", "address_proof": "url", "kennel_photos": ["url1", "url2"] }
    [Column(TypeName = "jsonb")]
    public string? DocumentUrls { get; set; }

    // Workflow
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Pending, Approved, Rejected, InfoRequested

    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }

    [Column(TypeName = "jsonb")]
    public string? ReviewNotes { get; set; } // Array of notes: [{date, admin, note}]

    public bool AgreeToEthicalStandards { get; set; }
}
