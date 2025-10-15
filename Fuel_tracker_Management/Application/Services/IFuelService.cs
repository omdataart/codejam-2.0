
using Application.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface IFuelService
    {
        Task<FuelEntryDto> CreateAsync(int userId, CreateFuelEntryRequest request, CancellationToken ct = default);
        Task<FuelEntryDto?> GetByIdAsync(int userId, int id, CancellationToken ct = default);
        Task<PagedResult<FuelEntryDto>> QueryAsync(int userId, FuelQueryRequest query, CancellationToken ct = default);
        Task UpdateAsync(int userId, int id, UpdateFuelEntryRequest request, CancellationToken ct = default);
        Task DeleteAsync(int userId, int id, CancellationToken ct = default);
    }
}
