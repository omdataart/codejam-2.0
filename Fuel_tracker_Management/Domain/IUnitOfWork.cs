using Domain.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }
        IVehicleRepository Vehicles { get; }
        //IFuelEntryRepository FuelEntries { get; }
        ISessionRepository Sessions { get; }

        /// <summary>
        /// Save all pending changes in the current transaction scope.
        /// </summary>
        Task<int> SaveChangesAsync();

        /// <summary>
        /// Begin a manual database transaction (optional).
        /// </summary>
        Task BeginTransactionAsync();

        /// <summary>
        /// Commit an active transaction (optional).
        /// </summary>
        Task CommitAsync();

        /// <summary>
        /// Rollback an active transaction (optional).
        /// </summary>
        Task RollbackAsync();
    }
}
