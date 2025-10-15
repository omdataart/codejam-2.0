namespace Application.DTO
{
    public class VehicleDtos
    {
        public record VehicleDto(int Id, string Label, string? Make, string? Model, int? Year, string? FuelType, DateTime CreatedAt);
        public record CreateVehicleRequest(string Label, string? Make, string? Model, int? Year, string? FuelType);
        public record UpdateVehicleRequest(string Label, string? Make, string? Model, int? Year, string? FuelType);
    }
}
