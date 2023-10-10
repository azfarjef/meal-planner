import { createTheme } from "@mui/material/styles";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import Calendar from "./scene/calendar";
import Ingredients from "./scene/ingredients";
import Recipe from "./scene/recipe";
import DayPlan from "./scene/day";
import RecipeDetails from "./scene/recipeDetails";
import RecipeEditor from "./scene/recipeEditor";
import RecipeBuilder from "./scene/test";
import AddIngredient from "./scene/addIngredient";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
// import Navbar from "./scene/navbar";
import Grocery from "./scene/grocery";
import Navbar from "./components/navbar";

const theme = createTheme({
  palette: {
    background: {
      default: "#F9FAFC",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: "2.25rem",
      lineHeight: 1.375,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.375,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: 1.375,
    },
  },
});

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
          <CssBaseline />
          <Box padding="110px 0.9rem 1rem 0.9rem">
            <Navbar />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Recipe />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/addIngredient" element={<AddIngredient />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/day/:dateParam" element={<DayPlan />} />
              <Route path="/recipe/:recipeId" element={<RecipeDetails />} />
              <Route path="/recipe/:recipeId/edit" element={<RecipeEditor />} />
              <Route path="/recipeBuilder" element={<RecipeBuilder />} />
              <Route path="/grocery" element={<Grocery />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
