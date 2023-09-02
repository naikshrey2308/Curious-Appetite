using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace CuriousAppetiteApi.Models
{
    public class Category
    {
        [Key]
        [Required]
        public long Id { get; set; }
        [Required]
        [NotNull]
        public string Name { get; set; } = null!;
    }
}
