using CuriousAppetiteApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CuriousAppetiteApi.Context
{
    public class CuriousAppetiteDbContext : DbContext
    {
        public CuriousAppetiteDbContext(DbContextOptions<CuriousAppetiteDbContext> options) : base(options)
        { 
            
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Rating>()
                .HasKey(r => new { r.UserId, r.RecipeId });

            builder.Entity<RecipeIngredient>()
                .HasKey(i => new { i.RecipeId, i.IngredientId });

            builder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Rating>()
                .HasOne(r => r.User)
                .WithMany()
                .OnDelete(DeleteBehavior.NoAction);
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Recipe> Recipes { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Ingredient> Ingredients { get; set; } = null!;
        public DbSet<Rating> Ratings { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Step> Steps { get; set; } = null!;
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; } = null!;
    }
}
