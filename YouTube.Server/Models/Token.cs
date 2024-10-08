namespace YouTube.Server.Models
{
    public class Token
    {
        public int Id { get; set; }
        public string UserId { get; set; } // Assume you have a UserId field
        public string JwtToken { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
