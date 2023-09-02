using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuriousAppetiteApi.Models
{
    public class Comment
    {
        [Key]
        [Required]
        public long Id { get; set; }

        [ForeignKey("UserId")]
        public long UserId { get; set; }
        public User User { get; set; } = null!;

        [ForeignKey("RecipeId")]
        public long RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;

        public DateTime UploadDate { get; set; }
        [Required]
        public string Description { get; set; } = null!;

    }
}
