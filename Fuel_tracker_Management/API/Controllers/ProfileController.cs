using Application.DTO;
using Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _svc;
        public ProfileController(IProfileService svc) => _svc = svc;
        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetProfile(CancellationToken ct)
        {
            try
            {
                var p = await _svc.GetProfileAsync(CurrentUserId, ct);
                if (p == null)
                    return NotFound(ApiResponse<ProfileDto>.Fail("Profile not found"));
                return Ok(ApiResponse<ProfileDto>.Ok(p, "Profile fetched successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<ProfileDto>.Fail(ex.Message));
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req, CancellationToken ct)
        {
            try
            {
                await _svc.UpdateProfileAsync(CurrentUserId, req, ct);
                return Ok(ApiResponse<string>.Ok(null, "Profile updated successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAccount(CancellationToken ct)
        {
            try
            {
                await _svc.DeleteAccountAsync(CurrentUserId, ct);
                return Ok(ApiResponse<string>.Ok(null, "Account deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}
