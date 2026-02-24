using System.Text.Json;
using Mypaws.Domain.Entities;

namespace Mypaws.Infrastructure.Persistence;

public static class SeedData
{
    public static void Initialize(MypawsDbContext context)
    {
        EnsurePetTypes(context);
        EnsureBreeds(context);
        EnsureLocations(context);
        EnsureTestUser(context);
        
        context.SaveChanges();
    }

    private static void EnsurePetTypes(MypawsDbContext context)
    {
        if (context.PetTypes.Any()) return;

        // Pet Types
        var dogType = new PetType
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "Dog",
            Slug = "dog",
            PluralName = "Dogs",
            DisplayOrder = 1,
            IsActive = true
        };

        var catType = new PetType
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Cat",
            Slug = "cat",
            PluralName = "Cats",
            DisplayOrder = 2,
            IsActive = true
        };

        context.PetTypes.AddRange(dogType, catType);
        context.SaveChanges();
    }

    private static void EnsureBreeds(MypawsDbContext context)
    {
        var dogType = context.PetTypes.FirstOrDefault(p => p.Name == "Dog");
        var catType = context.PetTypes.FirstOrDefault(p => p.Name == "Cat");

        if (dogType == null || catType == null) return;

        // Load breeds from JSON file
        var breedsJsonPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "data", "breeds.json");
        
        // Fallback: try relative to working directory
        if (!File.Exists(breedsJsonPath))
        {
            breedsJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "data", "breeds.json");
        }

        // Fallback: Docker volume mount path
        if (!File.Exists(breedsJsonPath))
        {
            breedsJsonPath = "/app/data/breeds.json";
        }

        List<Breed> allBreeds = new();

        if (File.Exists(breedsJsonPath))
        {
            try
            {
                var jsonContent = File.ReadAllText(breedsJsonPath);
                var breedsData = JsonSerializer.Deserialize<BreedsJsonData>(jsonContent, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });

                if (breedsData?.Breeds != null)
                {
                    int dogOrder = 1;
                    foreach (var breed in breedsData.Breeds.Dogs ?? [])
                    {
                        allBreeds.Add(new Breed
                        {
                            Id = Guid.NewGuid(),
                            PetTypeId = dogType.Id,
                            Name = breed.Name,
                            Slug = breed.Slug,
                            SizeCategory = breed.SizeCategory,
                            OriginCountry = breed.Origin,
                            IsPopular = breed.IsPopular,
                            DisplayOrder = dogOrder++
                        });
                    }

                    int catOrder = 1;
                    foreach (var breed in breedsData.Breeds.Cats ?? [])
                    {
                        allBreeds.Add(new Breed
                        {
                            Id = Guid.NewGuid(),
                            PetTypeId = catType.Id,
                            Name = breed.Name,
                            Slug = breed.Slug,
                            SizeCategory = breed.SizeCategory,
                            OriginCountry = breed.Origin,
                            IsPopular = breed.IsPopular,
                            DisplayOrder = catOrder++
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Could not load breeds from JSON: {ex.Message}. Using default breeds.");
            }
        }

        // Fallback to default breeds if JSON loading failed and no breeds exist at all
        if (allBreeds.Count == 0 && !context.Breeds.Any())
        {
            allBreeds = GetDefaultBreeds(dogType.Id, catType.Id);
        }

        if (allBreeds.Count == 0) return;

        // Upsert: only insert breeds whose slug doesn't already exist in the DB
        var existingSlugs = context.Breeds.Select(b => b.Slug).ToHashSet();
        var newBreeds = allBreeds.Where(b => !existingSlugs.Contains(b.Slug)).ToList();

        if (newBreeds.Count > 0)
        {
            context.Breeds.AddRange(newBreeds);
            context.SaveChanges();
            Console.WriteLine($"Seeded {newBreeds.Count} new breeds (skipped {existingSlugs.Count} existing).");
        }
        else
        {
            Console.WriteLine($"All {existingSlugs.Count} breeds already exist. No new breeds to seed.");
        }
    }

    private static void EnsureLocations(MypawsDbContext context)
    {
        if (context.Countries.Any()) return;

        // Country
        var india = new Country
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "India",
            Slug = "india",
            IsoCode = "IN",
            PhoneCode = "+91",
            IsActive = true
        };
        context.Countries.Add(india);

        // States
        var states = new List<State>
        {
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444401"), CountryId = india.Id, Name = "Maharashtra", Slug = "maharashtra", StateCode = "MH" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444402"), CountryId = india.Id, Name = "Karnataka", Slug = "karnataka", StateCode = "KA" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444403"), CountryId = india.Id, Name = "Tamil Nadu", Slug = "tamil-nadu", StateCode = "TN" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444404"), CountryId = india.Id, Name = "Delhi", Slug = "delhi", StateCode = "DL" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444405"), CountryId = india.Id, Name = "Telangana", Slug = "telangana", StateCode = "TS" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444406"), CountryId = india.Id, Name = "Gujarat", Slug = "gujarat", StateCode = "GJ" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444407"), CountryId = india.Id, Name = "West Bengal", Slug = "west-bengal", StateCode = "WB" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444408"), CountryId = india.Id, Name = "Rajasthan", Slug = "rajasthan", StateCode = "RJ" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444409"), CountryId = india.Id, Name = "Kerala", Slug = "kerala", StateCode = "KL" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444410"), CountryId = india.Id, Name = "Punjab", Slug = "punjab", StateCode = "PB" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444411"), CountryId = india.Id, Name = "Uttar Pradesh", Slug = "uttar-pradesh", StateCode = "UP" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444412"), CountryId = india.Id, Name = "Madhya Pradesh", Slug = "madhya-pradesh", StateCode = "MP" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444413"), CountryId = india.Id, Name = "Bihar", Slug = "bihar", StateCode = "BR" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444414"), CountryId = india.Id, Name = "Andhra Pradesh", Slug = "andhra-pradesh", StateCode = "AP" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444415"), CountryId = india.Id, Name = "Odisha", Slug = "odisha", StateCode = "OR" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444416"), CountryId = india.Id, Name = "Assam", Slug = "assam", StateCode = "AS" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444417"), CountryId = india.Id, Name = "Jharkhand", Slug = "jharkhand", StateCode = "JH" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444418"), CountryId = india.Id, Name = "Chhattisgarh", Slug = "chhattisgarh", StateCode = "CG" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444419"), CountryId = india.Id, Name = "Haryana", Slug = "haryana", StateCode = "HR" },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444420"), CountryId = india.Id, Name = "Goa", Slug = "goa", StateCode = "GA" },
        };
        context.States.AddRange(states);

        // Cities (major metros + tier-2)
        var cities = new List<City>
        {
            // Maharashtra
            new() { Id = Guid.NewGuid(), StateId = states[0].Id, Name = "Mumbai", Slug = "mumbai", IsFeatured = true, Latitude = 19.0760m, Longitude = 72.8777m },
            new() { Id = Guid.NewGuid(), StateId = states[0].Id, Name = "Pune", Slug = "pune", IsFeatured = true, Latitude = 18.5204m, Longitude = 73.8567m },
            new() { Id = Guid.NewGuid(), StateId = states[0].Id, Name = "Nagpur", Slug = "nagpur", Latitude = 21.1458m, Longitude = 79.0882m },
            new() { Id = Guid.NewGuid(), StateId = states[0].Id, Name = "Thane", Slug = "thane", Latitude = 19.2183m, Longitude = 72.9781m },
            new() { Id = Guid.NewGuid(), StateId = states[0].Id, Name = "Nashik", Slug = "nashik", Latitude = 19.9975m, Longitude = 73.7898m },
            new() { Id = Guid.NewGuid(), StateId = states[0].Id, Name = "Navi Mumbai", Slug = "navi-mumbai", IsFeatured = true, Latitude = 19.0330m, Longitude = 73.0297m },
            
            // Karnataka
            new() { Id = Guid.NewGuid(), StateId = states[1].Id, Name = "Bangalore", Slug = "bangalore", IsFeatured = true, Latitude = 12.9716m, Longitude = 77.5946m },
            new() { Id = Guid.NewGuid(), StateId = states[1].Id, Name = "Mysore", Slug = "mysore", Latitude = 12.2958m, Longitude = 76.6394m },
            new() { Id = Guid.NewGuid(), StateId = states[1].Id, Name = "Mangalore", Slug = "mangalore", Latitude = 12.9141m, Longitude = 74.8560m },
            new() { Id = Guid.NewGuid(), StateId = states[1].Id, Name = "Hubli", Slug = "hubli", Latitude = 15.3647m, Longitude = 75.1240m },
            
            // Tamil Nadu
            new() { Id = Guid.NewGuid(), StateId = states[2].Id, Name = "Chennai", Slug = "chennai", IsFeatured = true, Latitude = 13.0827m, Longitude = 80.2707m },
            new() { Id = Guid.NewGuid(), StateId = states[2].Id, Name = "Coimbatore", Slug = "coimbatore", Latitude = 11.0168m, Longitude = 76.9558m },
            new() { Id = Guid.NewGuid(), StateId = states[2].Id, Name = "Madurai", Slug = "madurai", Latitude = 9.9252m, Longitude = 78.1198m },
            new() { Id = Guid.NewGuid(), StateId = states[2].Id, Name = "Salem", Slug = "salem", Latitude = 11.6643m, Longitude = 78.1460m },
            
            // Delhi NCR
            new() { Id = Guid.NewGuid(), StateId = states[3].Id, Name = "New Delhi", Slug = "new-delhi", IsFeatured = true, Latitude = 28.6139m, Longitude = 77.2090m },
            new() { Id = Guid.NewGuid(), StateId = states[3].Id, Name = "Noida", Slug = "noida", IsFeatured = true, Latitude = 28.5355m, Longitude = 77.3910m },
            new() { Id = Guid.NewGuid(), StateId = states[3].Id, Name = "Gurgaon", Slug = "gurgaon", IsFeatured = true, Latitude = 28.4595m, Longitude = 77.0266m },
            new() { Id = Guid.NewGuid(), StateId = states[3].Id, Name = "Faridabad", Slug = "faridabad", Latitude = 28.4089m, Longitude = 77.3178m },
            new() { Id = Guid.NewGuid(), StateId = states[3].Id, Name = "Ghaziabad", Slug = "ghaziabad", Latitude = 28.6692m, Longitude = 77.4538m },
            
            // Telangana
            new() { Id = Guid.NewGuid(), StateId = states[4].Id, Name = "Hyderabad", Slug = "hyderabad", IsFeatured = true, Latitude = 17.3850m, Longitude = 78.4867m },
            new() { Id = Guid.NewGuid(), StateId = states[4].Id, Name = "Secunderabad", Slug = "secunderabad", Latitude = 17.4399m, Longitude = 78.4983m },
            new() { Id = Guid.NewGuid(), StateId = states[4].Id, Name = "Warangal", Slug = "warangal", Latitude = 17.9784m, Longitude = 79.5941m },
            
            // Gujarat
            new() { Id = Guid.NewGuid(), StateId = states[5].Id, Name = "Ahmedabad", Slug = "ahmedabad", IsFeatured = true, Latitude = 23.0225m, Longitude = 72.5714m },
            new() { Id = Guid.NewGuid(), StateId = states[5].Id, Name = "Surat", Slug = "surat", Latitude = 21.1702m, Longitude = 72.8311m },
            new() { Id = Guid.NewGuid(), StateId = states[5].Id, Name = "Vadodara", Slug = "vadodara", Latitude = 22.3072m, Longitude = 73.1812m },
            new() { Id = Guid.NewGuid(), StateId = states[5].Id, Name = "Rajkot", Slug = "rajkot", Latitude = 22.3039m, Longitude = 70.8022m },
            
            // West Bengal
            new() { Id = Guid.NewGuid(), StateId = states[6].Id, Name = "Kolkata", Slug = "kolkata", IsFeatured = true, Latitude = 22.5726m, Longitude = 88.3639m },
            new() { Id = Guid.NewGuid(), StateId = states[6].Id, Name = "Howrah", Slug = "howrah", Latitude = 22.5958m, Longitude = 88.2636m },
            new() { Id = Guid.NewGuid(), StateId = states[6].Id, Name = "Siliguri", Slug = "siliguri", Latitude = 26.7271m, Longitude = 88.3953m },
            
            // Rajasthan
            new() { Id = Guid.NewGuid(), StateId = states[7].Id, Name = "Jaipur", Slug = "jaipur", IsFeatured = true, Latitude = 26.9124m, Longitude = 75.7873m },
            new() { Id = Guid.NewGuid(), StateId = states[7].Id, Name = "Udaipur", Slug = "udaipur", Latitude = 24.5854m, Longitude = 73.7125m },
            new() { Id = Guid.NewGuid(), StateId = states[7].Id, Name = "Jodhpur", Slug = "jodhpur", Latitude = 26.2389m, Longitude = 73.0243m },
            new() { Id = Guid.NewGuid(), StateId = states[7].Id, Name = "Kota", Slug = "kota", Latitude = 25.2138m, Longitude = 75.8648m },
            
            // Kerala
            new() { Id = Guid.NewGuid(), StateId = states[8].Id, Name = "Kochi", Slug = "kochi", IsFeatured = true, Latitude = 9.9312m, Longitude = 76.2673m },
            new() { Id = Guid.NewGuid(), StateId = states[8].Id, Name = "Thiruvananthapuram", Slug = "thiruvananthapuram", Latitude = 8.5241m, Longitude = 76.9366m },
            new() { Id = Guid.NewGuid(), StateId = states[8].Id, Name = "Kozhikode", Slug = "kozhikode", Latitude = 11.2588m, Longitude = 75.7804m },
            
            // Punjab
            new() { Id = Guid.NewGuid(), StateId = states[9].Id, Name = "Chandigarh", Slug = "chandigarh", IsFeatured = true, Latitude = 30.7333m, Longitude = 76.7794m },
            new() { Id = Guid.NewGuid(), StateId = states[9].Id, Name = "Ludhiana", Slug = "ludhiana", Latitude = 30.9010m, Longitude = 75.8573m },
            new() { Id = Guid.NewGuid(), StateId = states[9].Id, Name = "Amritsar", Slug = "amritsar", Latitude = 31.6340m, Longitude = 74.8723m },
            
            // Uttar Pradesh
            new() { Id = Guid.NewGuid(), StateId = states[10].Id, Name = "Lucknow", Slug = "lucknow", IsFeatured = true, Latitude = 26.8467m, Longitude = 80.9462m },
            new() { Id = Guid.NewGuid(), StateId = states[10].Id, Name = "Kanpur", Slug = "kanpur", Latitude = 26.4499m, Longitude = 80.3319m },
            new() { Id = Guid.NewGuid(), StateId = states[10].Id, Name = "Varanasi", Slug = "varanasi", Latitude = 25.3176m, Longitude = 82.9739m },
            new() { Id = Guid.NewGuid(), StateId = states[10].Id, Name = "Agra", Slug = "agra", Latitude = 27.1767m, Longitude = 78.0081m },
            
            // Madhya Pradesh
            new() { Id = Guid.NewGuid(), StateId = states[11].Id, Name = "Indore", Slug = "indore", IsFeatured = true, Latitude = 22.7196m, Longitude = 75.8577m },
            new() { Id = Guid.NewGuid(), StateId = states[11].Id, Name = "Bhopal", Slug = "bhopal", Latitude = 23.2599m, Longitude = 77.4126m },
            
            // Bihar
            new() { Id = Guid.NewGuid(), StateId = states[12].Id, Name = "Patna", Slug = "patna", IsFeatured = true, Latitude = 25.5941m, Longitude = 85.1376m },
            
            // Andhra Pradesh
            new() { Id = Guid.NewGuid(), StateId = states[13].Id, Name = "Visakhapatnam", Slug = "visakhapatnam", IsFeatured = true, Latitude = 17.6868m, Longitude = 83.2185m },
            new() { Id = Guid.NewGuid(), StateId = states[13].Id, Name = "Vijayawada", Slug = "vijayawada", Latitude = 16.5062m, Longitude = 80.6480m },
            
            // Goa
            new() { Id = Guid.NewGuid(), StateId = states[19].Id, Name = "Panaji", Slug = "panaji", IsFeatured = true, Latitude = 15.4909m, Longitude = 73.8278m },
            new() { Id = Guid.NewGuid(), StateId = states[19].Id, Name = "Margao", Slug = "margao", Latitude = 15.2832m, Longitude = 73.9862m },
        };
        context.Cities.AddRange(cities);
        context.SaveChanges();
    }

    private static void EnsureTestUser(MypawsDbContext context)
    {
        var email = "test@mypaw.in";
        if (context.Users.Any(u => u.Email == email)) return;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Name = "Test User",
            Status = UserStatus.Active,
            PhoneVerified = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            // Note: Password 'test123' is not stored as the system uses Google OAuth/Mock Auth.
            // This user can be accessed via Mock Auth (if enabled) or by logging in with a Google account of the same email.
        };

        context.Users.Add(user);
        context.SaveChanges();
        Console.WriteLine($"Seeded test user: {email}");
    }

    private static List<Breed> GetDefaultBreeds(Guid dogTypeId, Guid catTypeId)
    {
        // Fallback breeds if JSON loading fails
        return new List<Breed>
        {
            new() { Id = Guid.NewGuid(), PetTypeId = dogTypeId, Name = "Labrador Retriever", Slug = "labrador-retriever", SizeCategory = "large", IsPopular = true, DisplayOrder = 1 },
            new() { Id = Guid.NewGuid(), PetTypeId = dogTypeId, Name = "German Shepherd", Slug = "german-shepherd", SizeCategory = "large", IsPopular = true, DisplayOrder = 2 },
            new() { Id = Guid.NewGuid(), PetTypeId = dogTypeId, Name = "Golden Retriever", Slug = "golden-retriever", SizeCategory = "large", IsPopular = true, DisplayOrder = 3 },
            new() { Id = Guid.NewGuid(), PetTypeId = dogTypeId, Name = "Beagle", Slug = "beagle", SizeCategory = "medium", IsPopular = true, DisplayOrder = 4 },
            new() { Id = Guid.NewGuid(), PetTypeId = dogTypeId, Name = "Pomeranian", Slug = "pomeranian", SizeCategory = "small", IsPopular = true, DisplayOrder = 5 },
            new() { Id = Guid.NewGuid(), PetTypeId = dogTypeId, Name = "Indian Pariah", Slug = "indian-pariah", SizeCategory = "medium", IsPopular = true, DisplayOrder = 6 },
            new() { Id = Guid.NewGuid(), PetTypeId = catTypeId, Name = "Persian", Slug = "persian", SizeCategory = "medium", IsPopular = true, DisplayOrder = 1 },
            new() { Id = Guid.NewGuid(), PetTypeId = catTypeId, Name = "Siamese", Slug = "siamese", SizeCategory = "medium", IsPopular = true, DisplayOrder = 2 },
            new() { Id = Guid.NewGuid(), PetTypeId = catTypeId, Name = "Indian Domestic Cat", Slug = "indian-domestic-cat", SizeCategory = "medium", IsPopular = true, DisplayOrder = 3 },
        };
    }
}

// JSON deserialization classes
public class BreedsJsonData
{
    public List<PetTypeJson>? PetTypes { get; set; }
    public BreedsCollection? Breeds { get; set; }
}

public class PetTypeJson
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string PluralName { get; set; } = "";
}

public class BreedsCollection
{
    public List<BreedJson>? Dogs { get; set; }
    public List<BreedJson>? Cats { get; set; }
}

public class BreedJson
{
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string SizeCategory { get; set; } = "medium";
    public string? Origin { get; set; }
    public bool IsPopular { get; set; }
}
