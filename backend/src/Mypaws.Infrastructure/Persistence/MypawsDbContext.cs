using Microsoft.EntityFrameworkCore;
using Mypaws.Domain.Entities;

namespace Mypaws.Infrastructure.Persistence;

public class MypawsDbContext : DbContext
{
    public MypawsDbContext(DbContextOptions<MypawsDbContext> options) : base(options)
    {
    }

    // Location
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<State> States => Set<State>();
    public DbSet<City> Cities => Set<City>();
    
    // Pet classification
    public DbSet<PetType> PetTypes => Set<PetType>();
    public DbSet<Breed> Breeds => Set<Breed>();
    
    // Pets & Listings
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<PetImage> PetImages => Set<PetImage>();
    public DbSet<PetFaq> PetFaqs => Set<PetFaq>();
    public DbSet<AdoptionListing> AdoptionListings => Set<AdoptionListing>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<BreederApplication> BreederApplications => Set<BreederApplication>();
    public DbSet<BreederProfile> BreederProfiles => Set<BreederProfile>();
    public DbSet<BreederListing> BreederListings => Set<BreederListing>();
    
    // Users & Breeders
    public DbSet<User> Users => Set<User>();
    
    // Payments
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<ListingUsage> ListingUsages => Set<ListingUsage>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    
    // Legacy Breeder & Image removed
    // public DbSet<Breeder> Breeders => Set<Breeder>(); 
    // public DbSet<BreederListingImage> BreederListingImages => Set<BreederListingImage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // === Location Hierarchy ===
        modelBuilder.Entity<State>()
            .HasOne(s => s.Country)
            .WithMany(c => c.States)
            .HasForeignKey(s => s.CountryId);
        
        modelBuilder.Entity<City>()
            .HasOne(c => c.State)
            .WithMany(s => s.Cities)
            .HasForeignKey(c => c.StateId);

        // Favorites
        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.AdoptionListingId }).IsUnique();
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.AdoptionListing).WithMany().HasForeignKey(e => e.AdoptionListingId).OnDelete(DeleteBehavior.Cascade);
        });

        // Global query filters for soft deleteion ===
        modelBuilder.Entity<Breed>()
            .HasOne(b => b.PetType)
            .WithMany(pt => pt.Breeds)
            .HasForeignKey(b => b.PetTypeId);

        // === Pet Classification ===
        modelBuilder.Entity<Breed>()
            .HasOne(b => b.PetType)
            .WithMany(pt => pt.Breeds)
            .HasForeignKey(b => b.PetTypeId);

        // === Pet ===
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.PetType)
            .WithMany(pt => pt.Pets)
            .HasForeignKey(p => p.PetTypeId);
        
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.Breed)
            .WithMany(b => b.Pets)
            .HasForeignKey(p => p.BreedId);
        
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.City)
            .WithMany(c => c.Pets)
            .HasForeignKey(p => p.CityId);
        
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Pets)
            .HasForeignKey(p => p.OwnerId);
        
        modelBuilder.Entity<PetImage>()
            .HasOne(pi => pi.Pet)
            .WithMany(p => p.Images)
            .HasForeignKey(pi => pi.PetId);
        
        modelBuilder.Entity<PetFaq>()
            .HasOne(pf => pf.Pet)
            .WithMany(p => p.Faqs)
            .HasForeignKey(pf => pf.PetId);

        // === Adoption Listing ===
        modelBuilder.Entity<AdoptionListing>()
            .HasOne(l => l.Pet)
            .WithOne(p => p.AdoptionListing)
            .HasForeignKey<AdoptionListing>(l => l.PetId);
        
        modelBuilder.Entity<AdoptionListing>()
            .HasOne(l => l.User)
            .WithMany(u => u.AdoptionListings)
            .HasForeignKey(l => l.UserId);

        // === Breeder ===
        modelBuilder.Entity<User>()
            .HasOne(u => u.BreederProfile)
            .WithOne(b => b.User)
            .HasForeignKey<BreederProfile>(b => b.UserId);
        
        modelBuilder.Entity<BreederProfile>()
            .HasOne(b => b.City)
            .WithMany(c => c.BreederProfiles)
            .HasForeignKey(b => b.CityId);
        
        modelBuilder.Entity<BreederListing>()
            .HasOne(l => l.BreederProfile)
            .WithMany(b => b.Listings)
            .HasForeignKey(l => l.BreederProfileId);
        
        // Removed explicit BreederListingImage configuration since it's not in the new schema plan yet.
        // Assuming removal or integration into BreederListing later.

        // === Indexes ===
        modelBuilder.Entity<PetType>().HasIndex(pt => pt.Slug).IsUnique();
        modelBuilder.Entity<Breed>().HasIndex(b => b.Slug).IsUnique();
        modelBuilder.Entity<City>().HasIndex(c => c.Slug).IsUnique();
        modelBuilder.Entity<Pet>().HasIndex(p => p.Slug).IsUnique();
        modelBuilder.Entity<AdoptionListing>().HasIndex(l => l.Slug).IsUnique();
        modelBuilder.Entity<AdoptionListing>().HasIndex(l => new { l.Status });

        modelBuilder.Entity<BreederProfile>().HasIndex(b => b.Slug).IsUnique();
        modelBuilder.Entity<BreederListing>().HasIndex(l => l.Slug).IsUnique();

        // === Payments ===
        modelBuilder.Entity<Payment>(entity =>
        {
             entity.HasIndex(e => e.GatewayOrderId);
             entity.HasIndex(e => e.GatewayPaymentId);
             entity.HasIndex(e => e.Status);
             entity.HasIndex(e => new { e.ListingType, e.ListingId });
             entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
        });

        modelBuilder.Entity<ListingUsage>(entity =>
        {
             entity.HasIndex(e => new { e.ListingType, e.ListingId });
             entity.HasIndex(e => e.Status);
             // Unique active free tier per user per type
             entity.HasIndex(e => new { e.UserId, e.ListingType })
                   .IsUnique()
                   .HasFilter("\"IsFreeTier\" = true AND \"Status\" = 'active'");
             
             entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
             entity.HasOne(e => e.Payment).WithMany().HasForeignKey(e => e.PaymentId);
             entity.HasOne(e => e.RenewedFrom).WithMany().HasForeignKey(e => e.RenewedFromId);
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
             entity.HasIndex(e => e.Code).IsUnique();
             entity.HasIndex(e => new { e.IsActive, e.ValidFrom, e.ValidUntil });
        });

        // === Value Converters ===
        // BreederApplication
        modelBuilder.Entity<BreederApplication>()
            .Property(e => e.BreedIds)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(v, (System.Text.Json.JsonSerializerOptions)null) ?? new List<Guid>());

        // BreederProfile
        modelBuilder.Entity<BreederProfile>()
            .Property(e => e.BreedIds)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(v, (System.Text.Json.JsonSerializerOptions)null) ?? new List<Guid>());

        modelBuilder.Entity<BreederProfile>()
            .Property(e => e.GalleryUrls)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions)null) ?? new List<string>());

        // BreederListing
        modelBuilder.Entity<BreederListing>()
            .Property(e => e.Includes)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions)null) ?? new List<string>());

        // === Precision ===
        modelBuilder.Entity<Pet>().Property(p => p.Weight).HasPrecision(5, 2);
        modelBuilder.Entity<AdoptionListing>().Property(l => l.AdoptionFee).HasPrecision(10, 2);
        modelBuilder.Entity<City>().Property(c => c.Latitude).HasPrecision(10, 8);
        modelBuilder.Entity<City>().Property(c => c.Longitude).HasPrecision(11, 8);

        modelBuilder.Entity<BreederListing>().Property(l => l.Price).HasPrecision(10, 2);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
