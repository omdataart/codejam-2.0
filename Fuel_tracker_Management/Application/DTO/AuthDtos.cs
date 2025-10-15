namespace Application.DTO
{
    public class AuthDtos
    {
        public record CreateUserRequest(string Email, string Password, string? DisplayName, string? PreferredCurrency);
        public record LoginRequest(string Email, string Password);
        public record AuthResponse(int UserId, string Email, string? DisplayName);
    }
}
