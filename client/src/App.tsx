import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material";
import Calendar from "./scene/calendar";
import Ingredients from "./scene/ingredients";
import Recipe from "./scene/recipe";
import DayPlan from "./scene/day";
import RecipeDetails from "./scene/recipeDetails";
import RecipeBuilder from "./scene/test";
import AddIngredient from "./scene/addIngredient";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./scene/navbar";
import Grocery from "./scene/grocery";

const theme = createTheme();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Navbar />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Recipe />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/addIngredient" element={<AddIngredient />} />
            {/* <Route path="/recipe" element={<Recipe />} /> */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/day/:date" element={<DayPlan />} />
            <Route path="/recipe/:recipeId" element={<RecipeDetails />} />
            <Route path="/recipeBuilder" element={<RecipeBuilder />} />
            <Route path="/grocery" element={<Grocery />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
