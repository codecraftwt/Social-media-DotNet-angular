using Microsoft.EntityFrameworkCore;
using YouTube.Server.Data;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;

namespace YouTube.Server.Repository
{
    public class ReplyComment : IReplyComment
    {
        private readonly YourDbContext _context;

        public ReplyComment(YourDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CommentReply>> GetAllReplyAsync()
        {
            return await _context.Reply.ToListAsync();
        }

        public async Task<CommentReply> GetReplyByIdAsync(int id)
        {
            return await _context.Reply.FindAsync(id);
        }

        public async Task AddReplyAsync(CommentReply user)
        {
            await _context.Reply.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateReplyAsync(CommentReply user)
        {
            _context.Reply.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteReplyAsync(int id)
        {
            var user = await GetReplyByIdAsync(id);
            if (user != null)
            {
                _context.Reply.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<CommentReply>> GetRepliesByCommentIdAsync(int commentId)
        {
            return await _context.Reply
                .Where(r => r.CommentId == commentId)
                .ToListAsync();
        }

        public async Task IncrementLikesAsync(int id)
        {
            var comment = await GetReplyByIdAsync(id);
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
            var comment = await GetReplyByIdAsync(id);
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
