using Domain;
using Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence
{
    public class UnitOfWork: IUnitOfWork
    {
        private readonly AppDbContext _ctx;
        private IDbContextTransaction? _tx;

        public IUserRepository Users { get; }
        public IVehicleRepository Vehicles { get; }
        //public IFuelEntryRepository FuelEntries { get; }
        public ISessionRepository Sessions { get; }

        //public UnitOfWork(AppDbContext ctx, IUserRepository users, IVehicleRepository vehicles, IFuelEntryRepository fuelEntries, ISessionRepository sessions)
       public UnitOfWork(AppDbContext ctx, IUserRepository users, IVehicleRepository vehicles,ISessionRepository sessions)
        {
            _ctx = ctx;
            Users = users;
            Vehicles = vehicles;
            //FuelEntries = fuelEntries;
            Sessions = sessions;
        }

        public async Task BeginTransactionAsync()
        {
            if (_tx == null)
                _tx = await _ctx.Database.BeginTransactionAsync();
        }

        public async Task CommitAsync()
        {
            if (_tx != null)
            {
                await _tx.CommitAsync();
                await _tx.DisposeAsync();
                _tx = null;
            }
        }

        public async Task RollbackAsync()
        {
            if (_tx != null)
            {
                await _tx.RollbackAsync();
                await _tx.DisposeAsync();
                _tx = null;
            }
        }

        public async Task<int> SaveChangesAsync() => await _ctx.SaveChangesAsync();
    }
}
