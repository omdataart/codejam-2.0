using Application.DTO;
using Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static Application.DTO.VehicleDtos;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _svc;
        public VehiclesController(IVehicleService svc) => _svc = svc;

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            try
            {
                var list = await _svc.GetForUserAsync(CurrentUserId, ct);
                return Ok(ApiResponse<IEnumerable<VehicleDto>>.Ok(list, "Vehicles fetched successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<IEnumerable<VehicleDto>>.Fail(ex.Message));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id, CancellationToken ct)
        {
            try
            {
                var v = await _svc.GetByIdAsync(CurrentUserId, id, ct);
                if (v == null)
                    return NotFound(ApiResponse<VehicleDto>.Fail("Vehicle not found"));
                return Ok(ApiResponse<VehicleDto>.Ok(v, "Vehicle fetched successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<VehicleDto>.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVehicleRequest req, CancellationToken ct)
        {
            try
            {
                var v = await _svc.CreateAsync(CurrentUserId, req, ct);
                return CreatedAtAction(nameof(Get), new { id = v.Id }, ApiResponse<VehicleDto>.Ok(v, "Vehicle created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<VehicleDto>.Fail(ex.Message));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVehicleRequest req, CancellationToken ct)
        {
            try
            {
                await _svc.UpdateAsync(CurrentUserId, id, req, ct);
                return Ok(ApiResponse<string>.Ok(null, "Vehicle updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            try
            {
                await _svc.DeleteAsync(CurrentUserId, id, ct);
                return Ok(ApiResponse<string>.Ok(null, "Vehicle deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
