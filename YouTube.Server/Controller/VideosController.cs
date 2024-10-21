using Microsoft.AspNetCore.Mvc;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;
using YouTube.Server.Repository;
using YouTube.Server.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Web;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.AspNetCore.Authorization;

namespace YouTube.Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VideosController : ControllerBase
    {
        private readonly IVideoRepository _videoRepository;
        private readonly IUserVideoViewRepository _userVideoViewRepository;
        private readonly string _videoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UploadedVideos");

        public VideosController(IVideoRepository videoRepository,IUserVideoViewRepository userVideoViewRepository)
        {
            _userVideoViewRepository = userVideoViewRepository;
            _videoRepository = videoRepository;
        }

        // GET: api/videos
        [HttpGet]
        [Route("getVideos")]
        public async Task<ActionResult<IEnumerable<Video>>> GetVideos()
        {
            try
            {
                var videoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UploadedVideos");
                if (!Directory.Exists(videoPath))
                    return NotFound("No videos found.");

                var videoFiles = Directory.GetFiles(videoPath)
                    .Select(filePath => Url.Content($"~/UploadedVideos/{Path.GetFileName(filePath)}"))
                    .ToList();

                if (videoFiles.Count == 0)
                    return NotFound("No videos found.");

                return Ok(videoFiles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }




        [HttpGet("{id}/video")]
        public async Task<ActionResult<Video>> GetVideo(int id)
         {
          
            try
            {
                var video = await _videoRepository.GetVideoByIdAsync(id);

                if (video == null)
                {
                    return NotFound("Video not found.");
                }

                var videoDto = new Video
                {
                    Id = video.Id,
                    Url = video.Url,
                    Thumbnail = video.Thumbnail,
                    Likes = video.Likes,
                    Dislikes = video.Dislikes,
                    Views = video.Views,
                    Title = video.Title,
                    Description = video.Description,
                    UserId=video.UserId
                };

                return Ok(videoDto);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                return StatusCode(500, "Internal server error.");
            };
        }

        // POST: api/videos/addVideo
        [HttpPost("addVideo")]
        public async Task<ActionResult<Video>> CreateVideo(Video video)
        {
            video.Views = 0;
            video.Likes = 0;
            video.Dislikes = 0;
            await _videoRepository.AddAsync(video);
            return CreatedAtAction(nameof(GetVideo), new { id = video.Id }, video);
        }

        // PUT: api/videos/updateVideo/5
        [HttpPut("updateVideo/{id}")]
        public async Task<IActionResult> UpdateVideo(int id, Video video)
        {
            if (id != video.Id)
            {
                return BadRequest();
            }

            await _videoRepository.UpdateAsync(video);
            return NoContent();
        }

        // DELETE: api/videos/deleteVideo/5
        [HttpDelete("{id}/deleteVideo")]
        public async Task<IActionResult> DeleteVideo(int id)
        {
            await _videoRepository.DeleteAsync(id);
            return NoContent();
        }

      
        [HttpPost("UploadVideo")]
        public async Task<ActionResult> UploadVideoFile([FromForm] int userId, [FromForm] IFormFile fileupload, [FromForm] IFormFile thumbnailUpload, [FromForm] string title, [FromForm] string description)
        {
            try
            {
                if (fileupload == null || fileupload.Length == 0)
                    return BadRequest("No video file uploaded.");

                if (thumbnailUpload == null || thumbnailUpload.Length == 0)
                    return BadRequest("No thumbnail file uploaded.");

                if (string.IsNullOrWhiteSpace(title))
                    return BadRequest("No title provided.");

                // Prepare the video file path
                string videoFileName = Path.GetFileName(fileupload.FileName);
                var videoDirectoryPath = Path.Combine(_videoPath);

                // Create the directory if it doesn't exist
                if (!Directory.Exists(videoDirectoryPath))
                {
                    Directory.CreateDirectory(videoDirectoryPath);
                }

                // Generate a unique file name if it already exists
                string videoFilePath = Path.Combine(videoDirectoryPath, videoFileName);
                int fileIndex = 1;
                while (System.IO.File.Exists(videoFilePath))
                {
                    string newFileName = Path.GetFileNameWithoutExtension(videoFileName) + $"_{fileIndex++}" + Path.GetExtension(videoFileName);
                    videoFilePath = Path.Combine(videoDirectoryPath, newFileName);
                }

                // Save the video file
                using (var stream = new FileStream(videoFilePath, FileMode.Create))
                {
                    await fileupload.CopyToAsync(stream);
                }

                // Save the thumbnail file
                string thumbnailDirectoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UploadedThumbnails");
                if (!Directory.Exists(thumbnailDirectoryPath))
                {
                    Directory.CreateDirectory(thumbnailDirectoryPath);
                }

                string thumbnailFileName = Path.GetFileName(thumbnailUpload.FileName);
                var thumbnailFilePath = Path.Combine(thumbnailDirectoryPath, thumbnailFileName);

                // Generate a unique file name for the thumbnail if it already exists
                int thumbnailIndex = 1;
                while (System.IO.File.Exists(thumbnailFilePath))
                {
                    string newThumbnailName = Path.GetFileNameWithoutExtension(thumbnailFileName) + $"_{thumbnailIndex++}" + Path.GetExtension(thumbnailFileName);
                    thumbnailFilePath = Path.Combine(thumbnailDirectoryPath, newThumbnailName);
                }

                // Save the thumbnail file
                using (var stream = new FileStream(thumbnailFilePath, FileMode.Create))
                {
                    await thumbnailUpload.CopyToAsync(stream);
                }

                var videoUpload = new Video
                {
                    UserId = userId,
                    Url = Url.Content($"~/UploadedVideos/{Path.GetFileName(videoFilePath)}"),
                    Thumbnail = Url.Content($"~/UploadedThumbnails/{Path.GetFileName(thumbnailFilePath)}"),
                    Title = title,
                    Description = description,
                };

                await _videoRepository.AddAsync(videoUpload);
                


                // Return paths for the video and thumbnail
                return Ok(new
                {
                    Id = videoUpload.Id,
                    videoFilePath = Url.Content($"~/UploadedVideos/{Path.GetFileName(videoFilePath)}"),
                    thumbnailFilePath = Url.Content($"~/UploadedThumbnails/{Path.GetFileName(thumbnailFilePath)}"),
                  
                });
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, "Internal server error. Please try again later.");
            }
        }


        [HttpGet("GetVideoAll")]
        public async Task<ActionResult<List<Video>>> GetVideo()
        {
            try
            {
                var videos = await _videoRepository.GetAllAsync();

                if (videos == null || !videos.Any())
                {
                    return NotFound("No videos found.");
                }

                var videoDtos = videos.Select(v => new Video
                {
                    Id = v.Id,
                    Url = v.Url, 
                    Thumbnail = v.Thumbnail,
                    Likes = v.Likes, 
                    Dislikes = v.Dislikes, 
                    Views = v.Views,
                    Title = v.Title,
                    Description = v.Description,
                    UserId = v.UserId,

                }).ToList();

                return Ok(videoDtos);
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, "Internal server error.");
            }
        }




        [HttpPut("{id}/like")]
        public async Task<IActionResult> IncrementLike(int id)
        {
            await _videoRepository.IncrementLikesAsync(id);
            return NoContent();
        }

        // PUT: api/videos/{id}/dislike
        [HttpPut("{id}/dislike")]
        public async Task<IActionResult> IncrementDislike(int id)
        {
            await _videoRepository.IncrementDislikesAsync(id);
            return NoContent();
        }

        // PUT: api/videos/{id}/view
        [HttpPut("{id}/view")]
        public async Task<IActionResult> IncrementView(int id)
        {
            await _videoRepository.IncrementViewAsync(id);
            return NoContent();
        }

        [HttpPut("{userId}/view/{videoId}")]
        public async Task<IActionResult> IncrementViewByUser(int userId, int videoId)
        {
            // Check if the user has already viewed this video
            if (await _userVideoViewRepository.HasUserViewedVideoAsync(userId, videoId))
            {
                return BadRequest("You have already viewed this video.");
            }

            // Increment the view count in the video repository
            await _videoRepository.IncrementViewAsync(videoId);

            // Log the view for this user
            var userVideoView = new UserVideoView
            {
                UserId = userId,
                VideoId = videoId
            };
            await _userVideoViewRepository.AddUserVideoViewAsync(userVideoView);

            return NoContent();
        }



        [HttpGet("{id}/GetVideosByUserId")]
        public async Task<ActionResult<List<VideoDto>>> GetUserVideo(int Id)
        {
            try
            {
                var videos = await _videoRepository.GetVideosByUserIdAsync(Id);

                if (videos == null || !videos.Any())
                {
                    return NotFound("No videos found.");
                }

                var videoDtos = videos.Select(v => new VideoDto
                {
                    Id = v.Id,
                    Url = v.Url,
                    Thumbnail = v.Thumbnail,
                    Likes = v.Likes,
                    Dislikes = v.Dislikes,
                    Views = v.Views,
                    Title = v.Title,
                    Description = v.Description

                }).ToList();

                return Ok(videoDtos);
            }
            catch (Exception ex)
            {

                return StatusCode(500, "Internal server error.");
            }
        }


        // DELETE: api/videos/user/{userId}
        [HttpDelete("{userId}/user")]
        public async Task<IActionResult> DeleteVideosByUserId(int userId)
        {
            try
            {
                var videos = await _videoRepository.GetVideosByUserIdAsync(userId);

                if (videos == null || !videos.Any())
                {
                    return NotFound("No videos found for this user.");
                }

                await _videoRepository.DeleteRangeAsync(videos);
                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}



