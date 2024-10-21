using YouTube.Server.Data;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace YouTube.Server.Repository
{
    public class Notify : INotify
    {
        private readonly YourDbContext _context;

        public Notify(YourDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Notification>> GetAllNotificationAsync()
        {
            return await _context.Notification.ToListAsync();
        }

        public async Task<Notification> GetNotificationByIdAsync(int id)
        {
            return await _context.Notification.FindAsync(id);
        }

        public async Task AddNotificationAsync(Notification user)
        {
            await _context.Notification.AddAsync(user);
            await _context.SaveChangesAsync();
        }

    }
}
