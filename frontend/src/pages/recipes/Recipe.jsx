import { memo, useContext, useState } from "react";
import CreateRecipe from "../../Components/Recipes/CreateRecipe";
import CreateRecipeContext from "../../Components/Recipes/CreateRecipeContext";
import MyRecipes from "../../Components/Recipes/MyRecipes";
import MyRecipesContext from "../../Components/Recipes/MyRecipesContext";
import ViewRecipe from "../../Components/Recipes/ViewRecipe";
import HomeContext from "../home/HomeContext";

function Recipe(props) {
    
    const [, , authenticated, setAuthenticated] = useContext(HomeContext);

    const [createRecipePanel, toggleCreateRecipePanel] = useContext(CreateRecipeContext);

    const [myRecipesPanel, toggleMyRecipesPanel] = useContext(MyRecipesContext);

    return (
        (authenticated) && 
        <>
            {/* <CreateRecipeContext.Provider value={[createRecipePanel, toggleCreateRecipePanel]}> */}
                <ViewRecipe />
                <CreateRecipe />
                <MyRecipes />
            {/* </CreateRecipeContext.Provider> */}
        </>
    );
}

export default memo(Recipe);