using System.ComponentModel.DataAnnotations.Schema;

namespace CuriousAppetiteApi.Models
{
    public class RecipeIngredient
    {
        [ForeignKey("RecipeId")]
        public long RecipeId { get; set; }
        public Recipe Recipe { get; set; } = null!;

        [ForeignKey("IngredientId")]
        public long IngredientId { get; set; }
        public Ingredient Ingredient { get; set; } = null!;
    }
}
