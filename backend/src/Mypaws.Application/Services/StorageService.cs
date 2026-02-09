namespace Mypaws.Application.Services;

/// <summary>
/// Storage service interface - abstraction for file storage.
/// Implementations: LocalStorageService (dev), S3StorageService (prod)
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Upload a file and return its accessible URL
    /// </summary>
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string folder = "uploads");
    
    /// <summary>
    /// Delete a file by its URL or path
    /// </summary>
    Task DeleteAsync(string fileUrl);
    
    /// <summary>
    /// Check if a file exists
    /// </summary>
    Task<bool> ExistsAsync(string fileUrl);
}

/// <summary>
/// Local file storage implementation for development
/// </summary>
public class LocalStorageService : IStorageService
{
    private readonly string _basePath;
    private readonly string _baseUrl;
    
    public LocalStorageService(string basePath, string baseUrl)
    {
        _basePath = basePath;
        _baseUrl = baseUrl.TrimEnd('/');
        
        // Ensure base directory exists
        Directory.CreateDirectory(_basePath);
    }
    
    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, string folder = "uploads")
    {
        // Generate unique filename
        var extension = Path.GetExtension(fileName);
        var uniqueName = $"{Guid.NewGuid():N}{extension}";
        
        // Create folder path
        var folderPath = Path.Combine(_basePath, folder);
        Directory.CreateDirectory(folderPath);
        
        // Write file
        var filePath = Path.Combine(folderPath, uniqueName);
        using var fileStreamOut = File.Create(filePath);
        await fileStream.CopyToAsync(fileStreamOut);
        
        // Return relative URL (starts with /)
        // This allows frontend to handle domain/proxying
        // Using /api/uploads to route through Nginx /api location block
        return $"/api/uploads/{folder}/{uniqueName}";
    }
    
    public Task DeleteAsync(string fileUrl)
    {
        // Extract path from URL
        // Remove BaseUrl if present
        var urlPath = fileUrl.Replace(_baseUrl, "");
        
        // Handle /api/uploads -> maps to physical /uploads defined in _basePath
        // _basePath is .../wwwroot/uploads
        // urlPath is /api/uploads/folder/file.ext
        
        string relativePath;
        if (urlPath.StartsWith("/api/uploads", StringComparison.OrdinalIgnoreCase))
        {
            relativePath = urlPath.Substring("/api/uploads".Length).TrimStart('/');
        }
        else if (urlPath.StartsWith("/uploads", StringComparison.OrdinalIgnoreCase))
        {
            relativePath = urlPath.Substring("/uploads".Length).TrimStart('/');
        }
        else 
        {
            relativePath = urlPath.TrimStart('/');
        }
        
        var fullPath = Path.Combine(_basePath, relativePath);
        
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        
        return Task.CompletedTask;
    }
    
    public Task<bool> ExistsAsync(string fileUrl)
    {
        var urlPath = fileUrl.Replace(_baseUrl, "");
        
        string relativePath;
        if (urlPath.StartsWith("/api/uploads", StringComparison.OrdinalIgnoreCase))
        {
            relativePath = urlPath.Substring("/api/uploads".Length).TrimStart('/');
        }
        else if (urlPath.StartsWith("/uploads", StringComparison.OrdinalIgnoreCase))
        {
            relativePath = urlPath.Substring("/uploads".Length).TrimStart('/');
        }
        else 
        {
            relativePath = urlPath.TrimStart('/');
        }

        var fullPath = Path.Combine(_basePath, relativePath);
        return Task.FromResult(File.Exists(fullPath));
    }
}
