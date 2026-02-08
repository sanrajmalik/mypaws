using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Mypaws.Application.Repositories;
using Mypaws.Application.Services;
using Mypaws.Application.Interfaces;
using Mypaws.Infrastructure.Persistence;
using Mypaws.Infrastructure.Repositories;
using Mypaws.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Mypaws API", Version = "v1" });
});

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBreederRepository, BreederRepository>();

// Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBreederService, BreederService>();
builder.Services.AddScoped<IPaymentGatewayService, RazorpayService>();

// Storage Service - Local for dev, can swap to S3 for production
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
Directory.CreateDirectory(uploadsPath);
var baseUrl = builder.Configuration["App:BaseUrl"] ?? "http://localhost:5000";
builder.Services.AddSingleton<IStorageService>(new LocalStorageService(uploadsPath, baseUrl));

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MypawsDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost", "https://mypaws.in", "https://www.mypaws.in")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Auth
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        var jwtSecret = builder.Configuration["Auth:JwtSecret"] ?? "mypaws-dev-secret-key-minimum-32-characters-required";
        var key = System.Text.Encoding.UTF8.GetBytes(jwtSecret);

        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Auth:Issuer"] ?? "mypaws.in",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Auth:Audience"] ?? "mypaws-api",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };

        // Support Auth via Cookie (for existing functionality)
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("mypaws_access_token"))
                {
                    context.Token = context.Request.Cookies["mypaws_access_token"];
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mypaws API v1"));
}

app.UseCors("AllowFrontend");

// Serve static files (uploaded images)
var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
var uploadsDirectory = Path.Combine(wwwrootPath, "uploads");
Directory.CreateDirectory(uploadsDirectory);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsDirectory),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseMiddleware<Mypaws.Api.Middleware.UserStatusMiddleware>();
app.UseAuthorization();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// API version endpoint
app.MapGet("/api/v1", () => Results.Ok(new { name = "Mypaws API", version = "1.0.0" }));

app.MapControllers();

// Apply migrations and seed data on startup in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<MypawsDbContext>();
    db.Database.Migrate();
    SeedData.Initialize(db);
}

app.Run();
