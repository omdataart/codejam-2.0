using Application.DTO;
using Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FuelEntriesController : ControllerBase
    {
        private readonly IFuelService _svc;
        public FuelEntriesController(IFuelService svc) => _svc = svc;

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> Query([FromQuery] FuelQueryRequest q, CancellationToken ct)
        {
            try
            {
                var page = await _svc.QueryAsync(CurrentUserId, q, ct);
                return Ok(ApiResponse<PagedResult<FuelEntryDto>>.Ok(page, "Fuel entries fetched successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<PagedResult<FuelEntryDto>>.Fail(ex.Message));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id, CancellationToken ct)
        {
            try
            {
                var e = await _svc.GetByIdAsync(CurrentUserId, id, ct);
                if (e == null)
                    return NotFound(ApiResponse<FuelEntryDto>.Fail("Fuel entry not found"));
                return Ok(ApiResponse<FuelEntryDto>.Ok(e, "Fuel entry fetched successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<FuelEntryDto>.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFuelEntryRequest req, CancellationToken ct)
        {
            try
            {
                var created = await _svc.CreateAsync(CurrentUserId, req, ct);
                return CreatedAtAction(nameof(Get), new { id = created.Id }, ApiResponse<FuelEntryDto>.Ok(created, "Fuel entry created successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<FuelEntryDto>.Fail(ex.Message));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateFuelEntryRequest req, CancellationToken ct)
        {
            try
            {
                await _svc.UpdateAsync(CurrentUserId, id, req, ct);
                return Ok(ApiResponse<string>.Ok(null, "Fuel entry updated successfully"));
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
                return Ok(ApiResponse<string>.Ok(null, "Fuel entry deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
