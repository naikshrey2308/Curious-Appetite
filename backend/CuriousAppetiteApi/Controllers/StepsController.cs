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

namespace CuriousAppetiteApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StepsController : ControllerBase
    {
        private readonly CuriousAppetiteDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;

        public StepsController(CuriousAppetiteDbContext context, IWebHostEnvironment hostEnvironment)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
        }

        // GET: api/Steps
        [HttpGet("ByRecipe/{recipeId}")]
        public async Task<ActionResult<IEnumerable<Step>>> GetSteps(long recipeId)
        {
            return await _context.Steps.Where(s => s.RecipeId == recipeId).ToListAsync();
        }

        // GET: api/Steps/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Step>> GetStep(long id)
        {
            var step = await _context.Steps.FindAsync(id);

            if (step == null)
            {
                return NotFound();
            }

            return step;
        }

        // PUT: api/Steps/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStep(long id, [FromForm] IFormFile? file, [FromForm] IFormCollection data)
        {
            Step? step = await _context.Steps.FindAsync(long.Parse(data["id"]));
            if(step == null)
            {
                return NotFound();
            }
/*      
            try
            {
                if (file == null || file.Length == 0)
                {

                }
                else
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string path = Path.Combine(wwwRootPath + "/assets/images/steps", fileName);
                    await file.CopyToAsync(new FileStream(path, FileMode.Create));
                    step.StepImagePath = "assets/images/steps/" + fileName;
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
*/
            if (id != step.Id)
            {
                return BadRequest();
            }

            step.Order = int.Parse(data["order"]);

            _context.Entry(step).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StepExists(id))
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

        // POST: api/Steps
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Step>> PostStep([FromForm] IFormFile? file, [FromForm] IFormCollection data)
        {
            Step step = new Step();
            step.RecipeId = long.Parse(data["recipeId"]);
            Recipe? recipe = await _context.Recipes.FindAsync(step.RecipeId);
            if (recipe == null)
            {
                return BadRequest();
            }
            step.Order = int.Parse(data["order"]);
            step.Description = data["description"];
            step.StepImagePath = "/assets/images/steps/default.jpg";

            try
            {
                if (file == null || file.Length == 0)
                {

                }
                else
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string path = Path.Combine(wwwRootPath + "/assets/images/steps", fileName);
                    await file.CopyToAsync(new FileStream(path, FileMode.Create));
                    step.StepImagePath = "assets/images/steps/" + fileName;
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            _context.Steps.Add(step);
            await _context.SaveChangesAsync();

            return Ok(step);
        }

        // DELETE: api/Steps/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStep(long id)
        {
            var step = await _context.Steps.FindAsync(id);
            if (step == null)
            {
                return NotFound();
            }

            if(!step.StepImagePath!.Contains("default"))
            {
                string wwwRootPath = _hostEnvironment.WebRootPath;
                System.GC.Collect();
                System.GC.WaitForPendingFinalizers();
                System.IO.File.Delete(wwwRootPath + "/" + step.StepImagePath);
            }

            _context.Steps.Remove(step);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StepExists(long id)
        {
            return _context.Steps.Any(e => e.Id == id);
        }
    }
}
