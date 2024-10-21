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
    public class CommentReplyController : ControllerBase
    {
        private readonly IReplyComment _replyComment;
        private readonly IConfiguration _configuration;
        private readonly ITokenRepository _tokenRepository;

        public CommentReplyController(IReplyComment replyComment, IConfiguration configuration, ITokenRepository tokenRepository)
        {
           _replyComment = replyComment;
            _configuration = configuration;
            _tokenRepository = tokenRepository;
        }

        [HttpGet("All")]
        // [Authorize]
        public async Task<ActionResult<IEnumerable<CommentReply>>> GetAllUsers()
        {
            var users = await _replyComment.GetAllReplyAsync();

            return Ok(users);
        }


        [HttpGet("{id}/reply")]
        public async Task<ActionResult<CommentReply>> GetReplyUser(int id)
        {

            try
            {
                var video = await _replyComment.GetReplyByIdAsync(id);

                if (video == null)
                {
                    return NotFound("Video not found.");
                }

                var videoDto = new CommentReply
                {
                    Id = video.Id,
                    CommentId = video.CommentId,
                    UserID = video.UserID,
                    ReplyText = video.ReplyText,
                    Likes = video.Likes,
                    Dislikes = video.Dislikes,
                };

                return Ok(videoDto);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                return StatusCode(500, "Internal server error.");
            };
        }


        [HttpPost("{id}/Add")]
        public async Task<ActionResult<CommentReply>> CreateComment(int id,[FromBody] CommentReply commentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var comment = new CommentReply
            {
               CommentId = id,
               UserID= commentDto.UserID,
               ReplyText= commentDto.ReplyText,
               Likes= commentDto.Likes,
               Dislikes= commentDto.Dislikes,
            };

            await _replyComment.AddReplyAsync(comment);
            return CreatedAtAction(nameof(GetReplyUser), new { id = comment.Id }, comment);
        }

        [HttpGet("Replies/{id}")]
        public async Task<ActionResult<CommentReply>> GetReplyById(int id)
        {
            var reply = await _replyComment.GetReplyByIdAsync(id);
            if (reply == null)
            {
                return Ok(reply);
            }
            return Ok(reply);
        }

        [HttpPut("{id}/like")]
        public async Task<IActionResult> IncrementLike(int id)
        {
            await _replyComment.IncrementLikesAsync(id);
            return NoContent();
        }

        // PUT: api/videos/{id}/dislike
        [HttpPut("{id}/dislike")]
        public async Task<IActionResult> IncrementDislike(int id)
        {
            await _replyComment.IncrementDislikesAsync(id);
            return NoContent();
        }
    }
}
