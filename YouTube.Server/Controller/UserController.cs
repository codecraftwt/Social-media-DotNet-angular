using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using YouTube.Server.Models;
using YouTube.Server.Repository;
using YouTube.Server.Repository.Interface;

namespace YouTube.Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUser _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ITokenRepository _tokenRepository;

        public UserController(IUser userRepository, IConfiguration configuration, ITokenRepository tokenRepository)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _tokenRepository = tokenRepository;
        }

        // GET: api/users
        [HttpGet("All")]
       // [Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();

            return Ok(users);
        }

        // GET: api/users/{id}
        [HttpGet("{id}/GetUserById")]
        [Authorize]
        
        public async Task<ActionResult<string>> GetUser(int id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id); // Retrieve user by ID

                if (user == null)
                {
                    return NotFound("User not found.");
                }

                var userImageDto = new UserImageDto
                {
                    ProfilePic = user.ProfilePic // Assuming this is the relative path or URL
                };

                return Ok(userImageDto);
            }
            catch (Exception ex)
            {
                // Optionally log the exception
                return StatusCode(500, "Internal server error.");
            }
        }

        // POST: api/users
        [HttpPost]
        [Route("CreateUser")]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            await _userRepository.AddUserAsync(user);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // PUT: api/users/{id}
        [HttpPut("{id}/UpdateUserData")]
    
        public async Task<IActionResult> UpdateUser(int id, [FromForm] Profile user, IFormFile profilePicture)
        {
            if(id <= 0)
            {
                return BadRequest();
            }
            var existingUser = await _userRepository.GetUserByIdAsync(id);
            if (existingUser == null)
            {
                return NotFound("User not found.");
            }

            // Update the user's details
            existingUser.Email = user.Email;
            existingUser.UserName = user.UserName;
            existingUser.FullName = user.FullName;

            if (profilePicture != null && profilePicture.Length > 0)
            {
                try
                {
                    // Validate file type and size
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var extension = Path.GetExtension(profilePicture.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest("Invalid file type.");
                    }

                    // Define the directory path
                    var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profile");

                    // Check if the directory exists, if not, create it
                    if (!Directory.Exists(directoryPath))
                    {
                        Directory.CreateDirectory(directoryPath);
                    }

                    // Define the full file path
                    var filePath = Path.Combine(directoryPath, profilePicture.FileName);

                    // Save the file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await profilePicture.CopyToAsync(stream);
                    }

                    // Save file path to user or any other logic needed
                    existingUser.ProfilePic = $"/profile/{profilePicture.FileName}"; ; // Save the file path or just the filename based on your needs
                }
                catch (Exception ex)
                {
                    // Log the exception (consider using a logging framework)
                    return StatusCode(500, "An error occurred: " + ex.Message);
                }
            }

            await _userRepository.UpdateUserAsync(existingUser);
            return NoContent();
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}/delete")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _userRepository.DeleteUserAsync(id);
            return NoContent();
        }


        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login([FromBody] UserDto loginUser)
        {
            var user = await _userRepository.GetUserByEmailAsync(loginUser.Email);
            if (user == null)
            {
                return BadRequest(new { success = false, message = "Email not found" });
            }

            // In production, compare hashed passwords
            if (user.Password != loginUser.Password)
            {
                return BadRequest(new { success = false, message = "Incorrect password" });
            }

            await _tokenRepository.RemoveTokenAsync(user.Id.ToString());

            var token = GenerateJwtToken(user);

            // Save the new token to the database
            var newToken = new Token
            {
                UserId = user.Id.ToString(),
                JwtToken = token,
                ExpiryDate = DateTime.Now.AddDays(1) // Set the expiration
            };
            var Id = int.Parse(newToken.UserId);

            await _tokenRepository.AddTokenAsync(newToken);

            return Ok(new
            {
                success = true,
                message = "Login successful!",
                userId = Id,
                token = token
            });
        
    }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Set the token expiration
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        [HttpPost("CreateUserR")]
        [AllowAnonymous]
        public async Task<ActionResult<User>> CreateUserR([FromForm] User user, IFormFile profilePic)
        {
            if (profilePic != null && profilePic.Length > 0)
            {
                try
                {
                    // Validate file type and size
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                    var extension = Path.GetExtension(profilePic.FileName).ToLower();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest("Invalid file type.");
                    }

                    // Define the directory path
                    var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profile");

                    // Check if the directory exists, if not, create it
                    if (!Directory.Exists(directoryPath))
                    {
                        Directory.CreateDirectory(directoryPath);
                    }

                    // Define the full file path
                    var filePath = Path.Combine(directoryPath, profilePic.FileName);

                    // Save the file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await profilePic.CopyToAsync(stream);
                    }

                    // Save file path to user or any other logic needed
                    user.ProfilePic = $"/profile/{profilePic.FileName}"; ; // Save the file path or just the filename based on your needs
                }
                catch (Exception ex)
                {
                    // Log the exception (consider using a logging framework)
                    return StatusCode(500, "An error occurred: " + ex.Message);
                }
            }

            await _userRepository.AddUserAsync(user);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }


        // GET: api/users/{id}/token
        [HttpGet("{id}/token")]
        [AllowAnonymous]
        public async Task<ActionResult<string>> GetUserToken(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var token = await _tokenRepository.GetTokenByUserIdAsync(user.Id.ToString());
            if (token == null)
            {
                return NotFound(new { message = "Token not found" });
            }

            return Ok(new { token = token.JwtToken });
        }

        [HttpGet("{id}/GetUser")]
        [Authorize]

        public async Task<ActionResult<Profile>> GetUserProfile(int id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id); // Retrieve user by ID

                if (user == null)
                {
                    return NotFound("User not found.");
                }
                var profile = new Profile
                {
                    UserName = user.UserName,
                    Email = user.Email,
                    FullName = user.FullName,
                    ProfilePic = user.ProfilePic
                };

                return Ok(profile);
            }
            catch (Exception ex)
            {
                // Optionally log the exception
                return StatusCode(500, "Internal server error.");
            }
        }

        // GET: api/users/{id}/username
        [HttpGet("{id}/username")]
        [Authorize]
        public async Task<ActionResult<string>> GetUserNameById(int id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id); // Retrieve user by ID

                if (user == null)
                {
                    return NotFound("User not found.");
                }

                return Ok(new { username = user.UserName });

            }
            catch (Exception ex)
            {
                // Optionally log the exception
                return StatusCode(500, "Internal server error.");
            }
        }



    }
}
