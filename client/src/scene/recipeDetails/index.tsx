import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useCreatePlanMutation, useGetRecipeQuery } from "@/state/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import daysjs, { Dayjs } from "dayjs";

interface Ingredient {
  id: number;
  fdc_id: number;
  name: string;
  amount: number;
  amount_alt: number;
  unit_alt: string | null;
  header: string;
}

interface IngredientsByHeader {
  [header: string]: Ingredient[];
}

const RecipeDetails = () => {
  const { recipeId } = useParams();
  const { data: recipe, isLoading } = useGetRecipeQuery(Number(recipeId));
  const [createPlan] = useCreatePlanMutation();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Dayjs>(daysjs());
  const [mealType, setMealType] = useState("breakfast");
  const [amount, setAmount] = useState(1);
  const [servings, setServings] = useState(recipe?.servings || 1);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
    }
  }, [recipe]);

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
    servings: initialServings,
    price,
  } = recipe;

  const slicedNutrients = nutrients.slice(0, 29);

  const ingredientsByHeader: IngredientsByHeader = ingredients.reduce(
    (acc: IngredientsByHeader, ingredient: Ingredient) => {
      if (!acc[ingredient.header]) {
        acc[ingredient.header] = [];
      }
      acc[ingredient.header].push(ingredient);
      return acc;
    },
    {}
  );

  console.log(recipe);
  console.log(date);

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
      <Card sx={{ maxWidth: 800 }}>
        <img
          src={image}
          alt={name}
          style={{
            width: "100%",
            maxHeight: 400,
            objectFit: "cover",
          }}
        />
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
              <Typography mt={2} mb={1}>
                Select a date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  minDate={daysjs()}
                  sx={{ minWidth: "270px" }}
                  format="DD/MM/YYYY"
                  value={date}
                  onChange={(newDate) =>
                    newDate !== null ? setDate(newDate) : null
                  }
                />
              </LocalizationProvider>

              <Typography mt={2} mb={1}>
                Select type of meal
              </Typography>
              <Select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                fullWidth
              >
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="snack">Snack</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
              </Select>

              <Typography mt={2} mb={1}>
                Select number of servings
              </Typography>
              <TextField
                type="number"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handleCreatePlan}>
                ADD
              </Button>
            </DialogActions>
          </Dialog>
          <Typography variant="h4" my={2.5}>
            {name}
          </Typography>
          <Typography variant="body1" my={1}>
            Cooking Time: {preparation_time} minutes
          </Typography>

          <Typography variant="body1" my={1}>
            Cost per serving: RM {price}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              mb: 4,
            }}
          >
            <Typography variant="body1" gutterBottom>
              Servings:
            </Typography>
            <TextField
              type="number"
              value={servings}
              size="small"
              onChange={(e) => setServings(+e.target.value)}
              inputProps={{ min: 1, style: { height: "1rem" } }}
              sx={{ width: "5rem", mx: 2 }}
            />
          </Box>

          <Divider />
          {/* 
          <Typography variant="h6" gutterBottom>
            Ingredients:
          </Typography> */}

          {Object.entries(ingredientsByHeader).map(
            ([header, headerIngredients], index) => (
              <Box key={index} sx={{ my: 3 }}>
                <Typography variant="h6">{header}</Typography>
                <List>
                  {headerIngredients.map((ingredient, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        py: 0,
                        pl: 0,
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <ListItemText sx={{ flex: "0 0 90px" }}>
                        {(
                          (ingredient.amount / initialServings) *
                          servings
                        ).toFixed(1)}
                        g
                      </ListItemText>
                      <ListItemText sx={{ flex: "1" }}>
                        {ingredient.name}
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )
          )}

          <Box my={7}>
            <Typography variant="h6" my={3}>
              Instructions:
            </Typography>
            <ol>
              {instructions.map((step, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "0.7rem",
                  }}
                >
                  {step}
                </li>
              ))}
            </ol>
          </Box>

          <Typography variant="h6" gutterBottom>
            Nutrition per serving:
          </Typography>
          <Typography variant="body2" mb={4}>
            Percent Daily Values based on a {nutrients[0]?.dv.toFixed(0)}{" "}
            calorie diet.
          </Typography>
          <Box>
            {slicedNutrients.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "3fr 2fr 1fr",
                  gap: "1rem",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  backgroundColor: index % 2 === 0 ? "#F7FAFC" : "white",
                  py: 1,
                }}
              >
                <Typography fontWeight={500}>{item.name}</Typography>
                <Typography variant="subtitle2">
                  {(item.amount / initialServings).toFixed(2)} {item.unit_name}
                </Typography>
                <Typography variant="subtitle2" color="#717F94">
                  {((item.amount / initialServings / item.dv) * 100).toFixed(0)}
                  %
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecipeDetails;
