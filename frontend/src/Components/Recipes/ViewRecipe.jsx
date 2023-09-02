import axios from "axios";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { MdAdd, MdCalendarToday, MdClose, MdPerson, MdSearch, MdSell, MdTag, MdTimer } from "react-icons/md";
import Configuration from "../../config";
import Input from "../FormComponents/Input";
import CreateRecipeContext from "./CreateRecipeContext";
import { useNavigate } from "react-router-dom";
import HomeContext from "../../pages/home/HomeContext";
import SearchContext from "../../pages/home/SearchContext";

function ViewRecipe(props) {

    const navigator = useNavigate();

    const [createRecipePanel, toggleCreateRecipePanel] = useContext(CreateRecipeContext);
    const [, , authenticated, ,] = useContext(HomeContext);

    const [search, setSearch] = useContext(SearchContext);
    const [fetchedRecipes, setFetchedRecipes] = useState([]);
    const [topPicks, setTopPicks] = useState([]);
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchBox, toggleSearchBox] = useState(false);

    const searchRef = useRef();
    const categoryRef = useRef();

    async function changeCategory() {
        if(categoryRef.current.value != null && categoryRef.current.value != "")
            toggleSearchBox(true);
        else
            toggleSearchBox(false);

        setCategory(categoryRef.current.value);
        const res = await axios.get(`${Configuration.host}/api/CategoryByName/${categoryRef.current.value.toString().toLowerCase()}`);
        // console.log(res.data);
        if(res.status == 200) {
            setCategories(res.data ?? []);
        } else if(res.status == 404) {
            setCategories([]);
        }   
    }

    function chooseCategory(value) {
        setCategory(value.name);
        toggleSearchBox(false);
    }

    async function searchRecipes() {
        setSearch(searchRef.current.value);
        await fetchRecipes();
    }

    function clearSearch() {
        setSearch(null);
        searchRef.current.value = "";
    }

    async function fetchRecipes() {        
        const res = await axios.get(`${Configuration.host}/api/Recipes/Search/${searchRef.current.value}`);
        // console.log(res);
        setFetchedRecipes(res.data);
    }

    useEffect(() => {
        (async function() {
            const picks = await axios.get(`${Configuration.host}/api/Recipes/RandomPicks/`);
            // console.log(picks);
            setTopPicks(picks.data);
        })();
    }, []);

    return (
        (authenticated) &&
        <>
            <div className="search-recipe-block bg-light text-start position-relative br-5 py-3 mx-3">
                <h1 className="text-center font-cursive mt-5 heading-underline">"Random Picks"</h1>
                <div style={{flexWrap: "wrap"}} className="mt-5 mx-auto d-flex justify-content-center text-center">
                {
                    topPicks.map(ele => {
                        return (
                            <div onClick={() => navigator("/recipe/view/" + ele.id)} style={{cursor: "pointer"}} className="search-recipe-block p-2 text-start position-relative br-5 my-3 mx-3">
                                <img style={{objectFit: "cover", zIndex: 2}} width={250} height={250} className="recipe-img border mx-auto d-block br-5" src={`${Configuration.host}/${ele.recipeImagePath}`} />
                                <div className="p-2 pt-2">
                                    <h6 className="text-center">{ele.name}</h6>
                                    <div className="d-flex justify-content-evenly">
                                        <div style={{fontSize: 14}} className="d-flex text-secondary justify-items-center mx-2">
                                             <MdTimer className="text-secondary align-middle me-1 p-1" size={22} />
                                             {ele.preparationTime} min
                                         </div>
                                        <div style={{fontSize: 14}} className="d-flex text-secondary justify-items-center mx-2">
                                             <MdSell className="text-secondary align-middle me-1 p-1" size={22} />
                                             {ele.category.name.charAt(0).toUpperCase() + ele.category.name.substring(1,)}
                                         </div>
                                        <div style={{fontSize: 14}} className="d-flex text-secondary justify-items-center mx-2">
                                             <img style={{objectFit: "cover"}} src={`${Configuration.host}/${ele.user.profilePicturePath}`} width={22} className="br-50-p me-2 border"></img>
                                             {ele.user.name}
                                         </div>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                            
                            )
                        })
                    }
                    </div>
            </div>

            <div id="view-recipes" className="min-vh-100 bg-light">
                <div className="container">
                    <h1 className="text-center heading-underline font-cursive pt-5">
                        "Search recipes to make and devour!"
                    </h1>
                    {/* <p className="text-secondary mx-auto text-center mt-4">
                        Click on the search box below and start surfing. Type the name of the dish, creator's name to search the recipe.
                    </p> */}
                    <div className="text-center mt-5 pt-3">
                        {/* <button onClick={() => toggleCreateRecipePanel(true)} className="btn br-50 btn-primary">
                            <MdAdd size={25}></MdAdd>
                            Create My Own Recipe
                        </button> */}
                        <div className="w-50 mx-auto d-flex border border-2 br-50">
                            <input ref={searchRef} value={search} onChange={searchRecipes} type={"text"} style={{borderRadius: "50px 0 0 50px"}} className="py-3 w-100 input-control form-control mx-auto px-4 border-0" placeholder="Recipe, Category or Creator's Name" />
                            <button onClick={clearSearch} style={{borderRadius: "0 50px 50px 0", backgroundColor: "white"}} className="br-50 btn text-secondary">
                                {
                                    (search != null && search != "") &&
                                    <MdClose size={25} className="mx-2" />
                                }
                                {
                                    (search == null || search == "") &&
                                    <MdSearch size={25} className="mx-2" />
                                }
                            </button>
                        </div>
                    </div>

                    <div style={{flexWrap: "wrap"}} className="mt-5 mx-auto d-flex justify-content-center text-center">
                    {
                            (search != null && search != "") &&
                            fetchedRecipes.map(ele => {
                                return (
                                    <div onClick={() => navigator("/recipe/view/" + ele.id)} style={{cursor: "pointer"}} className="search-recipe-block p-2 text-start position-relative br-5 my-3 mx-3">
                                        <img style={{objectFit: "cover", zIndex: 1000}} width={250} height={250} className="recipe-img border mx-auto d-block br-5" src={`${Configuration.host}/${ele.recipeImagePath}`} />
                                        <div className="p-2 pt-2">
                                            <h6 className="text-center">{ele.name}</h6>
                                            <div className="d-flex justify-content-evenly">
                                                <div style={{fontSize: 14}} className="d-flex text-secondary justify-items-center mx-2">
                                                     <MdTimer className="text-secondary align-middle me-1 p-1" size={22} />
                                                     {ele.preparationTime} min
                                                 </div>
                                                <div style={{fontSize: 14}} className="d-flex text-secondary justify-items-center mx-2">
                                                     <MdSell className="text-secondary align-middle me-1 p-1" size={22} />
                                                     {ele.category.name.charAt(0).toUpperCase() + ele.category.name.substring(1,)}
                                                 </div>
                                                <div style={{fontSize: 14}} className="d-flex text-secondary justify-items-center mx-2">
                                                     <img style={{objectFit: "cover"}} src={`${Configuration.host}/${ele.user.profilePicturePath}`} width={22} className="br-50-p me-2 border"></img>
                                                     {ele.user.name}
                                                 </div>
                                                <div></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default memo(ViewRecipe);