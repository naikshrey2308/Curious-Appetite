using AutoMapper;
using CuriousAppetiteApi.Models;

namespace CuriousAppetiteApi.Mappings
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<User, UserDTO>();
        }
    }
}
