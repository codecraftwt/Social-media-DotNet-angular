namespace YouTube.Server.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int VideoId { get; set; }        
        public bool ViewNotification { get; set; }
    }
}
