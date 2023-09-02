using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace CuriousAppetiteApi.Models
{
    public class User
    {
        [Required]
        public long Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        public string? Gender { get; set; }

        public string? ProfilePicturePath { get; set; }
    }
}
