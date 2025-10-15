using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class FuelEntry
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VehicleId { get; set; }
        public DateTime Date { get; set; }
        public int OdometerKm { get; set; }
        public string? Station { get; set; }
        public string? Brand { get; set; }
        public string? Grade { get; set; }
        public decimal Liters { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public Vehicle? Vehicle { get; set; }
    }
}
