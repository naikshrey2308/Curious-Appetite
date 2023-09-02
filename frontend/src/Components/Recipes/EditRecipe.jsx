import { createContext, memo, useContext, useEffect, useRef, useState } from "react";
import PatternMatchErrors from "../../Errors";
import Input from "../FormComponents/Input";
import "../../pages/recipes/Recipe.css";
import CreateRecipeContext from "./CreateRecipeContext";
import { MdAdd, MdCheck, MdCheckCircle, MdClose, MdLanguage, MdNote } from "react-icons/md";
import axios from "axios";
import Configuration from "../../config";
import UserContext from "../../UserContext";
import RecipeContext from "./RecipeContext";
import { useNavigate, useParams } from "react-router-dom";

let AccordionContext = createContext();

function ProgressBulb(props) {
    return (
        <div className="text-center my-1">
            <div className="bulb me-3" style={{backgroundColor: props.backcolor ?? "#357960", color: props.forecolor ?? "white"}}>
                {props.value}
            </div>
        </div>
    );
}

function EditRecipeBasic(props) {

    const [user, ] = useContext(UserContext);
    const [recipe, setRecipe] = useContext(RecipeContext);
    const [acc1Ref, acc2Ref, ] = useContext(AccordionContext);
    
    const [id, setId] = useState(null);
    const [name, setName] = useState(null);
    const [prepTime, setPrepTime] = useState(null);
    const [category, setCategory] = useState(null);
    const [description, setDescription] = useState(null);
    const [endnote, setEndnote] = useState(null);
    const [categoryId, setCategoryId] = useState(null);
    
    const [categories, setCategories] = useState([]);
    const [searchBox, toggleSearchBox] = useState(false);
    const [createBtn, showCreateBtn] = useState(true);
    
    const descriptionRef = useRef();
    const endnoteRef = useRef();
    const fileRef = useRef();
    const recipeImgRef = useRef();
    const categoryRef = useRef();
    const saveBtnRef = useRef();

    function updateRecipeImage() {
        let data = URL.createObjectURL(fileRef.current.files[0]);
        recipeImgRef.current.src = data;
    }

    async function changeCategory() {
        if(categoryRef.current.value != null && categoryRef.current.value != "")
            toggleSearchBox(true);
        else
            toggleSearchBox(false);

        setCategory(categoryRef.current.value);
        console.log(categoryRef.current.value);
        const res = await axios.get(`${Configuration.host}/api/CategoryByName/${categoryRef.current.value.toString().toLowerCase()}`);
        // console.log(res.data);
        if(res.status == 200) {
            setCategories(res.data ?? []);
        } else if(res.status == 404) {
            setCategories([]);
        }
        // console.log([categories]);
        let exact = res.data.find(e => e.name == categoryRef.current.value) == undefined;
        showCreateBtn(exact);
    }

    async function createCategory() {
        const res = await axios.post(`${Configuration.host}/api/Category`, {
            id: 0,
            name: category.toLowerCase()
        });
        console.log(res);
        setCategoryId(res.data.id);
        toggleSearchBox(false);
    }

    function chooseCategory(value) {
        setCategory(value.name);
        setCategoryId(value.id);
        toggleSearchBox(false);
    }

    async function Basics(event) {
        event.preventDefault();

        saveBtnRef.current.value = `Saving...`;

        const crecipe = new FormData();
        crecipe.append("id", id);
        crecipe.append("userId", user.id);
        crecipe.append("categoryId", categoryId);
        crecipe.append("name", name);
        crecipe.append("description", description);
        crecipe.append("preparationTime", prepTime);
        if(fileRef.current.files.length > 0)
            crecipe.append("file", fileRef.current.files[0], fileRef.current.files[0].name);
        crecipe.append("recipeImagePath", recipe.recipeImagePath);
        crecipe.append("uploadDate", new Date().toGMTString());
        crecipe.append("rating", 0);
        crecipe.append("endNote", endnote);
        crecipe.append("published", false);

        console.log(recipe);

        let res;
        res = await axios.put(`${Configuration.host}/api/Recipes/${id}`, crecipe);
        
        console.log(res);
        
        if(res.status == 201 || res.status == 200) {
            setId(res.data.id);
            setRecipe(res.data);
            recipeImgRef.current.src = `${Configuration.host}/${res.data.recipeImagePath}`;
            acc1Ref.current.click();
            acc2Ref.current.click();
        }

        saveBtnRef.current.value = `Save Changes`;
    }

    useEffect(() => {
        if(!recipe)
            return;
        setId(recipe.id);
        setName(recipe.name);
        setPrepTime(recipe.preparationTime);
        setCategory(recipe.category.name);
        categoryRef.current.value = recipe.category.name;
        setDescription((recipe.description == "null") ? null : recipe.description);
        setEndnote((recipe.endNote == "null") ? null : recipe.endNote);
        setCategoryId(recipe.category.id);
    }, [recipe]);
    
    return (
        (recipe) &&
        <>
            <p className="my-3 text-center text-secondary">
                <MdCheck size={20} className="me-2" />After filling up the basic details, you can close the recipe halfway at any step and your progress will be synced with the servers. You can continue later on if you wish to.
            </p>
            <form className="d-flex align-items-center justify-content-evenly my-5" encType="multipart/form-data">
                <div style={{width: "50%"}} className="text-center">
                    <div className="d-flex">
                    <Input value={name} setValue={setName} placeholder={"Recipe Title"} type={"text"} pattern={"^[a-zA-Z0-9 ]+$"} validate={true} required={true} patternMatchError={PatternMatchErrors.title} />
                    <div className="mx-1">&nbsp;</div>
                    <Input value={prepTime} setValue={setPrepTime} placeholder={"Preparation Time (minutes)"} type={"number"} pattern={""} validate={false} required={false} patternMatchError={PatternMatchErrors.title} min={0} />
                    </div>

                    <div className="position-relative">
                        <input ref={categoryRef} type={"text"} className="my-3 input-control form-control" placeholder="Category" value={category} onChange={changeCategory} />
                        {
                            (searchBox) &&
                            <>
                                <div className="search-under-box br-5 text-start position-absolute">
                                {(createBtn) && 
                                    <div onClick={createCategory} className="p-2">
                                        <MdAdd size={20} className="me-2 text-success" />
                                        Create 
                                        <span className="ms-2 badge bg-primary">
                                            {category}
                                        </span>
                                    </div>
                                }
                                {
                                    (categories != [] && categories != null) &&
                                    categories.map(ele => {
                                        return (
                                        <div onClick={() => chooseCategory(ele)} key={ele.id} className="p-2">
                                            {ele.name}
                                        </div>
                                        )
                                    })
                                }
                                </div>
                            </>
                        }
                    </div>

                    
                    <textarea ref={descriptionRef} value={description} onChange={() => setDescription(descriptionRef.current.value)} className="w-100 form-control my-3" rows={5} placeholder={"A short description for your recipe."} style={{resize: "none"}} />
                    <textarea ref={endnoteRef} value={endnote} onChange={() => setEndnote(endnoteRef.current.value)} className="w-100 form-control my-3 mb-5" rows={5} placeholder={"An end note for your recipe."} style={{resize: "none"}} />
                    <input accept="image/*" onChange={updateRecipeImage} ref={fileRef} type={"file"} className="input-control form-control d-none" />
                </div>
                <div style={{width: "30%"}}>
                    <img style={{objectFit: "cover", cursor: "pointer"}} ref={recipeImgRef} onClick={() => fileRef.current.click()} src={`${Configuration.host}/${recipe.recipeImagePath}`} className="w-100 br-5 border" />
                    <input ref={saveBtnRef} type={"submit"} onClick={(e) => Basics(e)} className="btn btn-primary float-end mt-3" value={"Save Changes"} />
                </div>
            </form>
        </>
    );
}

function EditRecipeIngredients(props) {

    const [recipe, setRecipe] = useContext(RecipeContext);
    const [, acc2Ref, ] = useContext(AccordionContext);

    const [ingredients, setIngredients] = useState([]);
    const [fingredients, setFingredients] = useState([]);
    const [ingredient, setIngredient] = useState(null);
    const [searchBox, showSearchBox] = useState(false);
    const [createBtn, showCreateBtn] = useState(true);

    const [uptoDate, setUptoDate] = useState(true);

    const ingredientRef = useRef();

    async function createIngredient() {
        const res = await axios.post(`${Configuration.host}/api/Ingredient`, {
            id: 0,
            name: ingredient.toLowerCase()
        });
        // console.log(res);
        setIngredients([...ingredients, res.data]);
        setUptoDate(false);
        showSearchBox(false);
        setIngredient(null);
        ingredientRef.current.value = "";

        await addIngredient(res.data);
    }

    async function changeIngredient() {
        if(ingredientRef.current.value != null && ingredientRef.current.value != "")
            showSearchBox(true);
        else
            showSearchBox(false);

        setIngredient(ingredientRef.current.value);
        const res = await axios.get(`${Configuration.host}/api/IngredientByName/${ingredientRef.current.value.toString().toLowerCase()}`);
        // console.log(res.data);
        if(res.status == 200) {
            setFingredients(res.data ?? []);
        } else if(res.status == 404) {
            setFingredients([]);
        }
        // console.log(fingredients);
        let exact = res.data.find(e => e.name == ingredientRef.current.value) == undefined;
        showCreateBtn(exact);
    }    

    async function addIngredient(ing) {
        // console.log(ingredients);
        if(ingredients.findIndex(ele => ele.name == ing.name) != -1)
            return;
        setIngredients([...ingredients, ing]);
        let recipeIngredient = new FormData();
        recipeIngredient.append("recipeId", recipe.id);
        recipeIngredient.append("ingredientId", ing.id);
        const res = await axios.post(`${Configuration.host}/api/RecipeIngredients`, recipeIngredient);
        // console.log(res);
        
        setUptoDate(false);
        showSearchBox(false);
        setIngredient(null);
        ingredientRef.current.value = "";
    }

    async function removeIngredient(ing) {
        setIngredients(ingredients.filter(ele => ele !== ing));
        const res = await axios.delete(`${Configuration.host}/api/RecipeIngredients/${recipe.id}/${ing.id}`);
        // console.log(res);
        setUptoDate(false);
    }

    function saveIngredients() {
        // let argsIngredients = [];
        // for(let i of ingredients) {
        //     argsIngredients.push({
        //         recipeId: recipe.id,
        //         ingredientId: i.id
        //     });             
        // }
        // // console.log(argsIngredients);
        // const res = await axios.post(`${Configuration.host}/api/RecipeIngredients`, ingredients);
        // console.log(res);
        // // setUptoDate(true);
        acc2Ref.current.click();
    }

    useEffect(() => {
        if(!recipe)
            return;
        (async function() {
            const ing = await axios.get(`${Configuration.host}/api/Ingredient/${recipe.id}`);
            // console.log(ing.data.map(ele => ele.ingredient));
            setIngredients([...ing.data.map(ele => ele.ingredient)]);
        })();
    }, [recipe]);

    return (
        (recipe) &&
        <>
            <div className="text-center">
                <p className="container text-secondary">
                    Now, to create the recipe you need some ingredients. Click on the "Add a ingredients" button below and start adding ingredients that your recipe requires!
                </p>
                {
                    ingredients.map(ele => {
                        return(
                            <div className="my-3 badge rounded-pill ps-3 py-2 mx-2 fs-6 fw-normal text-dark border bg-light">
                                {ele.name}
                                <MdClose onClick={() => removeIngredient(ele)} style={{cursor: "pointer"}} size={20} className="ms-3" />
                            </div>
                        );
                    })
                }
                <div>
                    <div className="position-relative">
                        <input ref={ingredientRef} type={"text"} className="mt-5 mb-3 mx-auto w-50 input-control form-control" placeholder="Type an ingredient" value={ingredient} onChange={changeIngredient} />
                        {
                            (searchBox) &&
                            <>
                                <div style={{zIndex: 1000}} className="mx-auto w-50 search-under-box br-5 text-start position-absolute">
                                {(createBtn) && 
                                    <div onClick={createIngredient} className="p-2">
                                        <MdAdd size={20} className="me-2 text-success" />
                                        Create 
                                        <span className="ms-2 badge bg-primary">
                                            {ingredient}
                                        </span>
                                    </div>
                                }
                                {
                                    (fingredients != [] && fingredients != null) &&
                                    fingredients.map(ele => {
                                        return (
                                        <div onClick={() => addIngredient(ele)} key={ele.id} className="p-2">
                                            {ele.name}
                                        </div>
                                        )
                                    })
                                }
                                </div>
                            </>
                        }
                    </div>
                    <button onClick={addIngredient} className="btn btn-light border">
                        <MdAdd size={20} className="me-2" />
                        Add this ingredient
                    </button>
                    {
                        (!uptoDate) &&
                        <button onClick={saveIngredients} className="btn btn-primary mx-2">
                            <MdCheck size={20} className="me-2" />
                            Save Changes
                        </button>
                    }
                </div>
            </div>
        </>
    );
}

function EditRecipeSteps(props) {

    const picRef = useRef();
    const fileRef = useRef();
    const descriptionRef = useRef();

    const [recipe, setRecipe] = useContext(RecipeContext);
    const [, , acc3Ref] = useContext(AccordionContext);

    const [steps, setSteps] = useState([]);
    const [deletedSteps, setDeletedSteps] = useState([]);

    const [description, setDescription] = useState(null);
    const [order, setOrder] = useState(1);

    function setPicture() {
        let path = URL.createObjectURL(fileRef.current.files[0]);
        picRef.current.src = path;
    }

    function addStep() {
        let step = {
            id: 0,
            recipeId: recipe.id,
            stepImage: (fileRef.current.files.length > 0) ? fileRef.current.files[0] : null,
            stepImagePath: picRef.current.src,
            description: description,
            order: order,
        };
        setSteps([...steps.slice(0, order - 1), step, ...steps.slice(order - 1)]);
        setOrder(steps.length + 2);
        setDescription(null);
        descriptionRef.current.value = null;
        picRef.current.src = "/images/profilepics/default-recipe.jpg";
        fileRef.current.value = null;
        // console.log(fileRef.current.files);
        // console.log(steps);
    }

    async function addSteps() {
        let counter = 0;
        for(let i in steps) {
            let res;
            let data = new FormData();
            data.append("id", steps[i].id);
            data.append("recipeId", steps[i].recipeId);
            data.append("description", steps[i].description);
            data.append("order", (++ counter));
            if(steps[i].stepImage != null) {
                data.append("file", steps[i].stepImage, steps[i].stepImage.name);
            }
            if(steps[i].id == 0) {
                res = await axios.post(`${Configuration.host}/api/Steps`, data);
                steps[i].id = res.data.id;
            } else {
                res = await axios.put(`${Configuration.host}/api/Steps/${steps[i].id}`, data);
            }
            console.log(res);
        }

        for(let i of deletedSteps) {
            const res = await axios.delete(`${Configuration.host}/api/Steps/${i}`);
            console.log(res);
        }
        setDeletedSteps([]);

        acc3Ref.current.click();
    }

    function removeStep(index, value) {
        if(steps[index].id != 0)
            setDeletedSteps([...deletedSteps, steps[index].id]);
        setSteps(steps.filter(s => s !== value));
        setOrder(steps.length);
    }

    function removeImage() {
        picRef.current.src = "/images/profilepics/default-recipe.jpg";
    }

    useEffect(() => {
        if(!recipe)
            return;
        (async function() {
            const stp = await axios.get(`${Configuration.host}/api/Steps/ByRecipe/${recipe.id}`);
            // console.log(stp.data);
            for(let i in stp.data) {
                stp.data[i].stepImagePath = `${Configuration.host}/${stp.data[i].stepImagePath}`;
            }
            setSteps([...stp.data.sort((a, b) => a.order - b.order)]);
            setOrder(stp.data.length + 1);
        })();
    }, [recipe]);

    return (
        (recipe) &&
        <>
            <div className="container text-center">
                {
                    (steps.length > 0) &&
                    <div className="text-end">
                        <button onClick={addSteps} className="btn btn-primary mb-3">
                            <MdCheck size={20} className="me-2" />
                            Save All Changes
                        </button>
                    </div>
                }
                {
                    steps.map((ele, ind) => {
                        return (
                            <div className={"d-flex container position-relative my-2 br-5 border justify-items-center"}>
                                <button onClick={() => removeStep(ind, ele)} className="btn-close position-absolute top-0 end-0 m-3"></button>
                                <img style={{objectFit: "contain"}} src={`${ele.stepImagePath}`} className="br-5 border m-2" width={100} />   
                                <div className="w-100 p-2 text-start m-2">
                                    <strong>
                                        Step #{ind + 1}    
                                    </strong>
                                    <br />
                                    {ele.description}
                                </div>
                            </div>
                        );
                    })
                }
                {/* <hr /> */}

                <div style={{backgroundColor: "#f0f0f0a6"}} className="border px-3 br-5">
                <div className="d-flex justify-content-center">
                    
                    <div className="position-relative">
                        <img onClick={() => fileRef.current.click()} ref={picRef} src="/images/profilepics/default-recipe.jpg" width={100} className="border m-2"  />
                        <button onClick={removeImage} className="br-50-p hover-btn position-absolute btn btn-transparent py-2 top-0 end-0">
                            <MdClose size={20} />
                        </button>
                    </div>
                    <div className="w-100 m-2">
                        <input accept="image/*" onChange={setPicture} type={"file"} ref={fileRef} className="d-none" /> 
                        <textarea ref={descriptionRef} onChange={() => setDescription(descriptionRef.current.value)} value={description} style={{resize: "none"}} className="textarea form-control" rows={4} placeholder="Step Description" required />
                    </div>
                </div>
                Step Number
                <div className="w-25 mx-auto">
                <Input value={order} setValue={setOrder} placeholder={"Step Number"} type={"number"} pattern={""} validate={false} required={true} patternMatchError={PatternMatchErrors.title} min={1} max={steps.length + 1} />
                </div>
                <button onClick={addStep} className="btn btn-primary my-3" disabled={description == null || description == "" }>
                    <MdAdd size={20} className="me-2" />
                    Add this step
                </button>
            </div>
            </div>
        </>
    );
}

function RecipeSave(props) {

    const [createRecipePanel, toggleCreateRecipePanel] = useContext(CreateRecipeContext);
    const [recipe, setRecipe] = useContext(RecipeContext);
    const navigate = useNavigate();

    async function save() {
        const res = await axios.put(`${Configuration.host}/api/Recipes/Save/${recipe.id}`);
        navigate("/");
        setRecipe(null);
    }

    async function publish() {
        const res = await axios.put(`${Configuration.host}/api/Recipes/Publish/${recipe.id}`);
        // console.log(res);
        navigate("/");
        setRecipe(null);
    }

    return (
        <>
            <div className="container">
                <p className="text-secondary text-center">
                    You're almost there! Now you can choose to save the recipe for continuing it later on, or go on to publish the recipe to make it available globally. Happy eating!
                </p>
                <div className="my-5 text-center">
                    <button onClick={save} className="btn btn-light border border-2 me-5">
                        <MdCheck size={20} className="me-2" />
                        Continue Later On
                    </button>
                    <button onClick={publish} className="btn btn-primary">
                        <MdLanguage size={20} className="me-2" />
                        Publish My Recipe
                    </button>
                </div>
            </div>
        </>
    );
}

function EditRecipe(props) {
    
    // const [createRecipePanel, toggleCreateRecipePanel] = useContext(CreateRecipeContext);
    
    const navigator = useNavigate();

    const params = useParams();

    const [panelStyle, setPanelStyle] = useState(null); 
    const [recipe, setRecipe] = useState(null);

    const panel = useRef();

    const acc1Ref = useRef();
    const acc2Ref = useRef();
    const acc3Ref = useRef();

    function closePanel() {
        // toggleCreateRecipePanel(false);
        // document.body.style.overflowY = "scroll";
        navigator("/");
    }

    useEffect(() => {
        setPanelStyle({
            animation: `slideInUp 0.3s ease-out forwards`,
            width: "30%", 
            zIndex: 1000,
            overflowY: "scroll",
        });  
        
        (async function() {
            const res = await axios.get(`${Configuration.host}/api/Recipes/${params.id}`);
            console.log(res);
            if(res.status == 200) {
                setRecipe(res.data);
            }
        })();
        // document.body.style.overflowY = "hidden";
        // if(createRecipePanel) {
        // }
    }, [panel.current]);
    
    return (
        // (createRecipePanel) &&
        <AccordionContext.Provider value={[acc1Ref, acc2Ref, acc3Ref]}>
        <RecipeContext.Provider value={[recipe, setRecipe]}>
            <div ref={panel} style={panelStyle} className="position-fixed w-100 end-0 top-0 start-0 bottom-0 min-vh-100 bg-light">
                <button onClick={closePanel} className="btn-close position-absolute end-0 top-0 p-4" />

                <div className="container">
                    <h1 className="font-cursive heading-underline text-center pt-5 mt-5">
                        Edit Your Recipe
                    </h1>

                    <img src="/images/misc/create-recipe.png" width={150} className="mb-5 mx-auto d-block" />

                    <div class="accordion" id="accordionPanelsStayOpenExample">
                    <div class="accordion-item my-3 border border-2">
                        <h2 class="accordion-header" id="panelsStayOpen-headingOne">
                        <button ref={acc1Ref} class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                            <ProgressBulb value={1} />
                            Basic Details
                        </button>
                        </h2>
                        <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
                        <div class="accordion-body">
                            <EditRecipeBasic />
                        </div>
                        </div>
                    </div>

                    {
                        // (recipe != null && recipe.id != 0) && 
                        <>
                        <div class="accordion-item my-3 border border-2">
                            <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
                            <button ref={acc2Ref} class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                                <ProgressBulb value={2} />
                                Add the ingredients
                            </button>
                            </h2>
                            <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingTwo">
                            <div class="accordion-body">
                                <EditRecipeIngredients />
                            </div>
                            </div>
                        </div>
                        <div class="accordion-item my-3 border border-2">
                            <h2 class="accordion-header" id="panelsStayOpen-headingThree">
                            <button ref={acc3Ref} class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                                <ProgressBulb value={3} />
                                Add the steps
                            </button>
                            </h2>
                            <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingThree">
                            <div class="accordion-body">
                                <EditRecipeSteps />
                            </div>
                            </div>
                        </div>
                        <div class="accordion-item my-3 border border-2">
                            <h2 class="accordion-header" id="panelsStayOpen-headingFour">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                                <ProgressBulb value={4} />
                                Almost Done!
                            </button>
                            </h2>
                            <div id="panelsStayOpen-collapseFour" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingFour">
                            <div class="accordion-body">
                                <RecipeSave />
                            </div>
                            </div>
                        </div>
                        </>
                    }
                    </div>                
                </div>
                </div>
        </RecipeContext.Provider>
        </AccordionContext.Provider>
    );
}

export default memo(EditRecipe);