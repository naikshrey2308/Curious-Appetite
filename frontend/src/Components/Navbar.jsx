import { memo, useContext, useEffect, useRef } from "react";
import { BiLogIn } from "react-icons/bi";
import HomeContext from "../pages/home/HomeContext";
import UserContext from "../UserContext";
import Configuration from "../config";
import ProfileContext from "./User/ProfileContext";
import "../App.css";
import { MdAdd, MdDinnerDining, MdKitchen, MdRemoveRedEye, MdSearch } from "react-icons/md";
import CreateRecipeContext from "./Recipes/CreateRecipeContext";
import MyRecipesContext from "./Recipes/MyRecipesContext";
import { useNavigate } from "react-router-dom";

function Navbar(props) {
    const [loginPanel, toggleLoginPanel, authenticated, setAuthenticated] = useContext(HomeContext);
    const [profilePanel, toggleProfilePanel] = useContext(ProfileContext);
    const [createRecipePanel, toggleCreateRecipePanel] = useContext(CreateRecipeContext);
    const [myRecipesPanel, toggleMyRecipesPanel] = useContext(MyRecipesContext);
    const [user, setUser] = useContext(UserContext);
    const navRef = useRef();
    const colorRef = useRef();
    const colorRef2 = useRef();

    const navigator = useNavigate();
    
    async function Logout() {
        // const req = await fetch(`${Configuration.host}/api/User/Logout`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: ""
        // })
        // let res = await req.json();
        // console.log(res);
        setAuthenticated(false);
        setUser(null);
        localStorage.clear();
        navigator("/");
    }

    useEffect(() => {

        const scroller = () => {
            if(window.scrollY < 25) {
                navRef.current.classList.replace("navbar-light", "navbar-dark");
                navRef.current.classList.replace("bg-light", "bg-transparent");
                navRef.current.classList.remove("border-bottom", "border-1");
                colorRef.current.classList.replace("text-dark", "text-light");
                colorRef2.current.classList.replace("text-dark", "text-light");
            } else {
                navRef.current.classList.add("border-bottom", "border-1");
                navRef.current.classList.replace("navbar-dark", "navbar-light");
                navRef.current.classList.replace("bg-transparent", "bg-light");
                colorRef.current.classList.replace("text-light", "text-dark");
                colorRef2.current.classList.replace("text-light", "text-dark");
            }
        }
        window.addEventListener("scroll", scroller);

        if(authenticated) {
            navRef.current.classList.replace("navbar-dark", "navbar-light");
            navRef.current.classList.replace("bg-transparent", "bg-light");
            navRef.current.classList.add("border-bottom", "border-1");
            window.scrollTo({
                top: window.outerHeight / 2,
                behavior: "smooth",
            });
        } else {
            navRef.current.classList.remove("border-bottom", "border-1");
            navRef.current.classList.replace("navbar-light", "navbar-dark");
            navRef.current.classList.replace("bg-light", "bg-transparent");
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        return () => window.removeEventListener("scroll", scroller);
    }, [authenticated]);

    return (
        <>
            <nav ref={navRef} style={{"zIndex": 999}} className="navbar navbar-expand-lg fixed-top navbar-dark bg-transparent">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <img src="/images/logos/logo.png" width={50} />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav d-flex align-items-center justify-content-end me-0 mb-2 mb-lg-0" style={{width: "65%"}}>
                        {/* <li className="nav-item px-3">
                            <a className="nav-link active" aria-current="page" role={"button"} onClick={() => navigator("/")}>Home</a>
                        </li> */}
                        <li className="nav-item px-3">
                            {/* <a className="nav-link active" aria-current="page" href="#">Recipes</a> */}
                            <div class="dropdown">
                            <button ref={colorRef2} className="text-dark btn btn-transparent dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Recipes &nbsp;
                            </button>
                            <ul class="dropdown-menu br-5" aria-labelledby="dropdownMenuButton1">
                                <li><a class="dropdown-item my-1 py-2 px-3 me-3" role={"button"} onClick={() => navigator("/recipe/create")}>
                                    <MdAdd size={25} className="text-secondary me-2" />
                                    Create Recipe
                                    </a></li>
                                <li><a class="dropdown-item my-1 py-2 px-3 me-3" href="#view-recipes">
                                    <MdSearch size={25} className="text-secondary me-2" />
                                    Find Recipes
                                    </a></li>
                                <li><a onClick={() => navigator("/recipe/my")} class="dropdown-item my-1 py-2 px-3 me-3" href="#">
                                    <MdKitchen size={25} className="text-secondary me-2" />
                                    My Recipes
                                    </a></li>
                            </ul>
                            </div>
                        </li>
                        <li className="nav-item px-3">
                            <a className="nav-link active" style={{opacity: 0}} aria-current="page">Rate</a>
                        </li>

                    </ul>
                    {
                        (user) &&
                        <div ref={colorRef} className="text-dark dropdown d-flex justify-content-end w-50 text-end">
                            <img className="circle-img me-2" width={30} height={30} src={`${Configuration.host}/${user.profilePicturePath}`}></img>
                            <div>
                                <span style={{cursor: "pointer"}} className="me-3 dropdown-toggle" data-bs-toggle="dropdown">
                                    {user.name}
                                </span>
                                <ul className="dropdown-menu position-absolute end-0 start-50">
                                    <li><a onClick={() => toggleProfilePanel(true)} className="dropdown-item py-2">My Profile</a></li>
                                    <li><a className="dropdown-item py-2">My Recipes</a></li>
                                    <li><a onClick={Logout} className="dropdown-item py-2">Logout</a></li>
                                </ul>
                            </div>
                        </div>
                    }
                    { (!user) && 
                        <div className="d-flex justify-content-end w-50 text-end">
                            <button onClick={() => toggleLoginPanel(true)} className="d-flex align-items-center border-0 br-50 bg-success px-4 py-2 text-light">
                                Login
                                <BiLogIn size={25} className="mx-2 my-1"></BiLogIn>
                            </button>
                        </div>
                    }
                    </div>
                </div>
            </nav>
        </>
    );
}

export default memo(Navbar);