using YouTube.Server.Models;

namespace YouTube.Server.Repository.IRepository
{
    public interface IVideoRepository
    {
        Task<IEnumerable<Video>> GetVideosByUserIdAsync(int userId);
        Task<IEnumerable<Video>> GetAllAsync();
        Task<Video> GetByIdAsync(int id);
        Task AddAsync(Video video);
        Task UpdateAsync(Video video);
        Task DeleteAsync(int id);
        Task UploadAsync(VideoUploadDto video);
        Task IncrementLikesAsync(int id);
        Task IncrementDislikesAsync(int id);
        Task IncrementViewAsync(int id);
        Task<Video> GetVideoByIdAsync(int id);
        Task DeleteRangeAsync(IEnumerable<Video> videos);

    }
}
