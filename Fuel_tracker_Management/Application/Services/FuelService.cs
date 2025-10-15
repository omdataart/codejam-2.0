using Application.DTO;
using Domain;
using Domain.Entities;
using Domain.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class FuelService : IFuelService
    {
        private readonly IFuelEntryRepository _fuelEntries;
        private readonly IVehicleRepository _vehicles;
        private readonly IUnitOfWork _uow;

        public FuelService(IFuelEntryRepository fuelEntries, IVehicleRepository vehicles, IUnitOfWork uow)
        {
            _fuelEntries = fuelEntries;
            _vehicles = vehicles;
            _uow = uow;
        }

        public async Task<FuelEntryDto> CreateAsync(int userId, CreateFuelEntryRequest request, CancellationToken ct = default)
        {
            // Ensure vehicle belongs to user
            var vehicle = await _vehicles.GetByIdAsync(request.VehicleId, userId, ct);
            if (vehicle == null)
                throw new KeyNotFoundException("Vehicle not found.");


            // check odometer validation

            var fuelDetails = await _fuelEntries.GetPreviousEntryAsync(request.VehicleId, DateTime.Now);

            if (fuelDetails is not null && fuelDetails.OdometerKm  > request.OdometerKm )
                throw new KeyNotFoundException("Odo meter should be greater than prev odo meter");

            var entry = new FuelEntry
            {
                UserId = userId,
                VehicleId = request.VehicleId,
                Date = request.Date,
                OdometerKm = request.OdometerKm,
                Liters = request.Liters,
                TotalAmount = request.TotalAmount,
                Station = request.Station?.Trim().ToLower(),
                Brand = request.Brand?.Trim().ToLower(),
                Grade = request.Grade?.Trim().ToLower()
            };

            entry.Id = await _fuelEntries.AddAsync(entry);
            // No need to call _uow.SaveChangesAsync() if repository does it

            return new FuelEntryDto(
                entry.Id,
                 entry.VehicleId,
                 entry.Date,
                entry.OdometerKm,
                entry.Station,
                 entry.Grade,
                    entry.Brand,
                entry.Liters,
                entry.TotalAmount,
                entry.Notes,
                entry.CreatedAt,
                0,
                0,
                0,
                0
            );
        }

        public async Task UpdateAsync(int userId, int id, UpdateFuelEntryRequest request, CancellationToken ct = default)
        {
            var entry = await _fuelEntries.GetByIdAsync(id);
            if (entry == null || entry.UserId != userId)
                throw new KeyNotFoundException("Fuel entry not found.");

            entry.Date = request.Date;
            entry.OdometerKm = request.OdometerKm;
            entry.Liters = request.Liters;
            entry.TotalAmount = request.TotalAmount;
            entry.Station = request.Station?.Trim();
            entry.Brand = request.Brand?.Trim();
            entry.Grade = request.Grade?.Trim();

            await _fuelEntries.UpdateAsync(entry);
        }

        public async Task DeleteAsync(int userId, int id, CancellationToken ct = default)
        {
            var entry = await _fuelEntries.GetByIdAsync(id);
            if (entry == null || entry.UserId != userId)
                throw new KeyNotFoundException("Fuel entry not found.");

            await _fuelEntries.DeleteAsync(id);
        }

        public async Task<FuelEntryDto?> GetByIdAsync(int userId, int id, CancellationToken ct = default)
        {
            var entry = await _fuelEntries.GetByIdAsync(id);
            if (entry == null || entry.UserId != userId)
                return null;

            return new FuelEntryDto(
                entry.Id,
                 entry.VehicleId,
                 entry.Date,
                entry.OdometerKm,
                entry.Station,
                 entry.Grade,
                    entry.Brand,
                entry.Liters,
                entry.TotalAmount,
                entry.Notes,
                entry.CreatedAt,
                0,
                0,
                0,
                0
            );
        }

        //public async Task<IEnumerable<FuelEntryDto>> GetForVehicleAsync(int userId, int vehicleId, DateTime from, DateTime to, CancellationToken ct = default)
        //{
        //    var entries = await _fuelEntries.GetForVehicleAsync(userId, vehicleId, from, to);
        //    return entries.Select(entry => new FuelEntryDto(
        //        entry.Id,
        //         entry.VehicleId,
        //         entry.Date,
        //        entry.OdometerKm,
        //        entry.Station,
        //         entry.Grade,
        //            entry.Brand,
        //        entry.Liters,
        //        entry.TotalAmount,
        //        entry.Notes,
        //        entry.CreatedAt,
        //        0,
        //        0,
        //        0,
        //        0
        //    ));
        //}
        public async Task<PagedResult<FuelEntryDto>> QueryAsync(int userId, FuelQueryRequest query, CancellationToken ct = default)
        {
            var q = await _fuelEntries.GetForVehicleAsync(userId);

            if (query.VehicleId.HasValue)
                q = q.Where(x => x.VehicleId == query.VehicleId.Value);

            if (!string.IsNullOrWhiteSpace(query.Brand))
                q = q.Where(x => x.Brand == query.Brand);

            if (!string.IsNullOrWhiteSpace(query.Grade))
                q = q.Where(x => x.Grade == query.Grade);

            if (query.From.HasValue)
                q = q.Where(x => x.Date >= query.From.Value);

            if (query.To.HasValue)
                q = q.Where(x => x.Date <= query.To.Value);

            var total =  q.Count();

            var items =  q
                .OrderByDescending(x => x.Date)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(x => new FuelEntryDto(
                    x.Id,
                    x.VehicleId,
                    x.Date,
                    x.OdometerKm,
                    x.Station,
                    x.Brand,
                    x.Grade,
                    x.Liters,
                    x.TotalAmount,
                    x.Notes,
                    x.CreatedAt,
                    
                    null, // DistanceSinceLastKm (compute if needed)
                    x.Liters > 0 ? x.TotalAmount / x.Liters : null, // UnitPrice
                    null, // ConsumptionLPer100Km (compute if needed)
                    null  // CostPerKm (compute if needed)
                ));

            return new PagedResult<FuelEntryDto>(
                items,
                total,
                query.Page,
                query.PageSize
            );
        }
    }
}
