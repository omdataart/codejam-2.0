using Application.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface IProfileService
    {
        Task<ProfileDto> GetProfileAsync(int userId, CancellationToken ct = default);
        Task UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default);
        Task DeleteAccountAsync(int userId, CancellationToken ct = default); // hard delete
    }
}
