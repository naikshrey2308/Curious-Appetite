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
    public class IngredientController : ControllerBase
    {
        private readonly CuriousAppetiteDbContext _context;

        public IngredientController(CuriousAppetiteDbContext context)
        {
            _context = context;
        }

        // GET: api/Ingredient
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ingredient>>> GetIngredients()
        {
            return await _context.Ingredients.ToListAsync();
        }

        // GET: api/Ingredient/5
        [HttpGet("{recipeId}")]
        public async Task<ActionResult<List<Ingredient>>> GetIngredient(long recipeId)
        {
            var ingredients = await _context.RecipeIngredients.Include(i => i.Ingredient).Where(i => i.RecipeId == recipeId).ToListAsync();

            if (ingredients == null)
            {
                return NotFound();
            }

            return Ok(ingredients);
        }

        [HttpGet("/api/IngredientByName/{name}")]
        public async Task<ActionResult<List<Ingredient>>> GetIngredient(string name)
        {
            var ingredient = await _context.Ingredients.Where(e => e.Name.Contains(name.ToLower())).Take(25).ToListAsync();

            if (ingredient == null)
            {
                return NotFound();
            }

            return ingredient;
        }

        // PUT: api/Ingredient/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutIngredient(long id, Ingredient ingredient)
        {
            if (id != ingredient.Id)
            {
                return BadRequest();
            }

            _context.Entry(ingredient).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IngredientExists(id))
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

        // POST: api/Ingredient
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Ingredient>> PostIngredient(Ingredient ingredient)
        {
            ingredient.Name = ingredient.Name.ToLower();
            _context.Ingredients.Add(ingredient);
            await _context.SaveChangesAsync();

            return Ok(ingredient);
        }

        // DELETE: api/Ingredient/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIngredient(long id)
        {
            var ingredient = await _context.Ingredients.FindAsync(id);
            if (ingredient == null)
            {
                return NotFound();
            }

            _context.Ingredients.Remove(ingredient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool IngredientExists(long id)
        {
            return _context.Ingredients.Any(e => e.Id == id);
        }
    }
}
