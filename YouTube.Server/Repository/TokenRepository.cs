using Microsoft.EntityFrameworkCore;
using YouTube.Server.Data;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;

namespace YouTube.Server.Repository
{
    public class TokenRepository: ITokenRepository
    {
        private readonly YourDbContext _context;

        public TokenRepository(YourDbContext context)
        {
            _context = context;
        }
        public async Task<Token> GetTokenByUserIdAsync(string userId)
        {
            return await _context.Tokens.FirstOrDefaultAsync(t => t.UserId == userId);
        }

        public async Task AddTokenAsync(Token token)
        {
            await _context.Tokens.AddAsync(token);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveTokenAsync(string userId)
        {
            var existingToken = await GetTokenByUserIdAsync(userId);
            if (existingToken != null)
            {
                _context.Tokens.Remove(existingToken);
                await _context.SaveChangesAsync();
            }
        }
    }
}
