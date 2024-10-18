using YouTube.Server.Models;

namespace YouTube.Server.Repository.Interface
{
    public interface IReplyComment
    {
        Task<IEnumerable<CommentReply>> GetAllReplyAsync();
        Task<CommentReply> GetReplyByIdAsync(int id);
        Task AddReplyAsync(CommentReply user);
        Task UpdateReplyAsync(CommentReply user);
        Task DeleteReplyAsync(int id);
        Task<List<CommentReply>> GetRepliesByCommentIdAsync(int commentId);
        Task IncrementDislikesAsync(int id);
        Task IncrementLikesAsync(int id);

    }
}
