using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CuriousAppetiteApi.Models
{
    public class Rating
    {      
        [ForeignKey("RecipeId")]
        public long RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;

        [ForeignKey("UserId")]
        public long UserId { get; set; }
        public User User { get; set; } = null!;
        public int RatingLevel { get; set; }
    }
}
