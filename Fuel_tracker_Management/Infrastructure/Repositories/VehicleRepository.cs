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
    public class VehicleRepository : IVehicleRepository
    {
        private readonly AppDbContext _ctx;

        public VehicleRepository(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<Vehicle?> GetByIdAsync(int id, int userId, CancellationToken cancellationToken = default)
        {
            return await _ctx.Vehicles
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId, cancellationToken);
        }

        public async Task<IEnumerable<Vehicle>> GetByUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _ctx.Vehicles
                .AsNoTracking()
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.Label)
                .ToListAsync(cancellationToken);
        }

        public Task AddAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
        {
            _ctx.Vehicles.Add(vehicle);
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
        {
            _ctx.Vehicles.Update(vehicle);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
        {
            _ctx.Vehicles.Remove(vehicle);
            return Task.CompletedTask;
        }

        public  Task DeleteAllVehicleByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            _ctx.Vehicles.Where(v => v.UserId == userId).ExecuteDelete();
            return Task.CompletedTask;
        }
    }
}
