using YouTube.Server.Models;

namespace YouTube.Server.Repository.Interface
{
    public interface IUserVideoViewRepository
    {
        Task<bool> HasUserViewedVideoAsync(int userId, int videoId);
        Task AddUserVideoViewAsync(UserVideoView userVideoView);
    }
}
