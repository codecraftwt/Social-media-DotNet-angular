using YouTube.Server.Models;

namespace YouTube.Server.Repository.Interface
{
    public interface INotify
    {
        Task<IEnumerable<Notification>> GetAllNotificationAsync();
        Task<Notification> GetNotificationByIdAsync(int id);
        Task AddNotificationAsync(Notification user);
    }
}
