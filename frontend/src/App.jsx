import { createContext, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Home from "./pages/home/home";
import Navbar from './Components/Navbar';
import HomeContext from './pages/home/HomeContext';
import UserContext from './UserContext';
import RegisterContext from './Components/User/RegisterContext';
import ProfileContext from './Components/User/ProfileContext';
import axios from 'axios';
import Configuration from './config';
import { AES, enc } from "crypto-js";
import Recipe from './pages/recipes/Recipe';
import CreateRecipeContext from './Components/Recipes/CreateRecipeContext';
import MyRecipesContext from "./Components/Recipes/MyRecipesContext";
import CreateRecipe from './Components/Recipes/CreateRecipe';
import MyRecipes from './Components/Recipes/MyRecipes';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ViewRecipe from './Components/Recipes/ViewRecipe';
import ViewParticularRecipe from './Components/Recipes/ViewParticularRecipe';
import EditRecipe from './Components/Recipes/EditRecipe';
import SearchContext from './pages/home/SearchContext';

function App() {
    const [loginPanel, toggleLoginPanel] = useState(false);
    const [registerPanel, toggleRegisterPanel] = useState(false);
    const [createRecipePanel, toggleCreateRecipePanel] = useState(false);
    const [myRecipesPanel, toggleMyRecipesPanel] = useState(false);
    const [profilePanel, toggleProfilePanel] = useState(false);
    const [user, setUser] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [search, setSearch] = useState(null);

    useEffect(() => {
		const id = localStorage.getItem("id");
		if(id != null && !authenticated) {
			// On starting the application, check whether the user is already logged in or not
			(async () => {
				let userId = AES.decrypt(id.toString(), Configuration.key);
				userId = enc.Utf8.stringify(userId);
        // console.log(userId == "");
        if(userId == "" || userId == null)
          return;
				const res = await axios.get(`${Configuration.host}/api/User/${userId}`);
				console.log(res);
				if(res.status == 200) {
					setAuthenticated(true);
					setUser(res.data);
				}
			})();
		}
    }, [user]);

    return (
      // <HomeContext.Provider value={[loginPanel, toggleLoginPanel, authenticated, setAuthenticated]}>
      // <UserContext.Provider value={[user, setUser]}>
      // <RegisterContext.Provider value={[registerPanel, toggleRegisterPanel]}>
      // <ProfileContext.Provider value={[profilePanel, toggleProfilePanel]}>
      // <CreateRecipeContext.Provider value={[createRecipePanel, toggleCreateRecipePanel]}>
      // <MyRecipesContext.Provider value={[myRecipesPanel, toggleMyRecipesPanel]}>
      //   <Navbar />
      //   <Home />
      //   <Recipe />
      // </MyRecipesContext.Provider>
      // </CreateRecipeContext.Provider>
      // </ProfileContext.Provider>
      // </RegisterContext.Provider>
      // </UserContext.Provider>
      // </HomeContext.Provider>

      <HomeContext.Provider value={[loginPanel, toggleLoginPanel, authenticated, setAuthenticated]}>
      <UserContext.Provider value={[user, setUser]}>
      <RegisterContext.Provider value={[registerPanel, toggleRegisterPanel]}>
      <ProfileContext.Provider value={[profilePanel, toggleProfilePanel]}>
      <CreateRecipeContext.Provider value={[createRecipePanel, toggleCreateRecipePanel]}>
      <MyRecipesContext.Provider value={[myRecipesPanel, toggleMyRecipesPanel]}>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<SearchContext.Provider value={[search, setSearch]}><Home /><ViewRecipe /></SearchContext.Provider>} />
            <Route path="/recipe">
              <Route path="create" element={<CreateRecipe />} />
              <Route path="my" element={<MyRecipes />} />
              <Route path="view/:id" element={<ViewParticularRecipe />} />
              <Route path="edit/:id" element={<EditRecipe />} />
              {/* <Route path={newLocal} element={<CreateRecipe />} /> */}
            </Route>
          </Routes>
        </BrowserRouter>
      </MyRecipesContext.Provider>
      </CreateRecipeContext.Provider>
      </ProfileContext.Provider>
      </RegisterContext.Provider>
      </UserContext.Provider>
      </HomeContext.Provider>

    )
}

export default App;
