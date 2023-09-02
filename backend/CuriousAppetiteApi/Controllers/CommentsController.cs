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
    public class CommentsController : ControllerBase
    {
        private readonly CuriousAppetiteDbContext _context;

        public CommentsController(CuriousAppetiteDbContext context)
        {
            _context = context;
        }

        // GET: api/Comments
        [HttpGet("ByRecipe/{recipeId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(long recipeId)
        {
            var comments = await _context.Comments.Include(c => c.User).Where(c => c.RecipeId == recipeId).ToListAsync();
            return Ok(comments);
        }

        // GET: api/Comments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetComment(long id)
        {
            var comment = await _context.Comments.FindAsync(id);

            if (comment == null)
            {
                return NotFound();
            }

            return comment;
        }

        // PUT: api/Comments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutComment(long id, Comment comment)
        {
            if(!IsLoggedIn())
            {
                return Unauthorized();
            }

            if (id != comment.Id)
            {
                return BadRequest();
            }

            _context.Entry(comment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool IsLoggedIn()
        {
            return HttpContext.Session.GetInt32("userId") != null;
        }

        // POST: api/Comments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Comment>> PostComment([FromForm] IFormCollection data)
        {
            Comment comment = new Comment();
            comment.UserId = long.Parse(data["userId"]);
            User? user = await _context.Users.FindAsync(comment.UserId);
            if (user == null)
            {
                return BadRequest();
            }
            comment.User = user;
            comment.RecipeId = long.Parse(data["recipeId"]);
            Recipe? recipe = await _context.Recipes.FindAsync(comment.RecipeId);
            if (recipe == null)
            {
                return BadRequest();
            }
            comment.Recipe = recipe;
            comment.UploadDate = DateTime.Parse(data["uploadDate"]);
            comment.Description = data["description"];

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        // DELETE: api/Comments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(long id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
            {
                return NotFound();
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CommentExists(long id)
        {
            return _context.Comments.Any(e => e.Id == id);
        }
    }
}
