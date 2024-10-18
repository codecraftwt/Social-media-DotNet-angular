using YouTube.Server.Models;

namespace YouTube.Server.Repository.Interface
{
    public interface ICommentVideo
    {
        Task<IEnumerable<CommentUSer>> GetAllCommentAsync();
        Task<CommentUSer> GetCommentByIdAsync(int id);
        Task AddCommentAsync(CommentUSer user);
        Task UpdateCommentAsync(CommentUSer user);
        Task DeleteCommentAsync(int id);
         Task<IEnumerable<CommentUSer>> GetCommentsByVideoIdAsync(int videoId);
        Task IncrementDislikesAsync(int id);
        Task IncrementLikesAsync(int id);

    }
}
