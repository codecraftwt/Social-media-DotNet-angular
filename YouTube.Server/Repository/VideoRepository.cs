using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YouTube.Server.Data;
using YouTube.Server.Models;
using YouTube.Server.Repository.IRepository;

public class VideoRepository : IVideoRepository
{
    private readonly YourDbContext _context;

    public VideoRepository(YourDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Video>> GetVideosByUserIdAsync(int userId)
    {
        try
        {
            return await _context.Videos
                .Where(v => v.UserId == userId)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            // Log the exception (consider using a logging framework)
            throw new Exception("An error occurred while retrieving videos.", ex);
        }
    }

    public async Task<IEnumerable<Video>> GetAllAsync()
    {
        return await _context.Videos.ToListAsync();
    }

    public async Task<Video> GetByIdAsync(int id)
    {
        return await _context.Videos.FindAsync(id);
    }

    public async Task AddAsync(Video video)
    {
        await _context.Videos.AddAsync(video);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Video video)
    {
        _context.Videos.Update(video);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var video = await _context.Videos.FindAsync(id);
        if (video != null)
        {
            _context.Videos.Remove(video);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UploadAsync(VideoUploadDto video)
    {
        var Uplodvideo = new Video
        {
            Title = video.Title,
            Description = video.Description,
            UserId = video.UserId,
            Url = video.Url,
            Thumbnail = "default_thumbnail_url.png", // You can modify this logic as needed
            Views = 0,
            Likes = 0,
            Dislikes = 0
        };

        await _context.Videos.AddAsync(Uplodvideo);
        await _context.SaveChangesAsync();
    }




    public async Task<Video> GetVideoByIdAsync(int id)
    {
        return await _context.Videos.FindAsync(id);
    }


    public async Task IncrementLikesAsync(int id)
    {
        var video = await GetVideoByIdAsync(id);
        if (video != null)
        {
            if(video.Likes == null)
            {
                video.Likes = 0;
            }
            video.Likes = video.Likes + 1;
            await _context.SaveChangesAsync();
        }
        else
        {
            // Log that the video was not found
            throw new Exception($"Video with ID {id} not found.");
        }
    }

    public async Task IncrementDislikesAsync(int id)
    {
        var video = await GetVideoByIdAsync(id);
        if (video != null)
        {
            if (video.Dislikes == null)
            {
                video.Dislikes = 0;
            }
            video.Dislikes++;
            await _context.SaveChangesAsync();
        }
    }

    public async Task IncrementViewAsync(int id)
    {
        var video = await GetVideoByIdAsync(id);
        if (video != null)
        {
            if (video.Views == null)
            {
                video.Views = 0;
            }
            video.Views++;
            await _context.SaveChangesAsync();
        }
    }
}
