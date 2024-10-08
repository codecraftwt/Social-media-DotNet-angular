namespace YouTube.Server.Models
{
    public class VideoUploadDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int UserId { get; set; }
        public string Url { get; set; }
    }
}
