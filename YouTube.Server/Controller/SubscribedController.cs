using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YouTube.Server.Models;
using YouTube.Server.Repository.Interface;
using YouTube.Server.Data;

namespace YouTube.Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubscribedController : ControllerBase
    {
        private readonly ISubscribedRepository _repository;

        public SubscribedController(ISubscribedRepository repository)
        {
            _repository = repository;
        }

        [HttpPost("{userId}/add/{subscribeby}")]
        public async Task<IActionResult> Subscribe(int userId, int subscribeby)
        {

            try
            {
                var existingSubscription = await _repository.AnyAsync(s => s.UserId == userId);
                if (existingSubscription)
                {
                    return Conflict("User already subscribed.");
                }

                var subscription = new Subscribed { UserId = userId, subscribeby= subscribeby };
                await _repository.AddSubscriptionAsync(subscription);

                return CreatedAtAction(nameof(GetSubscriptionById), new { id = subscription.Id }, subscription);
            }
            catch (Exception ex)
            {
                // Log the exception (ex) here
                return StatusCode(500, "An error occurred while processing your request.");
            }

        }

        [HttpGet("All")]
        public async Task<ActionResult<List<Subscribed>>> GetAllSubscriptions()
        {
            var subscriptions = await _repository.GetAllSubscriptionsAsync();
            return Ok(subscriptions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Subscribed>> GetSubscriptionById(int id)
        {
            var subscription = await _repository.GetSubscriptionByIdAsync(id);
            if (subscription == null)
            {
                return NotFound();
            }
            return Ok(subscription);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubscription(int id)
        {
            await _repository.DeleteSubscriptionAsync(id);
            return NoContent();
        }

        // Check if user is subscribed to any channels
        [HttpGet("is-subscribed/{userId}/{subscribeById}")]
        public async Task<ActionResult<bool>> IsUserSubscribed(int userId, int subscribeById)
        {
            // Check if the user is subscribed
            var isSubscribed = await _repository.IsUserSubscribedAsync(userId, subscribeById);

            

            // Return the result
            return Ok(isSubscribed);
        }



    }
}

