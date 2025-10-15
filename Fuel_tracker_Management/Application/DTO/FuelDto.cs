namespace Application.DTO
{
    public record FuelEntryDto(
        int Id,
        int VehicleId,
        DateTime Date,
        int OdometerKm,
        string? Station,
        string? Brand,
        string? Grade,
        decimal Liters,
        decimal TotalAmount,
        string? Notes,
        DateTime CreatedAt,
        // Derived fields (computed by service)
        int? DistanceSinceLastKm,
        decimal? UnitPrice,
        decimal? ConsumptionLPer100Km,
        decimal? CostPerKm
    );

    public record CreateFuelEntryRequest(int VehicleId, DateTime Date, int OdometerKm, string? Station, string? Brand, string? Grade, decimal Liters, decimal TotalAmount, string? Notes);
    public record UpdateFuelEntryRequest(DateTime Date, int OdometerKm, string? Station, string? Brand, string? Grade, decimal Liters, decimal TotalAmount, string? Notes);

    public record FuelQueryRequest(int? VehicleId, string? Brand, string? Grade, DateTime? From, DateTime? To, int Page = 1, int PageSize = 25);
    public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize);
}
