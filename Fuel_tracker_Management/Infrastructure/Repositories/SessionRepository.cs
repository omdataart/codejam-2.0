using Domain.Entities;
using Domain.Repositories.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class SessionRepository : ISessionRepository
    {
        private readonly AppDbContext _ctx;

        public SessionRepository(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        public Task CreateAsync(Session session, CancellationToken cancellationToken = default)
        {
            _ctx.Sessions.Add(session);
            return Task.CompletedTask;
        }

        public async Task<Session?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _ctx.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        }

        public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            // Attach a stub entity and remove to avoid an extra query
            var stub = new Session { Id = id };
            _ctx.Entry(stub).State = EntityState.Deleted;
            return Task.CompletedTask;
        }

        public Task DeleteAllForUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            // Use a query to load sessions and remove them - EF Core doesn't support bulk delete by default.
            var sessions = _ctx.Sessions.Where(s => s.UserId == userId);
            _ctx.Sessions.RemoveRange(sessions);
            return Task.CompletedTask;
        }
    }
}