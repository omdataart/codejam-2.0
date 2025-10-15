using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Repositories.Interfaces
{
    public interface IFuelEntryRepository
    {
        Task<int> AddAsync(FuelEntry e, IDbTransaction? tx = null);
        Task UpdateAsync(FuelEntry e, IDbTransaction? tx = null);
        Task DeleteAsync(int id, IDbTransaction? tx = null);
        Task<FuelEntry?> GetByIdAsync(int id);
        Task<FuelEntry?> GetPreviousEntryAsync(int vehicleId, DateTime date);
        Task<IEnumerable<FuelEntry>> GetForVehicleAsync(int userId);
        Task DeleteAllByFuelByIdAsync(int userId);
    }
}
