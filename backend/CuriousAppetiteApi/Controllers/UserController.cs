using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CuriousAppetiteApi.Context;
using CuriousAppetiteApi.Models;
using System.Security.Cryptography;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Hosting;
using AutoMapper;
using CuriousAppetiteApi.Mappings;
using Microsoft.AspNetCore.Authorization;
using CuriousAppetiteApi.Auth;

namespace CuriousAppetiteApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly CuriousAppetiteDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly IMapper _mapper;
        private readonly IJWTManagerRepository _JWTManager;

        public UserController(CuriousAppetiteDbContext context, IWebHostEnvironment hostEnvironment, IMapper mapper, IJWTManagerRepository JWTManager)
        {
            _context = context;
            _hostEnvironment = hostEnvironment;
            _mapper = mapper;
            _JWTManager = JWTManager;
        }

        [AllowAnonymous]
        [HttpPost("Auth")]
        public IActionResult Authenticate(User usersdata)
        {
            var token = _JWTManager.Authenticate(usersdata);

            if (token == null)
            {
                return Unauthorized();
            }

            return Ok(token);
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users =  await _context.Users.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<UserDTO>>(users));
        }

        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(long id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT: api/User/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(long id, [FromForm]IFormFile? file, [FromForm]IFormCollection data)
        {
            if (id != long.Parse(data["id"]))
            {
                return BadRequest();
            }

            User? user = _context.Users.Find(long.Parse(data["id"]));

            if (user == null)
            {
                return BadRequest();
            }
            else
            {
                user.Name = data["name"];
                user.Email = data["email"];
                user.Password = data["password"];
                user.Gender = data["gender"];
            }

            // update the profile picture of the user
            try
            {
                if (file == null || file.Length == 0)
                {

                }
                else
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;

                    //create unique name for file
                    var fileName = data["email"] + Path.GetExtension(file.FileName);

                    /*//set file url
                    var savePath = Path.Combine(Directory.GetCurrentDirectory(), "assets/images/users", fileName);

                    using (var stream = new FileStream(savePath, FileMode.CreateNew))
                    {
                        file.CopyTo(stream);
                    }
*/

                    if (user.ProfilePicturePath != null && user.ProfilePicturePath.Contains("default"))
                    {
                        string path = Path.Combine(wwwRootPath + "/assets/images/users", fileName);
                        await file.CopyToAsync(new FileStream(path, FileMode.Create));
                    }
                    else
                    {
                        System.GC.Collect();
                        System.GC.WaitForPendingFinalizers();
                        System.IO.File.Delete(wwwRootPath + "/" + user.ProfilePicturePath);
                        string path = Path.Combine(wwwRootPath + "/" + user.ProfilePicturePath);
                        await file.CopyToAsync(new FileStream(path, FileMode.Create));
                    }

                    user.ProfilePicturePath = "assets/images/users/" + fileName;
                }
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(user.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(user);
        }

        // POST: api/User
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost()]
        public async Task<ActionResult<User>> RegisterUser([FromForm] IFormFile? file, [FromForm] IFormCollection data)
        {
            User user = new User();
            user.Name = data["name"];
            user.Email = data["email"];
            user.Password = data["password"];
            user.Gender = data["gender"];
            user.ProfilePicturePath = "assets/images/users/" + data["filePath"];
            try
            {
                if (file == null || file.Length == 0)
                {
                    
                } 
                else 
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;

                    //create unique name for file
                    var fileName = data["email"] + Path.GetExtension(file.FileName);

                    /*//set file url
                    var savePath = Path.Combine(Directory.GetCurrentDirectory(), "assets/images/users", fileName);

                    using (var stream = new FileStream(savePath, FileMode.CreateNew))
                    {
                        file.CopyTo(stream);
                    }
*/
                    string path = Path.Combine(wwwRootPath + "/assets/images/users", fileName);
                    await file.CopyToAsync(new FileStream(path, FileMode.Create));

                    user.ProfilePicturePath = "assets/images/users/" + fileName;
                }

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(_mapper.Map<User, UserDTO>(user));
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
            /*            else
                        {
                            user.ProfilePicturePath = "/assets/images/users/default.png";
                        }*/
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("Login")]
        public async Task<IActionResult> LoginUser([FromBody] dynamic user_arg)
        {
            var user = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(user_arg);
            string email = user["email"];
            string password = user["password"];
            User? currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (currentUser == null)
            {
                return NotFound();
            }
            else if (currentUser.Password != password)
            {
                return Unauthorized();
            }

            return Ok(_mapper.Map<User, UserDTO>(currentUser));
        }

        [HttpPost("Logout")]
        public IActionResult LogoutUser()
        {
            /*if(HttpContext.Session.GetString("userEmail") == null)
            {
                return NotFound();
            }
            else
            {
                HttpContext.Session.Remove("userId");
                HttpContext.Session.Remove("userEmail");
                HttpContext.Session.Remove("userName");
                return Ok();
            }*/
            return Ok();
        }

        private bool UserExists(long id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
