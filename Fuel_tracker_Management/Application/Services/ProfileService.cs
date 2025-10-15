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

namespace Application.Services
{
    public class ProfileService : IProfileService
    {
        private readonly IUserRepository _users;
        private readonly IFuelEntryRepository _fuelEntries;
        private readonly IVehicleRepository _vehicles;
        private readonly IUnitOfWork _uow;
        public ProfileService(IUserRepository users, IUnitOfWork uow,IFuelEntryRepository fuelEntryRepository, IVehicleRepository vehicleRepository)
        {
            _users = users;
            _uow = uow;
            _fuelEntries= fuelEntryRepository;
            _vehicles= vehicleRepository;


        }

        public async Task DeleteAccountAsync(int userId, CancellationToken ct = default)
        {
            var user = await _users.GetByIdAsync(userId);
            if(user is not null)
            {
                await _fuelEntries.DeleteAllByFuelByIdAsync(userId);
                await _vehicles.DeleteAllVehicleByUserIdAsync(userId);
                await _users.DeleteAsync(user);
                await _uow.SaveChangesAsync();

            }
             
        }

        public Task<ProfileDto> GetProfileAsync(int userId, CancellationToken ct = default)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken ct = default)
        {
            var user = await _users.GetByIdAsync(userId, ct);
            if (user == null)
                throw new KeyNotFoundException("User not found.");

            // Update only the fields that are provided (not null)
            if (request.DisplayName != null)
                user.DisplayName = request.DisplayName;
            if (request.PreferredCurrency != null)
                user.PreferredCurrency = request.PreferredCurrency;
            if (request.PreferredDistanceUnit != null)
                user.PreferredDistanceUnit = request.PreferredDistanceUnit;
            if (request.PreferredVolumeUnit != null)
                user.PreferredVolumeUnit = request.PreferredVolumeUnit;
            if (request.TimeZone != null)
                user.TimeZone = request.TimeZone;

            await _users.UpdateAsync(user);
            await _uow.SaveChangesAsync();
        }
    }
}
