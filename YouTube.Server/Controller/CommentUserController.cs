using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YouTube.Server.Models;
using YouTube.Server.Repository;
using YouTube.Server.Repository.Interface;
using YouTube.Server.Repository.IRepository;

namespace YouTube.Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentUserController : ControllerBase
    {
        private readonly ICommentVideo _commentVideo;
        private readonly IConfiguration _configuration;
        private readonly ITokenRepository _tokenRepository;

        public CommentUserController(ICommentVideo commentVideo, IConfiguration configuration, ITokenRepository tokenRepository)
        {
           _commentVideo = commentVideo;
            _configuration = configuration;
            _tokenRepository = tokenRepository;
        }


        [HttpGet("All")]
        // [Authorize]
        public async Task<ActionResult<IEnumerable<CommentUSer>>> GetAllUsers()
        {
            var users = await _commentVideo.GetAllCommentAsync();

            return Ok(users);
        }


        [HttpGet("{id}/comment")]
        public async Task<ActionResult<CommentUSer>> GetCommentUser(int id)
        {

            try
            {
                var video = await _commentVideo.GetCommentByIdAsync(id);

                if (video == null)
                {
                    return NotFound("Video not found.");
                }

                var videoDto = new CommentUSer
                {
                    Id = video.Id,
                    VideoId = video.VideoId,
                    UserId = video.UserId,
                    Comment = video.Comment
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
        public async Task<ActionResult<CommentUSer>> CreateComment([FromBody] CommentUSer commentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var comment = new CommentUSer
            {
                VideoId = commentDto.VideoId,
                UserId = commentDto.UserId,
                Comment = commentDto.Comment
            };

            await _commentVideo.AddCommentAsync(comment);
            return CreatedAtAction(nameof(GetCommentUser), new { id = comment.Id }, comment);
        }

        [HttpGet("video/{videoId}")]
        public async Task<ActionResult<IEnumerable<CommentVideo>>> GetCommentsByVideoId(int videoId)
        {
            var comments = await _commentVideo.GetCommentsByVideoIdAsync(videoId);

          

            return Ok(comments);
        }

        [HttpPut("{id}/like")]
        public async Task<IActionResult> IncrementLike(int id)
        {
            await _commentVideo.IncrementLikesAsync(id);
            return NoContent();
        }

        // PUT: api/videos/{id}/dislike
        [HttpPut("{id}/dislike")]
        public async Task<IActionResult> IncrementDislike(int id)
        {
            await _commentVideo.IncrementDislikesAsync(id);
            return NoContent();
        }

    }
}
