using System.ComponentModel.DataAnnotations;

namespace CuriousAppetiteApi.Mappings
{
    public class UserDTO
    {
            public long Id { get; set; }

            public string Name { get; set; } = null!;

            public string Email { get; set; } = null!;

            public string? ProfilePicturePath { get; set; }
    }
}
