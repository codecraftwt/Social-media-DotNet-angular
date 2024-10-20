﻿namespace YouTube.Server.Models
{
    public class VideoDto
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Thumbnail { get; set; }
        public int? Views { get; set; }
        public int? Likes { get; set; }
        public int? Dislikes { get; set; }
        public string? Title { get; set; }
        public string Description { get; set; }
    }
}
