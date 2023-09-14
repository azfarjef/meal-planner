import {
  useCreatePlanMutation,
  useGetIngredientNameQuery,
  useGetIngredientQuery,
  useGetPlanQuery,
} from "@/state/api";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { GetIngredientNameResponse } from "@/state/types";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import daysjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

const DayPlan = () => {
  const navigate = useNavigate();
  const { dateParam } = useParams();
  const dateFormatted = dateParam ? dateParam : daysjs().format("YYYY-MM-DD");
  const date = daysjs(dateParam);

  const [dataSource, setDataSource] = useState("foundation_food");
  const [ingredientId, setIngredientId] = useState<number | null>(null);
  const [portion, setPortion] = useState(100);
  const [unit, setUnit] = useState(0);
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState("breakfast");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openIngredient, setOpenIngredient] = useState(false);
  const openMenu = Boolean(anchorEl);
  // const [amount, setAmount] = useState(1);

  console.log(date);

  const [createPlan] = useCreatePlanMutation();
  const { data: ingredientName } = useGetIngredientNameQuery(dataSource);
  const { data: ingredient, isFetching: isIngredientFetching } =
    useGetIngredientQuery(ingredientId || 0);

  const { data, isLoading, isFetching, error } = useGetPlanQuery(dateFormatted);
  console.log(data);
  const meals = data?.meals;
  const nutrients = data?.nutrients;

  const weight =
    ingredient && ingredient.foodportions[unit]
      ? parseFloat(
          (
            (ingredient.foodportions[unit].gramWeight /
              (ingredient.foodportions[unit].amount || 1)) *
            portion
          ).toFixed(2)
        )
      : 0;

  const handleSelectDate = (newDate: Dayjs | null) => {
    if (newDate) {
      navigate(`/day/${newDate.format("YYYY-MM-DD")}`);
    }
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClickMenuOption = (item: string) => {
    if (item === "ingredient") {
      setOpenIngredient(true);
    } else {
      navigate("/");
    }
    setAnchorEl(null);
  };

  const handleOptionClick = (
    _event: React.ChangeEvent<object>,
    option: GetIngredientNameResponse | null
  ) => {
    setIngredientId(option?.fdc_id || null);
    setOpen(option !== null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreatePlan = async () => {
    try {
      await createPlan({
        user_id: 1,
        recipe_id: null,
        fdc_id: ingredientId,
        date: dateFormatted,
        meal_type: mealType,
        amount: weight,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
    setOpen(false);
  };

  if (isLoading || isFetching) {
    return <CircularProgress />;
  } else if (error) {
    return <Typography variant="h5">Error</Typography>;
  }

  return (
    <>
      <Typography variant="h4">Meal Planner</Typography>

      <Card sx={{ my: 3 }}>
        <CardContent>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                sx={{ minWidth: "230px", mb: 2 }}
                format="dddd, DD/MM/YYYY"
                value={date}
                onChange={handleSelectDate}
              />
            </LocalizationProvider>
          </Box>
          <Button variant="contained" onClick={handleClickMenu}>
            Add to meal plan
          </Button>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
            <MenuItem onClick={() => handleClickMenuOption("recipe")}>
              Recipe
            </MenuItem>
            <MenuItem onClick={() => handleClickMenuOption("ingredient")}>
              Ingredient
            </MenuItem>
          </Menu>

          {openIngredient && (
            <Box sx={{ mt: 2 }}>
              {/* <Typography variant="h6">Ingredients</Typography> */}
              <Autocomplete
                options={ingredientName || []}
                getOptionLabel={(option) => option.description}
                onChange={handleOptionClick}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for ingredients"
                    variant="outlined"
                    size="small"
                    fullWidth
                    // value={query}
                    // onChange={(e) => setQuery(e.target.value)}
                  />
                )}
                renderOption={(props, option: GetIngredientNameResponse) => (
                  <li {...props} key={option.fdc_id}>
                    {option.description}
                  </li>
                )}
              />

              <Select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as string)}
                fullWidth
                sx={{ height: "40px" }}
              >
                <MenuItem value={"foundation_food"}>Foundation Food</MenuItem>
                <MenuItem value={"sr_legacy_food"}>SR Legacy Food</MenuItem>
                <MenuItem value={"survey_fndds_food"}>
                  Survey FNDDS Food
                </MenuItem>
                <MenuItem value={"user_food"}>User Food</MenuItem>
                {/* <MenuItem value={"branded_food"}>Branded Food</MenuItem> */}
              </Select>

              <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
              >
                {isIngredientFetching && (
                  <div style={{ padding: "1rem" }}>Loading...</div>
                )}
                {!isIngredientFetching && ingredient && (
                  <>
                    <DialogTitle>{ingredient.description}</DialogTitle>
                    <DialogContent dividers>
                      <Typography gutterBottom>Select type of meal</Typography>
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

                      <Typography gutterBottom>
                        Enter quantity of meal
                      </Typography>
                      <TextField
                        label="Portion"
                        type="number"
                        value={portion}
                        onChange={(e) => setPortion(+e.target.value)}
                      />

                      <Select
                        value={unit}
                        onChange={(e) => setUnit(+e.target.value)}
                      >
                        {ingredient.foodportions.map((portion, index) => (
                          <MenuItem key={index} value={index}>
                            {portion.id === 9999
                              ? dataSource === "survey_fndds_food"
                                ? portion.portion_description
                                : portion.modifier
                              : portion.measureUnit}{" "}
                            (
                            {(
                              portion.gramWeight /
                              (portion.amount | 1)
                            ).toFixed(2)}
                            g)
                          </MenuItem>
                        ))}
                      </Select>
                    </DialogContent>
                    <DialogContent dividers>
                      <div>
                        {ingredient.foodnutrients &&
                          ingredient.foodnutrients
                            .slice(0, 30)
                            .map((nutrient) => (
                              <Typography key={nutrient.id}>
                                {nutrient.name}{" "}
                                {((nutrient.amount / 100) * weight).toFixed(2)}{" "}
                                {nutrient.unitName.toLowerCase()}
                              </Typography>
                            ))}
                      </div>
                    </DialogContent>

                    <DialogActions>
                      <Button variant="contained" onClick={handleCreatePlan}>
                        Add to Plan
                      </Button>
                    </DialogActions>
                  </>
                )}
              </Dialog>
            </Box>
          )}
        </CardContent>
      </Card>

      {meals ? (
        <Box>
          <div>
            {mealTypes.map((mealType) => (
              <div key={mealType}>
                <Typography variant="h5" gutterBottom>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
                  {meals
                    .filter((meal) => meal.meal_type === mealType)
                    .map((meal) => (
                      <Grid item key={meal.id}>
                        <Card sx={{ width: "168px", height: "100%" }}>
                          <CardMedia
                            component="img"
                            alt={meal.name}
                            height="140"
                            image={meal.image}
                            onClick={() =>
                              meal.recipe_id
                                ? navigate(`/recipe/${meal.recipe_id}`)
                                : null
                            }
                          />
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                display: "-webkit-box",
                                overflow: "hidden",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2,
                                lineHeight: "1.5rem",
                              }}
                            >
                              {meal.name}
                            </Typography>
                            <Typography variant="body2">
                              Amount: {meal.amount} {meal.fdc_id ? "g" : ""}
                            </Typography>
                            <Typography variant="body2">
                              Cost: RM {meal.price.toFixed(2)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              </div>
            ))}
          </div>

          <Typography variant="h6" gutterBottom>
            Total Cost: RM {data?.total_price}
          </Typography>

          <div>
            <Typography variant="h6" gutterBottom>
              Total Nutrition:
            </Typography>
            {nutrients?.slice(0, 29).map((item, index) => (
              <Typography variant="body2" gutterBottom key={index}>
                {item.name}: {item.amount.toFixed(2)} {item.unit_name} ,{" "}
                {((item.amount / item.dv) * 100).toFixed(0)}%
              </Typography>
            ))}
          </div>
        </Box>
      ) : (
        <Typography variant="h6">No meals planned</Typography>
      )}
    </>
  );
};

export default DayPlan;
