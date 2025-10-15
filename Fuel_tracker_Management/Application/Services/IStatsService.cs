using Application.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface IStatsService
    {
        Task<RollingStatsDto> GetRollingStatsAsync(int userId, StatsOverviewRequest request, CancellationToken ct = default);
        Task<BrandComparisonResult> GetBrandComparisonAsync(int userId, StatsOverviewRequest request, CancellationToken ct = default);

        Task<IEnumerable<CostPerLiterPointDto>> GetCostPerLiterSeriesAsync(int userId, StatsOverviewRequest request, CancellationToken ct = default);
        Task<IEnumerable<ConsumptionPointDTO>> GetConsumptionSeriesAsync(int userId, StatsOverviewRequest request, CancellationToken ct = default);

    }
}
