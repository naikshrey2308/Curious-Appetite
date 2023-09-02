using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuriousAppetiteApi.Models
{
    public class Recipe
    {
        [Key]
        [Required]
        public long Id { get; set; }

        [ForeignKey("UserId")]
        public long UserId { get; set; }
        public User User { get; set; } = null!;

        [ForeignKey("CategoryId")]
        public long CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        [Required]
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string RecipeImagePath { get; set; } = null!;
        public DateTime UploadDate { get; set; }
        public int PreparationTime { get; set; }
        public int Rating { get; set; }
        public string EndNote { get; set; } = null!;
        public bool Published { get; set; } = false;
    }
}
