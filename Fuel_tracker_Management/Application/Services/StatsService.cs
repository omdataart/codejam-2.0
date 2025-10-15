using Application.DTO;
using Domain.Entities;
using Domain.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Application.Services
{
    public class StatsService : IStatsService
    {
        private readonly IStatsRepository _statsRepository;

        public StatsService(IStatsRepository statsRepository)
        {
            _statsRepository = statsRepository;
        }
        public async Task<BrandComparisonResult> GetBrandComparisonAsync(int userId, StatsOverviewRequest request, CancellationToken ct = default)
        {
            var entries = await _statsRepository.GetFuelEntriesForStatsAsync(
                 userId, request.VehicleId, request.From, request.To);
            
            var aggregates = entries 
                .GroupBy(x => new { Brand = Regex.Replace(x.Brand ?? "Unknown", @"\s+", " ").Trim().ToLower(), Grade = Regex.Replace(x.Grade ?? "Unknown", @"\s+", " ").Trim().ToLower() })
                .Select(g =>
                {
                    var totalLiters = g.Sum(x => x.Liters);
                    var totalAmount = g.Sum(x => x.TotalAmount);

                    var distances = g.Zip(g.Skip(1), (a, b) => b.OdometerKm - a.OdometerKm)
                                     .Where(d => d > 0).ToList();

                    var totalDistance = distances.Sum();

                    var avgCostPerLiter = totalLiters > 0 ? totalAmount / totalLiters : 0;
                    var avgConsumption = totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
                    var avgCostPerKm = totalDistance > 0 ? totalAmount / totalDistance : 0;

                    return new BrandAggregateDto(
                        Brand: g.Key.Brand ?? "Unknown",
                        Grade: g.Key.Grade ?? "Unknown",
                        AvgCostPerLiter: Math.Round((decimal)avgCostPerLiter, 2),
                        AvgConsumptionLPer100Km: Math.Round((decimal)avgConsumption, 1),
                        //AvgCostPerKm: Math.Round((double)avgCostPerKm, 2),
                        FillUpCount: g.Count()
                    );
                })
                .OrderByDescending(x => x.FillUpCount)
                .ToList();

            return new BrandComparisonResult(aggregates);
        }

        public async Task<RollingStatsDto> GetRollingStatsAsync(int userId, StatsOverviewRequest request, CancellationToken ct = default)
        {
            var entries = await _statsRepository.GetFuelEntriesForStatsAsync(
              userId, request.VehicleId, request.From, request.To);

            if (!entries.Any())
                return new RollingStatsDto(0, 0, 0, 0, 0, 0, request.From, request.To);

            decimal totalLiters = 0, totalAmount = 0, totalDistance = 0;
            FuelEntry? prev = null;

            foreach (var e in entries)
            {
                if (prev != null && e.OdometerKm > prev.OdometerKm)
                {
                    totalDistance += e.OdometerKm - prev.OdometerKm;
                    totalLiters += e.Liters;
                    totalAmount += e.TotalAmount;
                }
                prev = e;
            }

            var totalDays = (entries.Last().Date - entries.First().Date).TotalDays;
            totalDays = totalDays <= 0 ? 1 : totalDays;

            return new RollingStatsDto(
                AvgCostPerLiter: totalLiters > 0 ? Math.Round((decimal)(totalAmount / totalLiters), 2) : 0,
                AvgConsumptionLPer100Km: totalDistance > 0 ? Math.Round((decimal)((totalLiters / totalDistance) * 100), 1) : 0,
                AvgDistancePerDay: Math.Round((decimal)(totalDistance / (decimal)totalDays), 2),
                AvgCostPerKm: totalDistance > 0 ? Math.Round((decimal)(totalAmount / totalDistance), 2) : 0,
                TotalSpend: Math.Round((decimal)totalAmount, 2),
                TotalDistance: (int)totalDistance,
                From: request.From,
                To: request.To
            );
        }
        // 🔹 Chart 1: Cost per liter over time
        public async Task<IEnumerable<CostPerLiterPointDto>> GetCostPerLiterSeriesAsync(int userId, StatsOverviewRequest req, CancellationToken ct = default)
        {
            var entries = await _statsRepository.GetFuelEntriesForStatsAsync(userId, req.VehicleId, req.From, req.To);
            if (!entries.Any()) return new List<CostPerLiterPointDto>();

            return entries.Select(e => new CostPerLiterPointDto(
                e.Date,
                e.Liters > 0 ? Math.Round((decimal)(e.TotalAmount / e.Liters), 2) : 0
            ));
        }

        // 🔹 Chart 2: Consumption over time
        public async Task<IEnumerable<ConsumptionPointDTO>> GetConsumptionSeriesAsync(int userId, StatsOverviewRequest req, CancellationToken ct = default)
        {
            var entries = (await _statsRepository.GetFuelEntriesForStatsAsync(userId, req.VehicleId, req.From, req.To))
                          .OrderBy(e => e.Date).ToList();

            var points = new List<ConsumptionPointDTO>();
            for (int i = 1; i < entries.Count; i++)
            {
                var prev = entries[i - 1];
                var curr = entries[i];
                var distance = curr.OdometerKm - prev.OdometerKm;
                var consumption = distance > 0 ? (curr.Liters / distance) * 100 : 0;

                points.Add(new ConsumptionPointDTO(curr.Date, Math.Round((decimal)consumption, 1)));
            }

            return points;
        }
    }
}
