using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuriousAppetiteApi.Context;
using CuriousAppetiteApi.Models;

namespace CuriousAppetiteApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingsController : ControllerBase
    {
        private readonly CuriousAppetiteDbContext _context;

        public RatingsController(CuriousAppetiteDbContext context)
        {
            _context = context;
        }

        // GET: api/Ratings
        [HttpGet("{recipeId}")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetRatings(long recipeId)
        {
            var ratings = await _context.Ratings.Where(r => r.RecipeId == recipeId).ToListAsync();
            int average = 0;
            if(ratings == null || ratings.Count == 0)
            {
                return NoContent();
            }
            ratings.ForEach(ele => average += ele.RatingLevel);
            average = (int)Math.Round((double)average / ratings.Count);
            return Ok(new { rating = average });
        }

        // GET: api/Ratings/5
        [HttpGet("{recipeId}/{userId}")]
        public async Task<ActionResult<Rating>> GetRating(long recipeId, long userId)
        {
            var rating = await _context.Ratings.FirstOrDefaultAsync(r => r.RecipeId == recipeId && r.UserId == userId);

            if (rating == null)
            {
                return NoContent();
            }

            return rating;
        }

        // PUT: api/Ratings/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{recipeId}/{userId}")]
        public async Task<IActionResult> PutRating(long recipeId, long userId, [FromForm] IFormCollection data)
        {
            Rating rating = new Rating();
            rating.UserId = long.Parse(data["userId"]);
            User? user = await _context.Users.FindAsync(rating.UserId);
            if (user == null || rating.UserId != userId)
            {
                return BadRequest();
            }
            rating.User = user;
            rating.RecipeId = long.Parse(data["recipeId"]);
            Recipe? recipe = await _context.Recipes.FindAsync(rating.RecipeId);
            if (recipe == null || rating.RecipeId != recipeId)
            {
                return BadRequest();
            }
            rating.Recipe = recipe;
            rating.RatingLevel = int.Parse(data["rating"]);

            _context.Entry(rating).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(rating);
        }

        private bool IsLoggedIn()
        {
            return HttpContext.Session.GetInt32("userId") != null;
        }

        // POST: api/Ratings
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Rating>> PostRating([FromForm] IFormCollection data)
        {
            Rating rating = new Rating();
            rating.UserId = long.Parse(data["userId"]);
            User? user = await _context.Users.FindAsync(rating.UserId);
            if (user == null) {
                return BadRequest();
            }
            rating.User = user;
            rating.RecipeId = long.Parse(data["recipeId"]);
            Recipe? recipe = await _context.Recipes.FindAsync(rating.RecipeId);
            if (recipe == null)
            {
                return BadRequest();
            }
            rating.Recipe = recipe;
            rating.RatingLevel = int.Parse(data["rating"]);

            _context.Ratings.Add(rating);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RatingExists(rating.UserId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Ok(rating);
        }

        // DELETE: api/Ratings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRating(long id)
        {
            if (!IsLoggedIn())
            {
                return Unauthorized();
            }

            var rating = await _context.Ratings.FindAsync(id);
            if (rating == null)
            {
                return NotFound();
            }

            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RatingExists(long id)
        {
            return _context.Ratings.Any(e => e.UserId == id);
        }
    }
}
