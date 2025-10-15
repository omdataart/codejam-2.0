using Domain.Entities;
using Domain.Repositories.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class FuelEntryRepository : IFuelEntryRepository
    {
        private readonly AppDbContext _context;

        public FuelEntryRepository(AppDbContext context)
        {
            _context = context;
        }

       
        public async Task<int> AddAsync(FuelEntry e, IDbTransaction? tx = null)
        {
            await _context.FuelEntries.AddAsync(e);
            await _context.SaveChangesAsync();
            return e.Id;
        }

        // ✅ Update existing fuel entry
        public async Task UpdateAsync(FuelEntry e, IDbTransaction? tx = null)
        {
            var existing = await _context.FuelEntries
                .FirstOrDefaultAsync(x => x.Id == e.Id && x.VehicleId == e.VehicleId);

            if (existing == null)
                throw new KeyNotFoundException($"Fuel entry with id {e.Id} not found.");

            _context.Entry(existing).CurrentValues.SetValues(e);
            await _context.SaveChangesAsync();
        }

        // ✅ Delete by Id
        public async Task DeleteAsync(int id, IDbTransaction? tx = null)
        {
            var entry = await _context.FuelEntries.FirstOrDefaultAsync(x => x.Id == id);
            if (entry == null)
                return;

            _context.FuelEntries.Remove(entry);
            await _context.SaveChangesAsync();
        }

        // ✅ Get by Id
        public async Task<FuelEntry?> GetByIdAsync(int id)
        {
            return await _context.FuelEntries.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        // ✅ Get the previous entry (for consumption calculation)
        public async Task<FuelEntry?> GetPreviousEntryAsync(int vehicleId, DateTime date)
        {
            return await _context.FuelEntries
                .Where(x => x.VehicleId == vehicleId && x.Date < date)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        // ✅ Get all fuel entries for a given vehicle and user in range
        public async Task<IEnumerable<FuelEntry>> GetForVehicleAsync(int userId)
        {
            return await _context.FuelEntries.AsNoTracking()
                .Include(x => x.Vehicle)
                .Where(x =>
                    x.Vehicle.UserId == userId)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task DeleteAllByFuelByIdAsync(int userId)
        {
            await _context.FuelEntries.Where(fe => fe.UserId == userId).ExecuteDeleteAsync();
        }
    }
}
