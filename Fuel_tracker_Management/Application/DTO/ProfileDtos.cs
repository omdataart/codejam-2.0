namespace Application.DTO
{
    public record ProfileDto(int UserId, string Email, string? DisplayName, string? PreferredCurrency, string PreferredDistanceUnit, string PreferredVolumeUnit, string? TimeZone);
    public record UpdateProfileRequest(string? DisplayName, string? PreferredCurrency, string PreferredDistanceUnit = "km", string PreferredVolumeUnit = "L", string? TimeZone = null);
}
