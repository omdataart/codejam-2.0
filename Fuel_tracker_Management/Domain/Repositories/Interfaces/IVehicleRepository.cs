using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Repositories.Interfaces
{
    public interface IVehicleRepository
    {
        Task<Vehicle?> GetByIdAsync(int id, int userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Vehicle>> GetByUserAsync(int userId, CancellationToken cancellationToken = default);
        /// <summary>Attach a new vehicle to the context. Does NOT call SaveChanges.</summary>
        Task AddAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
        /// <summary>Mark vehicle entity as modified. Does NOT call SaveChanges.</summary>
        Task UpdateAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
        /// <summary>Remove vehicle entity. Does NOT call SaveChanges.</summary>
        Task DeleteAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
        Task DeleteAllVehicleByUserIdAsync(int  userId, CancellationToken cancellationToken = default);
    }
}
