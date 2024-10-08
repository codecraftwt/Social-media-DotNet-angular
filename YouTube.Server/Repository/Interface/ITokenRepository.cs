using YouTube.Server.Models;

namespace YouTube.Server.Repository.Interface
{
    public interface ITokenRepository
    {
        Task<Token> GetTokenByUserIdAsync(string userId);
        Task AddTokenAsync(Token token);
        Task RemoveTokenAsync(string userId);
    }
}
