namespace Application.DTO
{
    public record StatsOverviewRequest(int? VehicleId, DateTime From, DateTime To, int WindowDays = 30);
    public record RollingStatsDto(decimal AvgCostPerLiter, decimal AvgConsumptionLPer100Km, decimal AvgDistancePerDay, decimal AvgCostPerKm, decimal TotalSpend, int TotalDistance, DateTime From, DateTime To,string UnitSystem="Metric");
    public record BrandAggregateDto(string Brand, string Grade, decimal AvgCostPerLiter, decimal AvgConsumptionLPer100Km, int FillUpCount);
    public record BrandComparisonResult(IEnumerable<BrandAggregateDto> Aggregates);


    public record CostPerLiterPointDto(DateTime Date, decimal CostPerLiter);
    public  record ConsumptionPointDTO(DateTime Date, decimal ConsumptionLPer100Km);
}
