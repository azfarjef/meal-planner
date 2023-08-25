import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useCreatePlanMutation, useGetRecipeQuery } from "@/state/api";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import daysjs, { Dayjs } from "dayjs";

const RecipeDetails = () => {
  const { recipeId } = useParams();
  const { data: recipe, isLoading } = useGetRecipeQuery(Number(recipeId));
  const [createPlan] = useCreatePlanMutation();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Dayjs>(daysjs());
  const [mealType, setMealType] = useState("breakfast");
  const [amount, setAmount] = useState(1);

  console.log(recipe);
  console.log(date);

  if (isLoading || !recipe) {
    return <div>Loading...</div>; // Add a loading state or spinner while data is being fetched
  }

  const {
    name,
    image,
    preparation_time,
    ingredients,
    instructions,
    nutrients,
    servings,
    price,
  } = recipe;

  const slicedNutrients = nutrients.slice(0, 29);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreatePlan = async () => {
    try {
      await createPlan({
        user_id: 1,
        recipe_id: Number(recipeId),
        fdc_id: null,
        date: date.format("YYYY-MM-DD"),
        meal_type: mealType,
        amount: amount,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            style={{ marginBottom: 16 }}
          >
            Add to meal plan
          </Button>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add recipe to your meal plan</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>Select a date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  minDate={daysjs()}
                  sx={{ minWidth: "300px" }}
                  format="DD/MM/YYYY"
                  value={date}
                  onChange={(newDate) =>
                    newDate !== null ? setDate(newDate) : null
                  }
                />
              </LocalizationProvider>

              <Typography gutterBottom>Select type of meal</Typography>
              <Select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="snack">Snack</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
              </Select>

              <Typography gutterBottom>Select number of servings</Typography>
              <TextField
                type="number"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handleCreatePlan}>
                ADD
              </Button>
            </DialogActions>
          </Dialog>
          <Typography variant="h4" gutterBottom>
            {name}
          </Typography>

          <img
            src={image}
            alt={name}
            style={{
              marginBottom: 16,
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
            }}
          />

          <Typography variant="body1" gutterBottom>
            Cooking Time: {preparation_time} minutes
          </Typography>

          <Typography variant="body1" gutterBottom>
            Servings: {servings}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Cost per serving: RM {price}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Ingredients:
          </Typography>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount}g {ingredient.name}
              </li>
            ))}
          </ul>

          <Typography variant="h6" gutterBottom>
            Instructions:
          </Typography>
          <ol>
            {instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          <Typography variant="h6" gutterBottom>
            Nutrition per serving:
          </Typography>
          {slicedNutrients.map((item, index) => (
            <Typography variant="body2" gutterBottom key={index}>
              {item.name}: {(item.amount / servings).toFixed(2)}{" "}
              {item.unit_name} ,{" "}
              {((item.amount / servings / item.dv) * 100).toFixed(0)}%
            </Typography>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecipeDetails;
