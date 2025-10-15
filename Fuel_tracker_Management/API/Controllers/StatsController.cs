using Application.DTO;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatsController : ControllerBase
    {
        private readonly IStatsService _svc;
        public StatsController(IStatsService svc) => _svc = svc;
        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet("overview")]
        public async Task<IActionResult> Overview([FromQuery] StatsOverviewRequest req, CancellationToken ct)
        {

            try
            {
               
                var to = DateTime.UtcNow;
                var from = to.AddDays(-req.WindowDays);

                var request = new StatsOverviewRequest(req.VehicleId, from, to, req.WindowDays);
                var result = await _svc.GetRollingStatsAsync(CurrentUserId, request, ct);

                return Ok(ApiResponse<object>.Ok(result, "Stats overview fetched successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpGet("brand-comparison")]
        public async Task<IActionResult> BrandComparison([FromQuery] StatsOverviewRequest req, CancellationToken ct)
        {
            try
            {
              
                var to = DateTime.UtcNow;
                var from = to.AddDays(-req.WindowDays);

                var request = new StatsOverviewRequest(req.VehicleId, from, to, req.WindowDays);
                var result = await _svc.GetBrandComparisonAsync(CurrentUserId, request);

                return Ok(ApiResponse<object>.Ok(result, "Brand comparison fetched successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        // 🔹 Chart 1: Cost per Liter Line Data
        [HttpGet("chart/cost-per-liter")]
        public async Task<IActionResult> CostPerLiterSeries([FromQuery] int? vehicleId, [FromQuery] int days = 30)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var to = DateTime.UtcNow;
                var from = to.AddDays(-days);
                var req = new StatsOverviewRequest(vehicleId, from, to, days);
                var result = await _svc.GetCostPerLiterSeriesAsync(userId, req);
                return Ok(ApiResponse<object>.Ok(result, "chart loaded"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }

        }

        // 🔹 Chart 2: Consumption Line Data
        [HttpGet("chart/consumption")]
        public async Task<IActionResult> ConsumptionSeries([FromQuery] int? vehicleId, [FromQuery] int days = 30)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var to = DateTime.UtcNow;
                var from = to.AddDays(-days);
                var req = new StatsOverviewRequest(vehicleId, from, to, days);
                var result = await _svc.GetConsumptionSeriesAsync(userId, req);
                return Ok(ApiResponse<object>.Ok(result, "consumption loaded"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
           
        }
    }
}
