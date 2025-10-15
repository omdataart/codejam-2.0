using Application.DTO;
using Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Application.DTO.AuthDtos;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) => _auth = auth;

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserRequest req, CancellationToken ct)
        {
            try
            {
                
                var res = await _auth.RegisterAsync(req, HttpContext, ct);
                return Ok(ApiResponse<AuthResponse>.Ok(res, "Login Successfully"));
            }
            catch (Exception ex)
            {
               
                return BadRequest(ApiResponse<AuthResponse>.Fail("User with this email already exists."));
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
        {
            try
            {
                var res = await _auth.LoginAsync(req, HttpContext, ct);
                return Ok(ApiResponse<AuthResponse>.Ok(res, "Login Successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<AuthResponse>.Fail("Invalid Username and password."));
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(CancellationToken ct)
        {
            await _auth.LogoutAsync(HttpContext, ct);
            return Ok(ApiResponse<string>.Ok(null, "Logout Successfully"));
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me(CancellationToken ct)
        {
            var user = await _auth.GetCurrentUserAsync(HttpContext, ct);
            if (user == null)
                return Unauthorized(ApiResponse<object>.Fail("Unauthorized"));
            return Ok(ApiResponse<object>.Ok(user, "User fetched successfully"));
        }
    }
}
