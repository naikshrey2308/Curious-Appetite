import axios from "axios";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { MdAdd, MdAddCircle, MdArrowDownward, MdArrowUpward, MdChatBubble, MdCheckBox, MdCheckBoxOutlineBlank, MdClose, MdDateRange, MdExpandMore, MdImage, MdPostAdd, MdSell, MdStar, MdTimer } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import Configuration from "../../config";
import HomeContext from "../../pages/home/HomeContext";
import "../../pages/recipes/Recipe.css";
import UserContext from "../../UserContext";

function ViewParticularRecipe() {

    const recipeId = useParams();

    const navigator = useNavigate();

    const [, , authenticated, ] = useContext(HomeContext);
    const [user, setUser] = useContext(UserContext);

    const [panelStyle, setPanelStyle] = useState(null);
    const [chatBtnStyle, setChatBtnStyle] = useState(null);
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [userPanel, showUserPanel] = useState(false);
    const [steps, setSteps] = useState([]);
    const [ratings, setRatings] = useState([0,0,0,0,0]);
    const [userRating, setUserRating] = useState(null);
    const [comments, setComments] = useState([]);
    const [userComment, setUserComment] = useState(null);
    const [recipeRating, setRecipeRating] = useState(0);

    const panel = useRef();
    const commentRef = useRef();
    const chatBtnRef = useRef();

    async function rate(index) {
        let rates = ratings;
        rates.forEach((ele, ind) => {
            if(ind <= index)
                rates[ind] = 1;
            else
                rates[ind] = 0;
        });
        setRatings([...rates]);
    
        let res;
        let rating = new FormData();
        rating.append("userId", user.id);
        rating.append("recipeId", recipeId.id);
        rating.append("rating", index + 1);
        if(userRating == null) {
            res = await axios.post(`${Configuration.host}/api/Ratings`, rating);
            setUserRating(res.data);
        } else {
            res = await axios.put(`${Configuration.host}/api/Ratings/${recipeId.id}/${user.id}`, rating);
            setUserRating(res.data);
        }
        // console.log(res);

        const recipeStars = await axios.get(`${Configuration.host}/api/Ratings/${recipeId.id}`);
        // console.log(recipeStars);
        setRecipeRating(recipeStars.data.rating);
    }

    async function postComment() {
        let comment = new FormData();
        comment.append("userId", user.id);
        comment.append("recipeId", recipeId.id);
        comment.append("uploadDate", new Date().toGMTString());
        comment.append("description", userComment);

        const res = await axios.post(`${Configuration.host}/api/Comments`, comment);
        console.log(res);
        setComments([res.data, ...comments]);
        setUserComment(null);
        commentRef.current.value = "";
    }

    async function deleteComment(ind, ele) {
        const res = await axios.delete(`${Configuration.host}/api/Comments/${ele.id}`);
        console.log(res);
        setComments([...comments.filter(e => e.id != ele.id)]);
    }

    function toggleCheck(event) {
        let element = event.target;
        element.firstChild.checked = !element.firstChild.checked;
    }

    useEffect(() => {
        setChatBtnStyle({
            animation: `slideInRight 0.2s ease-out forwards`
        });
    }, [chatBtnRef.current]);

    useEffect(() => {
        setPanelStyle({
            animation: `slideInUp 0.3s ease-out forwards`,
            // marginTop: "25px",
            width: "30%", 
            zIndex: 1000,
            // overflowY: "auto"
        });

        if(user) {
            (async function() {
                const res = await axios.get(`${Configuration.host}/api/Recipes/${recipeId.id}`);
                // console.log(res.data);
                setRecipe(res.data);
    
                const ing = await axios.get(`${Configuration.host}/api/Ingredient/${recipeId.id}`);
                // console.log(ing.data);
                setIngredients(ing.data);
    
                const stp = await axios.get(`${Configuration.host}/api/Steps/ByRecipe/${recipeId.id}`);
                // console.log(stp.data);
                setSteps(stp.data.sort((a, b) => a.order - b.order));

                const rating = await axios.get(`${Configuration.host}/api/Ratings/${recipeId.id}/${user.id}`);
                // console.log(rating);
                if(rating.status == 204) {
                    setUserRating(null);
                } else {
                    setUserRating(res.data);
                    let rates = [0,0,0,0,0];
                    rates.forEach((ele, ind) => {
                        if(ind < rating.data.ratingLevel)
                        rates[ind] = 1;
                        else
                        rates[ind] = 0;
                    });
                    setRatings([...rates]);
                    // console.log(rates);
                }

                const recipeStars = await axios.get(`${Configuration.host}/api/Ratings/${recipeId.id}`);
                console.log(recipeStars);
                if(recipeStars.status == 200) {
                    setRecipeRating(recipeStars.data.rating);
                }

                const recipeComments = await axios.get(`${Configuration.host}/api/Comments/ByRecipe/${recipeId.id}`);
                // console.log(recipeComments);
                recipeComments.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                setComments(recipeComments.data);
            })();
        }

    }, [panel.current, user]);

    return(
        (authenticated && recipe && user) &&
            <div ref={panel} style={panelStyle} className="position-fixed w-100 border-end border-2 end-0 bottom-0 start-0 top-0 min-vh-100 bg-light">
                <div className="recipe-details d-flex mt-5 mb-3">
                    <div style={{maxHeight: "100vh", overflow: "auto"}} className="w-75 mb-5 pb-5">
                        <h1 className="font-cursive text-center mt-3">
                            {recipe.name}
                        </h1>
                        <button style={{zIndex: 1000}} onClick={() => navigator("/")} className="btn-close position-absolute top-0 start-0 m-3"></button>
                        <p className="w-50 mx-auto text-secondary text-center">{(recipe.description == "null") ? "" : recipe.description}</p>
                        <p className="w-50 mt-3 mx-auto text-secondary text-center">Created By 
                            <div onClick={() => showUserPanel(!userPanel)} style={{cursor: "pointer"}} className="position-relative user-pill badge py-1 px-3 rounded-pill text-secondary fs-6 fw-normal border mx-3">
                                {recipe.user.name}
                                {
                                    (userPanel) &&
                                    <div className="user-pill-more position-absolute top-100 bg-light d-flex br-5 border border-2 mt-3 p-3">
                                        <img src={`${Configuration.host}/${recipe.user.profilePicturePath}`} width={100} className="shadow" />
                                        <div className="p-3">
                                            <h5 className="text-dark text-start">{recipe.user.name}</h5>
                                            <p className="text-secondary">{recipe.user.email}</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        </p>
                        <img src={`${Configuration.host}/${recipe.recipeImagePath}`} className="mx-auto d-block mt-3" height={400} />
                        <div className="d-flex justify-content-center mt-5">
                            <div className="mx-4 d-flex justify-content-center">
                                <MdSell size={15} className="mt-1 text-secondary me-2" />
                                {recipe.category.name.charAt(0).toUpperCase() + recipe.category.name.substring(1, )}
                            </div>
                            <div className="mx-4 d-flex justify-content-center">
                                <MdTimer size={15} className="mt-1 text-secondary me-2" />
                                {recipe.preparationTime} mins
                            </div>
                            <div className="text-dark fs-6 d-flex justify-content-center badge rounded-pill fw-normal">
                                {recipeRating}
                                <MdStar color="goldenrod" size={15} className="mx-1" />
                            </div>
                            <div className="mx-4 d-flex justify-content-center">
                                <MdDateRange size={15} className="mt-1 text-secondary me-2" />
                                {new Date(recipe.uploadDate).toLocaleDateString()}
                            </div>
                        </div>
                        {
                            (ingredients) &&
                            <div className="my-5 w-75 mx-auto">
                                <h5 className="text-center">Ingredients</h5>
                                <div style={{flexWrap: "wrap", flexBasis: "12.5%"}} className="d-flex justify-content-center pt-3">
                                {
                                    ingredients.map(ele => {
                                        return (
                                            <div className="mx-2 my-2 fs-6 badge rounded-pill border border-2 text-secondary py-2 px-4 fw-normal">
                                                {ele.ingredient.name}
                                            </div>
                                        );
                                    })
                                }
                                </div>
                            </div>
                        }
                        {
                            (steps) &&
                            <div className="my-5">
                                <h5 className="text-center">Steps</h5>
                                <div className="text-center pt-3">
                                {
                                    steps.map(ele => {
                                        return (
                                            <>
                                            <div style={{cursor: "pointer"}} onClick={(event) => toggleCheck(event)} className="p-3 my-3 text-start w-75 mx-auto border br-5">
                                                <input type={"checkbox"} style={{width: 15, height: 15, accentColor: "var(--primary)"}} className="input-control me-3 my-1" />
                                                <div className="d-inline-block">
                                                    {ele.description}
                                                </div>
                                            </div>
                                            {
                                                (!ele.stepImagePath.includes("default")) &&
                                                <img src={`${Configuration.host}/${ele.stepImagePath}`} height={300} />
                                            }
                                            </>
                                        );
                                    })
                                }
                                </div>
                            </div>
                        }
                        {
                            (recipe.endNote != "null") &&
                            <div className="mt-5 w-50 mx-auto text-secondary pt-3">
                                <h5 className="text-center text-dark mt-5">A Note From The Author</h5>
                                <p className="text-center mt-3">
                                {recipe.endNote}
                                </p>
                            </div>
                        }
                    </div>
                </div>
                    <div className="position-absolute d-flex flex-column w-25 top-0 end-0 min-vh-100 border-start border-1">
                        <div style={{zIndex: 1000}} className="position-absolute bg-light top-0 end-0 w-100">
                            <h5 className="font-cursive my-0 text-center bg-light py-3">Rate This Recipe</h5>
                            <div className="border-bottom border-1 py-3 bg-light text-center">
                            {
                                ratings.map((ele, ind) => {
                                    return (
                                        <MdStar style={{cursor: "pointer"}} onClick={() => rate(ind)} size={30} color={(ele == 1) ? "goldenrod" : "lightgrey"} />
                                        );
                                    })
                                }                        
                            </div>
                        </div>
                        <div style={{top: "16vh", bottom: "10vh", marginTop: "auto", overflow: "auto"}} className="p-0 position-absolute w-100 d-flex flex-column-reverse">
                        {
                            (comments.length == 0) &&
                            <div style={{transform: "translate(-50%, -50%)"}} className="position-absolute top-50 start-50 text-center">
                                <MdChatBubble style={{opacity: "25%"}} size={100} color={"#bbb"} />
                                <p className="text-secondary">
                                    No comments found. Be the first one to comment.
                                </p>
                            </div>
                        }
                        {
                            (comments.length > 0) &&
                            comments.map((ele, ind) => {
                                return (
                                    <>
                                        <div className={((ele.user.id == user.id) ? "bg-selection" : "") + " px-3 pt-3 my-0 position-relative"}>
                                            <p title={ele.user.email} className="my-0">
                                                {/* <img src={`${Configuration.host}/${ele.user.profilePicturePath}`} width={25} className="border me-2 br-50-p" height={25} style={{objectFit: "contain"}} /> */}
                                                <strong>
                                                    {ele.user.name}
                                                </strong>
                                                <div className="d-inline-block ms-2">
                                                    {ele.description}
                                                </div>
                                            </p>
                                            <p style={{fontSize: 14}} className="my-0 pb-3 text-secondary">
                                                {new Date(ele.uploadDate).toLocaleString()}
                                            </p>
                                            {
                                                (ele.user.id == user.id) &&
                                                <MdClose onClick={() => deleteComment(ind, ele)} style={{cursor: "pointer"}} size={20} color="grey" className="position-absolute top-0 end-0 m-1" />
                                            }
                                        </div>
                                    </>
                                );
                            })
                        }
                        </div>
                        <div className="p-3 bg-light position-absolute end-0 bottom-0 w-100 d-flex justify-content-center">
                            <textarea placeholder="Got something to say? Comment here." style={{resize: "none"}} ref={commentRef} value={userComment} onChange={() => setUserComment(commentRef.current.value)} rows={1} className="input-control textarea border border-2 form-control px-3" required />
                            {
                                (userComment != null && userComment != "") &&
                                <button style={chatBtnStyle} ref={chatBtnRef} onClick={postComment} className="btn br-50-p ms-2 btn-light">
                                    <MdArrowUpward size={20} color="grey" />
                                </button>
                            }
                        </div>
                    </div>
            </div>
    );
}

export default memo(ViewParticularRecipe);