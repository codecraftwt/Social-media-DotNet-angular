using Microsoft.EntityFrameworkCore;
using YouTube.Server.Data;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;

namespace YouTube.Server.Repository
{
    public class CommentVideo : ICommentVideo
    {
        private readonly YourDbContext _context;

        public CommentVideo(YourDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<CommentUSer>> GetAllCommentAsync()
        {
            return await _context.Comment.ToListAsync();
        }

        public async Task<CommentUSer> GetCommentByIdAsync(int id)
        {
            return await _context.Comment.FindAsync(id);
        }

        public async Task AddCommentAsync(CommentUSer user)
        {
            await _context.Comment.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCommentAsync(CommentUSer user)
        {
            _context.Comment.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCommentAsync(int id)
        {
            var user = await GetCommentByIdAsync(id);
            if (user != null)
            {
                _context.Comment.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<CommentUSer>> GetCommentsByVideoIdAsync(int videoId)
        {
            var comments = await _context.Comment
                .Where(c => c.VideoId == videoId)
                .ToListAsync();

            // Map CommentUSer to CommentVideo
            var commentVideos = comments.Select(c => new CommentUSer
            {
                Id = c.Id,
                VideoId = c.VideoId,
                UserId = c.UserId,
                Comment = c.Comment,
                Likes = c.Likes,
                Dislikes = c.Dislikes,
            });

            return commentVideos;
        }


        public async Task IncrementLikesAsync(int id)
        {
            var comment = await GetCommentByIdAsync(id);
            if (comment != null)
            {
                if (comment.Likes == null)
                {
                    comment.Likes = 0;
                }
                comment.Likes = comment.Likes + 1;
                await _context.SaveChangesAsync();
            }
            else
            {
                // Log that the video was not found
                throw new Exception($"Video with ID {id} not found.");
            }
        }

        public async Task IncrementDislikesAsync(int id)
        {
            var comment = await GetCommentByIdAsync(id);
            if (comment != null)
            {
                if (comment.Dislikes == null)
                {
                    comment.Dislikes = 0;
                }
                comment.Dislikes++;
                await _context.SaveChangesAsync();
            }
        }


    }
}
