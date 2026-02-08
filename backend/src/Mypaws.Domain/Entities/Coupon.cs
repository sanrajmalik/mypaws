using System.ComponentModel.DataAnnotations.Schema;

namespace Mypaws.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;

    // Discount
    public string DiscountType { get; set; } = "percentage";  // percentage, fixed
    
    [Column(TypeName = "decimal(10, 2)")]
    public decimal DiscountValue { get; set; }
    
    [Column(TypeName = "decimal(10, 2)")]
    public decimal? MaxDiscount { get; set; }        // Cap for percentage discounts

    // Applicability
    [Column(TypeName = "text[]")]
    public List<string> AppliesTo { get; set; } = new();         // ['adoption', 'breeder', 'featured']
    
    [Column(TypeName = "decimal(10, 2)")]
    public decimal? MinOrderAmount { get; set; }

    // Limits
    public int? TotalUses { get; set; }               // NULL = unlimited
    public int UsesPerUser { get; set; } = 1;
    public int CurrentUses { get; set; } = 0;

    // Validity
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }

    // Status
    public bool IsActive { get; set; } = true;
}
