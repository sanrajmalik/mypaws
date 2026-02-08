using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Mypaws.Application.Services;
using SkiaSharp;

namespace Mypaws.Api.Controllers;

[ApiController]
[Route("api/v1/images")]
public class ImagesController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly IAuthService _authService;
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB
    private readonly string[] _allowedTypes = { "image/jpeg", "image/png", "image/webp", "image/gif" };
    private const int MaxImageDimension = 1920; // Max width/height
    private const int CompressionQuality = 80; // JPEG/WebP quality
    
    public ImagesController(IStorageService storageService, IAuthService authService)
    {
        _storageService = storageService;
        _authService = authService;
    }
    
    /// <summary>
    /// Upload one or more images (automatically compressed)
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(52_428_800)] // 50MB total
    public async Task<ActionResult<ImageUploadResponse>> Upload([FromForm] List<IFormFile> files)
    {
        // Validate auth
        var token = Request.Cookies["mypaws_access_token"] 
            ?? Request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "");
        
        if (string.IsNullOrEmpty(token) || _authService.ValidateToken(token) == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }
        
        if (files == null || files.Count == 0)
        {
            return BadRequest(new { error = "no_files", error_description = "No files uploaded" });
        }
        
        if (files.Count > 10)
        {
            return BadRequest(new { error = "too_many_files", error_description = "Maximum 10 files allowed" });
        }
        
        var uploadedUrls = new List<UploadedImage>();
        var errors = new List<string>();
        
        foreach (var file in files)
        {
            // Validate file size
            if (file.Length > _maxFileSize)
            {
                errors.Add($"{file.FileName}: File too large (max 10MB)");
                continue;
            }
            
            // Validate content type
            if (!_allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                errors.Add($"{file.FileName}: Invalid file type (allowed: JPEG, PNG, WebP, GIF)");
                continue;
            }
            
            try
            {
                // Read and compress the image
                using var inputStream = file.OpenReadStream();
                var (compressedStream, contentType, originalSize, compressedSize) = await CompressImageAsync(inputStream, file.ContentType);
                
                try
                {
                    // Upload compressed image
                    var url = await _storageService.UploadAsync(compressedStream, file.FileName, contentType, "pet-images");
                    
                    uploadedUrls.Add(new UploadedImage(
                        Url: url,
                        FileName: file.FileName,
                        ContentType: contentType,
                        Size: compressedSize,
                        OriginalSize: originalSize,
                        Compressed: compressedSize < originalSize
                    ));
                }
                finally
                {
                    await compressedStream.DisposeAsync();
                }
            }
            catch (Exception ex)
            {
                errors.Add($"{file.FileName}: Upload failed - {ex.Message}");
            }
        }
        
        return Ok(new ImageUploadResponse(
            Images: uploadedUrls,
            Errors: errors.Count > 0 ? errors : null
        ));
    }
    
    /// <summary>
    /// Compress and resize image using SkiaSharp
    /// </summary>
    private async Task<(Stream stream, string contentType, long originalSize, long compressedSize)> CompressImageAsync(Stream inputStream, string originalContentType)
    {
        // Read the input stream to memory
        using var memoryStream = new MemoryStream();
        await inputStream.CopyToAsync(memoryStream);
        var originalSize = memoryStream.Length;
        memoryStream.Position = 0;
        
        // Decode the image
        using var originalBitmap = SKBitmap.Decode(memoryStream);
        if (originalBitmap == null)
        {
            throw new InvalidOperationException("Failed to decode image");
        }
        
        // Calculate new dimensions (maintain aspect ratio)
        var width = originalBitmap.Width;
        var height = originalBitmap.Height;
        
        if (width > MaxImageDimension || height > MaxImageDimension)
        {
            var ratio = Math.Min((float)MaxImageDimension / width, (float)MaxImageDimension / height);
            width = (int)(width * ratio);
            height = (int)(height * ratio);
        }
        
        // Resize if needed
        SKBitmap resizedBitmap;
        if (width != originalBitmap.Width || height != originalBitmap.Height)
        {
            resizedBitmap = originalBitmap.Resize(new SKImageInfo(width, height), SKFilterQuality.High);
        }
        else
        {
            resizedBitmap = originalBitmap;
        }
        
        try
        {
            // Encode to WebP for best compression (or JPEG for compatibility)
            using var image = SKImage.FromBitmap(resizedBitmap);
            
            // Use WebP for best compression
            var outputStream = new MemoryStream();
            using (var data = image.Encode(SKEncodedImageFormat.Webp, CompressionQuality))
            {
                data.SaveTo(outputStream);
            }
            
            outputStream.Position = 0;
            return (outputStream, "image/webp", originalSize, outputStream.Length);
        }
        finally
        {
            if (resizedBitmap != originalBitmap)
            {
                resizedBitmap.Dispose();
            }
        }
    }
    
    /// <summary>
    /// Delete an image by URL
    /// </summary>
    [HttpDelete]
    public async Task<ActionResult> Delete([FromQuery] string url)
    {
        // Validate auth
        var token = Request.Cookies["mypaws_access_token"] 
            ?? Request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "");
        
        if (string.IsNullOrEmpty(token) || _authService.ValidateToken(token) == null)
        {
            return Unauthorized(new { error = "unauthorized", error_description = "Authentication required" });
        }
        
        if (string.IsNullOrEmpty(url))
        {
            return BadRequest(new { error = "missing_url", error_description = "URL is required" });
        }
        
        await _storageService.DeleteAsync(url);
        return NoContent();
    }
}

public record UploadedImage(string Url, string FileName, string ContentType, long Size, long OriginalSize = 0, bool Compressed = false);
public record ImageUploadResponse(List<UploadedImage> Images, List<string>? Errors);
