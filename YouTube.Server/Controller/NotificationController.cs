using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YouTube.Server.Models;
using YouTube.Server.Repository;
using YouTube.Server.Repository.Interface;

namespace YouTube.Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotify _notifier;
        private readonly IConfiguration _configuration;
        private readonly ITokenRepository _tokenRepository;
        public NotificationController(INotify notifier, IConfiguration configuration, ITokenRepository tokenRepository)
        {
            _notifier = notifier;
            _configuration = configuration;
            _tokenRepository = tokenRepository;
        }

        [HttpGet("All")]
        // [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetAllNotification()
        {
            var users = await _notifier.GetAllNotificationAsync();

            return Ok(users);
        }


        [HttpGet("{id}/comment")]
        public async Task<ActionResult<Notification>> GetNotificationById(int id)
        {

            try
            {
                var video = await _notifier.GetNotificationByIdAsync(id);

                if (video == null)
                {
                    return Ok(null);
                }

                var videoDto = new Notification
                {
                    Id = video.Id,
                    VideoId = video.VideoId,
                    ViewNotification = video.ViewNotification
                };

                return Ok(videoDto);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                return StatusCode(500, "Internal server error.");
            };
        }


        [HttpPost("Add")]
        public async Task<ActionResult<Notification>> CreateComment([FromBody] Notification notified)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var comment = new Notification
            {
                VideoId = notified.VideoId,
                ViewNotification = false
            };

            await _notifier.AddNotificationAsync(comment);
            return CreatedAtAction(nameof(GetNotificationById), new { id = comment.Id }, comment);
        }

    }
}
