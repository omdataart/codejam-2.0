using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTO.VehicleDtos;

namespace Application.Services
{
    public interface IVehicleService
    {
        Task<VehicleDto> CreateAsync(int userId, CreateVehicleRequest request, CancellationToken ct = default);
        Task<VehicleDto?> GetByIdAsync(int userId, int id, CancellationToken ct = default);
        Task<IEnumerable<VehicleDto>> GetForUserAsync(int userId, CancellationToken ct = default);
        Task UpdateAsync(int userId, int id, UpdateVehicleRequest request, CancellationToken ct = default);
        Task DeleteAsync(int userId, int id, CancellationToken ct = default);
    }
}
