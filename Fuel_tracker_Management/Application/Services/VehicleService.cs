using Application.DTO;
using Domain;
using Domain.Entities;
using Domain.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTO.VehicleDtos;

namespace Application.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicle;
        private readonly IUnitOfWork _uow;
        public VehicleService(IVehicleRepository vehicle, IUnitOfWork uow)
        {
            _vehicle = vehicle;
            _uow = uow;
            
        }
        public async Task<VehicleDto> CreateAsync(int userId, CreateVehicleRequest request, CancellationToken ct = default)
        {
            var vehicle = new Vehicle
            {
                UserId = userId,
                Label = request.Label.Trim(),
                Make = request.Make?.Trim(),
                Model = request.Model?.Trim(),
                Year = request.Year,
                FuelType = request.FuelType?.Trim()
            };

            await _vehicle.AddAsync(vehicle, ct);
            await _uow.SaveChangesAsync();

            return new VehicleDto(
                vehicle.Id,
                vehicle.Label,
                vehicle.Make,
                vehicle.Model,
                vehicle.Year,
                vehicle.FuelType,
                DateTime.Now
            );
        }

        public async Task DeleteAsync(int userId, int id, CancellationToken ct = default)
        {
            var vehicle = await _vehicle.GetByIdAsync(id, userId, ct);
            if (vehicle == null)
                throw new KeyNotFoundException("Vehicle not found.");

            await _vehicle.DeleteAsync(vehicle, ct);
            await _uow.SaveChangesAsync();
        }

        public async Task<VehicleDto?> GetByIdAsync(int userId, int id, CancellationToken ct = default)
        {
            var vehicle = await _vehicle.GetByIdAsync(id, userId, ct);
            if (vehicle == null)
                return null;

            return new VehicleDto(
                vehicle.Id,
                vehicle.Label,
                vehicle.Make,
                vehicle.Model,
                vehicle.Year,
                vehicle.FuelType,
                vehicle.CreatedAt
            );
        }

        public async Task<IEnumerable<VehicleDto>> GetForUserAsync(int userId, CancellationToken ct = default)
        {
            var vehicles = await _vehicle.GetByUserAsync(userId, ct);
            return vehicles.Select(vehicle => new VehicleDto(
                vehicle.Id,
                vehicle.Label,
                vehicle.Make,
                vehicle.Model,
                vehicle.Year,
                vehicle.FuelType,
                vehicle.CreatedAt
            ));
        }

        public async Task UpdateAsync(int userId, int id, UpdateVehicleRequest request, CancellationToken ct = default)
        {
            var vehicle = await _vehicle.GetByIdAsync(id, userId, ct);
            if (vehicle == null)
                throw new KeyNotFoundException("Vehicle not found.");

            vehicle.Label = request.Label.Trim();
            vehicle.Make = request.Make?.Trim();
            vehicle.Model = request.Model?.Trim();
            vehicle.Year = request.Year;
            vehicle.FuelType = request.FuelType?.Trim();

            await _vehicle.UpdateAsync(vehicle, ct);
            await _uow.SaveChangesAsync();
        }
    }
}
