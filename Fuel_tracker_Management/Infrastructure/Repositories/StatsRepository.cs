using Domain.Entities;
using Domain.Repositories.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class StatsRepository : IStatsRepository
    {
        private readonly AppDbContext _context;

        public StatsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<FuelEntry>> GetFuelEntriesForStatsAsync(
            int userId,
            int? vehicleId,
            DateTime from,
            DateTime to)
        {
            var query = _context.FuelEntries
                .Include(x => x.Vehicle)
                .AsNoTracking()
                .Where(x => x.Vehicle.UserId == userId &&
                            x.Date >= from && x.Date <= to);

            if (vehicleId.HasValue)
                query = query.Where(x => x.VehicleId == vehicleId.Value);

            return await query
                .OrderBy(x => x.Date)
                .ToListAsync();
        }
    }
}

