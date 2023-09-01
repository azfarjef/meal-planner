import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import ingredientRoutes from "./routes/ingredient.js";
import recipeRoutes from "./routes/recipe.js";
import nutrientRoutes from "./routes/nutrient.js";
import measureUnitRoutes from "./routes/measureunit.js";
import planRoutes from "./routes/plan.js";
import groceryRoutes from "./routes/grocery.js";

// CONFIGURATIONS
dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// ROUTES
app.use("/ingredient", ingredientRoutes);
app.use("/recipe", recipeRoutes);
app.use("/nutrient", nutrientRoutes);
app.use("/measureunit", measureUnitRoutes);
app.use("/plan", planRoutes);
app.use("/grocery", groceryRoutes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
