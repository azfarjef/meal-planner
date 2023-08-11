import { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface Ingredient {
  header: string;
  item: string;
}

const RecipeBuilder = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [header, setHeader] = useState("");
  const [item, setItem] = useState("");

  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      header,
      item,
    };
    setIngredients([...ingredients, newIngredient]);
    setHeader("");
    setItem("");
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Recipe Builder
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2}>
            <form onSubmit={(e) => e.preventDefault()}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <Typography variant="h6">Add Ingredient</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Header"
                    variant="outlined"
                    fullWidth
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleIcon />}
                    onClick={handleAddIngredient}
                  >
                    Add Ingredient
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2}>
            <Typography variant="h6">Ingredients</Typography>
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index}>
                  <strong>{ingredient.header}:</strong> {ingredient.item}
                </li>
              ))}
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecipeBuilder;
