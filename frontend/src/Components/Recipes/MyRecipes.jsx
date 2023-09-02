import axios from "axios";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { MdCalendarToday, MdClose, MdDelete, MdEdit, MdEditNote, MdLockClock, MdOutlineEditNote, MdRemoveRedEye, MdRestaurant, MdSell, MdTimer } from "react-icons/md";
import Configuration from "../../config";
import HomeContext from "../../pages/home/HomeContext";
import UserContext from "../../UserContext";
import MyRecipesContext from "./MyRecipesContext";
import { useNavigate } from "react-router-dom";

function MyRecipes(props) {

    const navigator = useNavigate();

    const [user, setUser] = useContext(UserContext);
    const [, , authenticated, setAuthenticated] = useContext(HomeContext);

    const [panelStyle, setPanelStyle] = useState(null);
    const [recipes, setRecipes] = useState([]);

    const panel = useRef();

    function closePanel() {
        navigator("/");
    }

    function editRecipe(event, element) {
        event.stopPropagation();
        navigator(`/recipe/edit/${element.id}`);
    }
    
    async function deleteRecipe(event, element) {
        event.stopPropagation();
        const res = await axios.delete(`${Configuration.host}/api/Recipes/${element.id}`);
        console.log(res);
        setRecipes([...recipes.filter(r => r.id != element.id)]);
    }

    useEffect(() => {
        setPanelStyle({
            animation: `slideInUp 0.3s ease-out forwards`,
            // marginTop: "25px",
            width: "30%", 
            zIndex: 1000,
            overflowY: "auto"
        });

        (async function() {
            const res = await axios.get(`${Configuration.host}/api/Recipes/MyRecipes/${user.id}`);
            setRecipes(res.data);
        })();

    }, [panel.current]);

    return (
        (authenticated) &&
        <>
            <div ref={panel} style={panelStyle} className="position-fixed w-100 border-end border-2 end-0 bottom-0 start-0 top-0 min-vh-100 bg-light">
                <p className="text-end p-3">
                    <button onClick={closePanel} className="btn btn-transparent">
                        <MdClose size={30} className="text-secondary"></MdClose>
                    </button>
                </p>
                <div className="w-75 mx-auto text-center">
                    <h1 className="font-cursive heading-underline">Recipes Made By You</h1>

                    <div style={{flexWrap: "wrap", flexBasis: "33.33%"}} className="mt-5 d-flex px-4 mx-auto text-center justify-content-center">
                        {
                            recipes.map(ele => {
                                return (
                                    <div className="searched-recipe-block p-2 text-start position-relative br-5 my-3 mx-3">
                                        <div style={{zIndex: 1002}} className="action-icons w-100 text-center br-50 py-1 px-2 position-absolute">
                                            <MdRemoveRedEye title="View Recipe" onClick={() => navigator(`/recipe/view/${ele.id}`)} size={40} className="action-icon text-dark mx-1 br-50-p" />
                                            <MdEditNote title="Edit Recipe" onClick={(e) => editRecipe(e, ele)} size={40} className="action-icon text-dark mx-1 br-50-p" />
                                            <MdDelete title="Delete Recipe" onClick={(e) => deleteRecipe(e, ele)} size={40} className="action-icon text-danger mx-1 br-50-p" />
                                        </div>
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
                                                     <MdCalendarToday className="text-secondary align-middle me-1 p-1" size={22} />
                                                     {new Date(ele.uploadDate).toLocaleDateString()}
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

export default memo(MyRecipes);