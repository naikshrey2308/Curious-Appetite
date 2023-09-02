using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuriousAppetiteApi.Context;
using CuriousAppetiteApi.Models;
using Microsoft.Extensions.Hosting;
using AutoMapper;
using CuriousAppetiteApi.Mappings;
using Microsoft.AspNetCore.Authorization;

namespace CuriousAppetiteApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly CuriousAppetiteDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly IMapper _mapper;

        public RecipesController(CuriousAppetiteDbContext context, IWebHostEnvironment hostEnvironment, IMapper mapper)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
            _mapper = mapper;
        }

        // GET: api/Recipes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Recipe>>> GetRecipes()
        {
            var recipes = await _context.Recipes.Include(r => r.Category).Include(r => r.User).ToListAsync();
            return Ok(recipes);
        }

        [HttpGet("MyRecipes/{id}")]
        public async Task<ActionResult<IEnumerable<Recipe>>> MyRecipes(long id)
        {
            var recipes = await _context.Recipes.Include(r => r.User).Include(r => r.Category).Where(r => r.UserId == id).Take(25).ToListAsync();
            if(recipes == null)
            {
                return NotFound();
            }
            return Ok(recipes);
        }

        [HttpGet("RandomPicks")]
        public async Task<ActionResult<IEnumerable<Recipe>>> RandomPicks()
        {
            Random rand = new Random();
            var recipes = await _context.Recipes.Include(r => r.User).Include(r => r.Category).ToListAsync();
            recipes = recipes.OrderBy(e => rand.Next()).ToList();
            if (recipes == null)
            {
                return NotFound();
            }
            return Ok(recipes);
        }

        [HttpGet("Search/{search}")]
        public async Task<ActionResult<IEnumerable<Recipe>>> SearchRecipes(string search)
        {
            var recipes = await _context.Recipes.Include(r => r.User).Include(r => r.Category).Where(r => (r.Name.Contains(search) || r.User.Name.Contains(search) || r.Category.Name.Contains(search)) && r.Published == true).Take(10).ToListAsync();
            if (recipes == null)
            {
                return NotFound();
            }
            return Ok(recipes);
        }

        // GET: api/Recipes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Recipe>> GetRecipe(long id)
        {
            var recipe = await _context.Recipes.Include(r => r.User).Include(r => r.Category).FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null)
            {
                return NotFound();
            }

            return recipe;
        }

        [HttpPut("Save/{id}")]
        public async Task<ActionResult<Recipe>> SaveRecipe(long id)
        {
            var recipe = await _context.Recipes.FindAsync(id);

            if (recipe == null)
            {
                return NotFound();
            }

            recipe.Published = false;
            _context.Entry(recipe).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return recipe;
        }

        [HttpPut("Publish/{id}")]
        public async Task<ActionResult<Recipe>> PublishRecipe(long id)
        {
            var recipe = await _context.Recipes.FindAsync(id);

            if (recipe == null)
            {
                return NotFound();
            }

            recipe.Published = true;
            _context.Entry(recipe).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return recipe;
        }

        // PUT: api/Recipes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecipe(long id, [FromForm] IFormFile? file, IFormCollection data)
        {
            if (long.Parse(data["id"]) != id)
            {
                return BadRequest();
            }

            Recipe recipe = new Recipe();
            recipe.Id = id;
            recipe.UserId = long.Parse(data["userId"]);
            recipe.Name = data["name"];
            recipe.Description = data["description"];
            recipe.Rating = int.Parse(data["Rating"]);
            recipe.UploadDate = DateTime.Parse(data["uploadDate"]);
            recipe.Published = bool.Parse(data["published"]);
            recipe.CategoryId = long.Parse(data["categoryId"]);
            recipe.PreparationTime = int.Parse(data["preparationTime"]);
            recipe.EndNote = data["endNote"];
            User? user = await _context.Users.FindAsync(recipe.UserId);
            if (user == null)
            {
                return Unauthorized();
            }
            recipe.User = user;
            Category? category = await _context.Categories.FindAsync(recipe.CategoryId);
            recipe.Category = category;
            recipe.RecipeImagePath = data["recipeImagePath"];

            try
            {
                if (file == null || file.Length == 0)
                {

                }
                else
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;

                    //create unique name for file
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);

                    /*//set file url
                    var savePath = Path.Combine(Directory.GetCurrentDirectory(), "assets/images/users", fileName);

                    using (var stream = new FileStream(savePath, FileMode.CreateNew))
                    {
                        file.CopyTo(stream);
                    }
*/
                    string path = Path.Combine(wwwRootPath + "/assets/images/recipes", fileName);
                    await file.CopyToAsync(new FileStream(path, FileMode.Create));

                    recipe.RecipeImagePath = "assets/images/recipes/" + fileName;

                    /*System.GC.Collect();
                    System.GC.WaitForPendingFinalizers();
                    System.IO.File.Delete(wwwRootPath + "/" + recipe.RecipeImagePath);*/
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            _context.Entry(recipe).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecipeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(recipe);
        }

        // POST: api/Recipes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Recipe>> PostRecipe([FromForm] IFormFile? file, IFormCollection data)
        {
            Recipe recipe = new Recipe();
            recipe.UserId = long.Parse(data["userId"]);
            recipe.Name = data["name"];
            recipe.Description = data["description"];
            recipe.Rating = int.Parse(data["Rating"]);
            recipe.UploadDate = DateTime.Parse(data["uploadDate"]);
            recipe.Published = bool.Parse(data["published"]);
            recipe.CategoryId = long.Parse(data["categoryId"]);
            recipe.PreparationTime = int.Parse(data["preparationTime"]);
            recipe.EndNote = data["endNote"];
            User? user = await _context.Users.FindAsync(recipe.UserId);
            if (user == null)
            {
                return Unauthorized();
            }
            recipe.User = user;
            Category? category = await _context.Categories.FindAsync(recipe.CategoryId);
            recipe.Category = category;
            recipe.RecipeImagePath = "assets/images/recipes/default.jpg";

            try
            {
                if (file == null || file.Length == 0)
                {

                }
                else
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;

                    //create unique name for file
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);

                    /*//set file url
                    var savePath = Path.Combine(Directory.GetCurrentDirectory(), "assets/images/users", fileName);

                    using (var stream = new FileStream(savePath, FileMode.CreateNew))
                    {
                        file.CopyTo(stream);
                    }
*/
                    string path = Path.Combine(wwwRootPath + "/assets/images/recipes", fileName);
                    await file.CopyToAsync(new FileStream(path, FileMode.Create));

                    recipe.RecipeImagePath = "assets/images/recipes/" + fileName;
                }
            }
            catch (Exception ex) {
                return BadRequest(recipe);
            }

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            return Ok(recipe);
        }

        // DELETE: api/Recipes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(long id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                return NotFound();
            }

            string wwwRootPath = _hostEnvironment.WebRootPath;
            System.GC.Collect();
            System.GC.WaitForPendingFinalizers();
            System.IO.File.Delete(wwwRootPath + "/" + recipe.RecipeImagePath);

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RecipeExists(long id)
        {
            return _context.Recipes.Any(e => e.Id == id);
        }
    }
}
