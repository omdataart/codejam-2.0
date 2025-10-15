using Domain.Entities;
using System.Threading.Tasks;

namespace Domain.Repositories.Interfaces
{
    public interface IAuthLogRepository
    {
        Task<int> AddAsync(AuthEvent e);
        Task<AuthEvent?> GetByIdAsync(int id);
        Task<IEnumerable<AuthEvent>> GetForUserAsync(int userId);
    }
}