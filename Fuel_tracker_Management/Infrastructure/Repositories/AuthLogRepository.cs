using Domain.Entities;
using Domain.Repositories.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class AuthLogRepository : IAuthLogRepository
    {
        private readonly AppDbContext _context;

        public AuthLogRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddAsync(AuthEvent e)
        {
            await _context.AuthEvents.AddAsync(e);
            await _context.SaveChangesAsync();
            return e.Id;
        }

        public async Task<AuthEvent?> GetByIdAsync(int id)
        {
            return await _context.AuthEvents.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<AuthEvent>> GetForUserAsync(int userId)
        {
            return await _context.AuthEvents.AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
    }
}