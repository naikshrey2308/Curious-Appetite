using CuriousAppetiteApi.Auth;
using CuriousAppetiteApi.Models;

namespace CuriousAppetiteApi.Auth
{
    public interface IJWTManagerRepository
    {
        Token Authenticate(User users);
    }

}