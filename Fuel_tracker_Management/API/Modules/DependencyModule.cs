using Application.Services;
using Domain;
using Domain.Entities;
using Domain.Repositories.Interfaces;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Modules
{
    public static class DependencyModule
    {
        public static IServiceCollection AddProjectDependencies(this IServiceCollection services, string? sqlConnectionString)
        {
            // 1️⃣ DbContext
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(sqlConnectionString ?? throw new InvalidOperationException("SQL connection string missing"));
            });

            // 2️⃣ Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IVehicleRepository, VehicleRepository>();
           services.AddScoped<IFuelEntryRepository, FuelEntryRepository>();
            services.AddScoped<ISessionRepository, SessionRepository>();
            services.AddScoped<IStatsRepository, StatsRepository>();
            services.AddScoped<IAuthLogRepository, AuthLogRepository>();

            // 3️⃣ UnitOfWork
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // 4️⃣ Application Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IVehicleService, VehicleService>();
             services.AddScoped<IFuelService, FuelService>();
            services.AddScoped<IStatsService, StatsService>();
            services.AddScoped<IProfileService, ProfileService>();
            

            // 5️⃣ Password hasher (for user auth)
            services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

            return services;
        }
    }
}
