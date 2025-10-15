using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Repositories.Interfaces
{
    public interface IStatsRepository
    {
        Task<IReadOnlyList<FuelEntry>> GetFuelEntriesForStatsAsync(
            int userId,
            int? vehicleId,
            DateTime from,
            DateTime to);
    }
}
