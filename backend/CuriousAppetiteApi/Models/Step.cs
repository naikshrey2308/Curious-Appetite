using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuriousAppetiteApi.Models
{
    public class Step
    {
        [Key]
        [Required]
        public long Id { get; set; }

        [ForeignKey("RecipeId")]
        public long RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;

        public int Order { get; set; }

        public string Description { get; set; } = null!;
        public string? StepImagePath { get; set; }
    }
}
