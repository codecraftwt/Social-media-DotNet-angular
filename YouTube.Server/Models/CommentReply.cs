namespace YouTube.Server.Models
{
    public class CommentReply
    {
        public int Id { get; set; }
        public int CommentId {  get; set; }
        public int UserID {  get; set; }
        public string ReplyText { get; set; }
        public int? Likes { get; set; }
        public int? Dislikes {  get; set; }
    }
}
