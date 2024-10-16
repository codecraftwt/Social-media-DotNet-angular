using YouTube.Server.Data;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace YouTube.Server.Repository
{
    public class UserVideoViewRepository : IUserVideoViewRepository
    {
        private readonly YourDbContext _context;

        public UserVideoViewRepository(YourDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasUserViewedVideoAsync(int userId, int videoId)
        {
            return await _context.UserVideoView
                .AnyAsync(uv => uv.UserId == userId && uv.VideoId == videoId);
        }

        public async Task AddUserVideoViewAsync(UserVideoView userVideoView)
        {
            await _context.UserVideoView.AddAsync(userVideoView);
            await _context.SaveChangesAsync();
        }
    }
}
