using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? DisplayName { get; set; }
        public string? PreferredCurrency { get; set; }
        public string PreferredDistanceUnit { get; set; } = "km";
        public string PreferredVolumeUnit { get; set; } = "L";
        public string? TimeZone { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
        public ICollection<FuelEntry> FuelEntries { get; set; } = new List<FuelEntry>();
    }
}
