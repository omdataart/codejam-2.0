using Application.DTO;
using Azure.Core;
using Domain;
using Domain.Entities;
using Domain.Repositories.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using static Application.DTO.AuthDtos;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _users;
        private readonly IUnitOfWork _uow;
        private readonly IPasswordHasher<User> _hasher;
        private readonly IAuthLogRepository _authLogs; // Add this

        public AuthService(
            IUserRepository users,
            IUnitOfWork uow,
            IPasswordHasher<User> hasher,
            IAuthLogRepository authLogs) // Add this
        {
            _users = users;
            _uow = uow;
            _hasher = hasher;
            _authLogs = authLogs;
        }

        public async Task<AuthResponse> RegisterAsync(CreateUserRequest request, HttpContext httpContext, CancellationToken ct = default)
        {
            // check if email already exists
            var existing = await _users.GetByEmailAsync(request.Email, ct);
            if (existing != null)
                throw new InvalidOperationException("User with this email already exists.");

            var user = new User
            {
                Email = request.Email.Trim().ToLowerInvariant(),
                DisplayName = request.DisplayName ?? request.Email.Split('@')[0],
                PreferredCurrency = request.PreferredCurrency ?? "USD",
                PreferredDistanceUnit = "km",
                PreferredVolumeUnit = "L",
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _hasher.HashPassword(user, request.Password);

            await _users.AddAsync(user, ct);
            await _uow.SaveChangesAsync();

            // create session immediately after registration
            await SignInAsync(httpContext, user, ct);
			await LogAuthEventAsync(user.Id, "SignIn", "User signed  in successfully from registration", ct);
            return new AuthResponse(user.Id, user.Email, user.DisplayName);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request, HttpContext httpContext, CancellationToken ct = default)
        {
            var user = await _users.GetByEmailAsync(request.Email, ct);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials.");

            var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verify == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Invalid credentials.");

            await SignInAsync(httpContext, user, ct);
            await LogAuthEventAsync(user.Id, "SignIn", "User signed in successfully", ct);
            return new AuthResponse(user.Id, user.Email, user.DisplayName);
        }

        public async Task LogoutAsync(HttpContext httpContext, CancellationToken ct = default)
        {

            var curretnUser = await GetCurrentUserAsync(httpContext,ct);
            httpContext.Response.Cookies.Delete(".Aspire.Dashboard.Antiforgery");
            httpContext.Response.Cookies.Delete(".Aspire.Dashboard.Auth");
            await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await LogAuthEventAsync(curretnUser?.UserId, "SignOut", "User signed out successfully", ct);

        }

        public async Task<ProfileDto?> GetCurrentUserAsync(HttpContext httpContext, CancellationToken ct = default)
        {
            var idClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (idClaim == null) return null;

            if (!int.TryParse(idClaim, out var userId)) return null;

            var user = await _users.GetByIdAsync(userId, ct);
            if (user == null) return null;

            return new ProfileDto(
                user.Id,
                user.Email,
                user.DisplayName,
                user.PreferredCurrency,
                user.PreferredDistanceUnit,
                user.PreferredVolumeUnit,
                user.TimeZone
            );
        }

        private async Task  SignInAsync(HttpContext httpContext, User user, CancellationToken ct = default)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.DisplayName ?? user.Email),
                new(ClaimTypes.Email, user.Email)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await httpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new Microsoft.AspNetCore.Authentication.AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
                });
        }

        public async Task LogAuthEventAsync(int? userId, string eventType, string? description = null, CancellationToken ct = default)
        {
            var evt = new AuthEvent
            {
                UserId = userId,
                EventType = eventType,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };
            await _authLogs.AddAsync(evt);
        }
    }
}