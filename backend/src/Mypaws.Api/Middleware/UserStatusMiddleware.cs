using System.Security.Claims;
using Mypaws.Application.Repositories;
using Mypaws.Domain.Entities;

namespace Mypaws.Api.Middleware;

public class UserStatusMiddleware
{
    private readonly RequestDelegate _next;

    public UserStatusMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserRepository userRepository)
    {
        // Skip check for logout and login endpoints so users can fix their session
        var path = context.Request.Path;
        if (path.StartsWithSegments("/api/v1/auth/logout") || 
            path.StartsWithSegments("/api/v1/auth/google") ||
            path.StartsWithSegments("/api/v1/auth/mock") || // For dev
            path.StartsWithSegments("/api/v1/auth/refresh"))
        {
            await _next(context);
            return;
        }

        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? context.User.FindFirst("sub")?.Value;

            if (Guid.TryParse(userIdStr, out var userId))
            {
                var user = await userRepository.FindByIdAsync(userId);
                // Emergency Hatch: Allow specific admin to login even if suspended to fix issues
                if (user != null && user.Email != "sanrajmalik@gmail.com" && (user.Status == UserStatus.Suspended || user.Status == UserStatus.Banned))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new { error = "account_suspended", message = "Your account has been suspended." });
                    return;
                }
            }
        }

        await _next(context);
    }
}
