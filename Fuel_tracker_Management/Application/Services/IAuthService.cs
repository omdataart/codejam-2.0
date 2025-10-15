using Application.DTO;
using Microsoft.AspNetCore.Http;
using System.Threading;
using System.Threading.Tasks;
using static Application.DTO.AuthDtos;

namespace Application.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(CreateUserRequest request, HttpContext httpContext, CancellationToken ct = default);
        Task<AuthResponse> LoginAsync(LoginRequest request, HttpContext httpContext, CancellationToken ct = default);
        Task LogoutAsync(HttpContext httpContext, CancellationToken ct = default);
        Task<ProfileDto?> GetCurrentUserAsync(HttpContext httpContext, CancellationToken ct = default);

        // Add this:
        Task LogAuthEventAsync(int? userId, string eventType, string? description = null, CancellationToken ct = default);
    }
}
