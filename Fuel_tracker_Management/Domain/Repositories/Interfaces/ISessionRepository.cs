using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Repositories.Interfaces
{
    public interface ISessionRepository
    {
        /// <summary>Create a new server-side session (attach to context). Does NOT call SaveChanges.</summary>
        Task CreateAsync(Session session, CancellationToken cancellationToken = default);

        Task<Session?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

        /// <summary>Delete a session by id. Does NOT call SaveChanges.</summary>
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

        /// <summary>Delete all sessions for a given user. Does NOT call SaveChanges.</summary>
        Task DeleteAllForUserAsync(int userId, CancellationToken cancellationToken = default);
    }
}
