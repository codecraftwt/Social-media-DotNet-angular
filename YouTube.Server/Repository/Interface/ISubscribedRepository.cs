using System.Linq.Expressions;
using YouTube.Server.Models;

namespace YouTube.Server.Repository.Interface
{
    public interface ISubscribedRepository
    {
        Task<Subscribed> AddSubscriptionAsync(Subscribed subscription);
        Task<List<Subscribed>> GetAllSubscriptionsAsync();
        Task<Subscribed> GetSubscriptionByIdAsync(int id);
        Task DeleteSubscriptionAsync(int id);
        Task<bool> AnyAsync(Expression<Func<Subscribed, bool>> predicate);
        Task<bool> IsUserSubscribedAsync(int userId, int subscribeById);
    }
}
