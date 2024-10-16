using YouTube.Server.Data;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions; 


namespace YouTube.Server.Repository
{
    public class SubscribedRepository: ISubscribedRepository
    {
        private readonly YourDbContext _context;

        public SubscribedRepository(YourDbContext context)
        {
            _context = context;
        }

        public async Task<Subscribed> AddSubscriptionAsync(Subscribed subscription)
        {
            _context.Subscribe.Add(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<List<Subscribed>> GetAllSubscriptionsAsync()
        {
            return await _context.Subscribe.ToListAsync();
        }

        public async Task<Subscribed> GetSubscriptionByIdAsync(int id)
        {
            return await _context.Subscribe.FindAsync(id);
        }

        public async Task DeleteSubscriptionAsync(int id)
        {
            var subscription = await _context.Subscribe.FindAsync(id);
            if (subscription != null)
            {
                _context.Subscribe.Remove(subscription);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> AnyAsync(Expression<Func<Subscribed, bool>> predicate)
        {
            return await _context.Subscribe.AnyAsync(predicate);
        }

        public async Task<bool> IsUserSubscribedAsync(int userId, int subscribeById)
        {
            return await _context.Subscribe
                .AnyAsync(s => s.UserId == userId && s.subscribeby == subscribeById);
        }


    }
}

