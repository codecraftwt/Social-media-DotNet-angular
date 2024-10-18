namespace YouTube.Server.Models
{
    public class CommentUSer
    {
        public int Id { get; set; }
        public int? VideoId { get; set; }
        public int? UserId { get; set; }
        public string? Comment { get; set; }
        public int? Likes { get; set; }
        public int? Dislikes {  get; set; }
    }
}
