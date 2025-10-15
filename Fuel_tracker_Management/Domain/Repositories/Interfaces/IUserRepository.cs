using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        /// <summary>Attach a new user to the context. Does NOT call SaveChanges.</summary>
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        /// <summary>Mark user entity as modified. Does NOT call SaveChanges.</summary>
        Task UpdateAsync(User user, CancellationToken cancellationToken = default);
        /// <summary>Remove user entity. Does NOT call SaveChanges.</summary>
        Task DeleteAsync(User user, CancellationToken cancellationToken = default);

       
    }
}
