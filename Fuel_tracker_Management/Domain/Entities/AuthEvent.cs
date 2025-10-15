using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class AuthEvent
    {
        public int Id { get; set; }
        public int? UserId { get; set; } // Nullable for events before user is known (e.g., failed login)
        public string EventType { get; set; } = null!; // e.g., "SignIn", "PasswordResetRequest"
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
