using Microsoft.EntityFrameworkCore;
using YouTube.Server.Models;

namespace YouTube.Server.Data
{
    public class YourDbContext : DbContext
    {
        public YourDbContext(DbContextOptions<YourDbContext> options) : base(options) { }

        public DbSet<Video> Videos { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<UserVideoView> UserVideoView { get; set; }
        public DbSet<Subscribed> Subscribe { get; set; }
        public DbSet<CommentUSer> Comment { get; set; }
        public DbSet<CommentReply> Reply { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Additional model configuration goes here
        }
    }
}
