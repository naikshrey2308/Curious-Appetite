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
    public class RecipeIngredientsController : ControllerBase
    {
        private readonly CuriousAppetiteDbContext _context;

        public RecipeIngredientsController(CuriousAppetiteDbContext context)
        {
            _context = context;
        }

        // GET: api/RecipeIngredients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecipeIngredient>>> GetRecipeIngredients()
        {
            return await _context.RecipeIngredients.ToListAsync();
        }

        // GET: api/RecipeIngredients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RecipeIngredient>> GetRecipeIngredient(long id)
        {
            var recipeIngredient = await _context.RecipeIngredients.FindAsync(id);

            if (recipeIngredient == null)
            {
                return NotFound();
            }

            return recipeIngredient;
        }

        // PUT: api/RecipeIngredients/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecipeIngredient(long id, RecipeIngredient recipeIngredient)
        {
            if (id != recipeIngredient.RecipeId)
            {
                return BadRequest();
            }

            _context.Entry(recipeIngredient).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecipeIngredientExists(id))
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

        // POST: api/RecipeIngredients
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<RecipeIngredient>> PostRecipeIngredient([FromForm]IFormCollection data)
        {
            RecipeIngredient recipeIngredient = new RecipeIngredient();
            recipeIngredient.RecipeId = long.Parse(data["recipeId"]);
            recipeIngredient.IngredientId = long.Parse(data["ingredientId"]);
            Recipe? recipe = await _context.Recipes.FindAsync(recipeIngredient.RecipeId);
            if (recipe == null)
            {
                return BadRequest();
            }
            recipeIngredient.Recipe = recipe;
            Ingredient? ingredient = await _context.Ingredients.FindAsync(recipeIngredient.IngredientId);
            if (ingredient == null)
            {
                return BadRequest();
            }
            recipeIngredient.Ingredient = ingredient;
            _context.RecipeIngredients.Add(recipeIngredient);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RecipeIngredientExists(recipeIngredient.RecipeId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Ok(recipeIngredient);
        }

        // DELETE: api/RecipeIngredients/5
        [HttpDelete("{recipeId}/{ingredientId}")]
        public async Task<IActionResult> DeleteRecipeIngredient(long recipeId, long ingredientId)
        {
            RecipeIngredient recipeIngredient = await _context.RecipeIngredients.FirstOrDefaultAsync(ele => (ele.RecipeId == recipeId && ele.IngredientId == ingredientId));
            if (recipeIngredient == null)
            {
                return NotFound();
            }

            _context.RecipeIngredients.Remove(recipeIngredient);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool RecipeIngredientExists(long id)
        {
            return _context.RecipeIngredients.Any(e => e.RecipeId == id);
        }
    }
}
