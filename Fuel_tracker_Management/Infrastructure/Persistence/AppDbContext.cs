using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Collections.Specialized.BitVector32;

namespace Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Vehicle> Vehicles => Set<Vehicle>();
        public DbSet<FuelEntry> FuelEntries => Set<FuelEntry>();
        public DbSet<Session> Sessions => Set<Session>();
        public DbSet<AuthEvent> AuthEvents => Set<AuthEvent>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(b =>
            {
                b.ToTable("Users");
                b.HasKey(x => x.Id);
                b.HasIndex(x => x.Email).IsUnique();

                b.Property(x => x.Email).HasMaxLength(256).IsRequired();
                b.Property(x => x.PasswordHash).HasMaxLength(512).IsRequired();
                b.Property(x => x.PreferredCurrency).HasMaxLength(4).HasDefaultValue("USD");
                b.Property(x => x.PreferredDistanceUnit).HasMaxLength(4).HasDefaultValue("km");
                b.Property(x => x.PreferredVolumeUnit).HasMaxLength(4).HasDefaultValue("L");

                // ✅ Cascade delete from User → Vehicles (keep)
                b.HasMany(x => x.Vehicles)
                 .WithOne(x => x.User)
                 .HasForeignKey(x => x.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

                // ✅ Cascade delete from User → FuelEntries (keep)
                b.HasMany(x => x.FuelEntries)
                 .WithOne(x => x.User)
                 .HasForeignKey(x => x.UserId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Vehicle>(b =>
            {
                b.ToTable("Vehicles");
                b.HasKey(x => x.Id);
                b.Property(x => x.Label).HasMaxLength(200).IsRequired();

                b.HasOne(x => x.User)
                 .WithMany(x => x.Vehicles)
                 .HasForeignKey(x => x.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

                // ✅ Disable cascade delete here to break multiple paths
                b.HasMany(x => x.FuelEntries)
                 .WithOne(x => x.Vehicle)
                 .HasForeignKey(x => x.VehicleId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<FuelEntry>(b =>
            {
                b.ToTable("FuelEntries");
                b.HasKey(x => x.Id);

                b.Property(x => x.Station).HasMaxLength(250);
                b.Property(x => x.Brand).HasMaxLength(100);
                b.Property(x => x.Grade).HasMaxLength(100);
                b.Property(x => x.TotalAmount).HasColumnType("decimal(10,2)");
                b.Property(x => x.Liters).HasColumnType("decimal(10,4)");

                // Keep relationships to User and Vehicle
                b.HasOne(x => x.User)
                 .WithMany(x => x.FuelEntries)
                 .HasForeignKey(x => x.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

                b.HasOne(x => x.Vehicle)
                 .WithMany(x => x.FuelEntries)
                 .HasForeignKey(x => x.VehicleId)
                 .OnDelete(DeleteBehavior.Restrict); // 🚫 prevent cascade path conflict

                b.HasIndex(x => new { x.UserId, x.VehicleId, x.Date });
            });
            modelBuilder.Entity<AuthEvent>(b =>
            {
                b.ToTable("AuthEvents");
                b.HasKey(x => x.Id);
                b.Property(x => x.EventType).HasMaxLength(64).IsRequired();
                b.Property(x => x.Description).HasMaxLength(512);
                b.Property(x => x.CreatedAt).IsRequired();

                b.HasOne(x => x.User)
                 .WithMany()
                 .HasForeignKey(x => x.UserId)
                 .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
