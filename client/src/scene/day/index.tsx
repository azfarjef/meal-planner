import {
  useCreatePlanMutation,
  useGetIngredientNameQuery,
  useGetIngredientQuery,
  useGetPlanQuery,
} from "@/state/api";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import daysjs, { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useState } from "react";
import { GetIngredientNameResponse } from "@/state/types";

// const meals = [
//   {
//     name: "Curry",
//     meal_type: "lunch",
//     amount: 1,
//     image:
//       "https://static.onecms.io/wp-content/uploads/sites/43/2022/03/20/212721-Indian-Chicken-Curry-Murgh-Kari-mfs_005.jpg",
//   },
//   {
//     name: "Oats",
//     meal_type: "breakfast",
//     amount: 1,
//     image:
//       "https://post.healthline.com/wp-content/uploads/2020/09/oats-oatmeal-732x549-thumbnail-732x549.jpg",
//   },
//   {
//     name: "Cereal",
//     meal_type: "breakfast",
//     amount: 1,
//     image:
//       "https://www.verywellhealth.com/thmb/HEl_K0SAzH5F81RHXCvSvGhroq0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/30D7A016-ABA5-48DD-BE39-3E7A223A03BF-96f2ba9e6c724dc9b2ba638b0c0f44a2.jpeg",
//   },
// ];

// const macros = [
//   {
//     title: "Carbohydrate",
//     value: 76,
//   },
//   {
//     title: "Protein",
//     value: 50,
//   },
//   {
//     title: "Fat",
//     value: 87,
//   },
// ];

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

const DayPlan = () => {
  const { dateParam } = useParams();
  console.log(dateParam);

  const [dataSource, setDataSource] = useState("foundation_food");
  const [ingredientId, setIngredientId] = useState<number | null>(null);
  const [portion, setPortion] = useState(100);
  const [unit, setUnit] = useState(0);
  const [open, setOpen] = useState(false);
  // const [date, setDate] = useState<Dayjs>(daysjs());
  const [mealType, setMealType] = useState("breakfast");
  // const [amount, setAmount] = useState(1);

  const [createPlan] = useCreatePlanMutation();
  const { data: ingredientName } = useGetIngredientNameQuery(dataSource);
  const { data: ingredient, isFetching: isIngredientFetching } =
    useGetIngredientQuery(ingredientId || 0);

  if (!dateParam) {
    return <Typography variant="h5">Date not provided</Typography>;
  }

  const dateFormatted = dayjs(dateParam).format("dddd, DD/MM/YYYY ");

  const { data, isLoading } = useGetPlanQuery(dateParam);
  console.log(data);
  const meals = data?.meals;
  const nutrients = data?.nutrients;

  // const weight =
  //   ingredient && ingredient.foodportions[unit]
  //     ? (ingredient.foodportions[unit].gramWeight /
  //         (ingredient.foodportions[unit].amount | 1)) *
  //       portion
  //     : 0;

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
        // date: date.format("YYYY-MM-DD"),
        date: dateParam,
        meal_type: mealType,
        amount: weight,
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
    setOpen(false);
  };

  return (
    <>
      <Divider />

      <Typography variant="h4">DayPlan</Typography>
      <Typography variant="h5">{dateFormatted}</Typography>

      <Divider />

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Add to meal plan
      </Button>

      <div>
        <Typography variant="h6">Ingredients</Typography>
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
      </div>

      <Select
        value={dataSource}
        onChange={(e) => setDataSource(e.target.value as string)}
      >
        <MenuItem value={"foundation_food"}>Foundation Food</MenuItem>
        <MenuItem value={"sr_legacy_food"}>SR Legacy Food</MenuItem>
        <MenuItem value={"survey_fndds_food"}>Survey FNDDS Food</MenuItem>
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
              >
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="snack">Snack</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
              </Select>

              <Typography gutterBottom>State amount</Typography>
              <TextField
                label="Portion"
                type="number"
                value={portion}
                onChange={(e) => setPortion(+e.target.value)}
              />

              <Select value={unit} onChange={(e) => setUnit(+e.target.value)}>
                {ingredient.foodportions.map((portion, index) => (
                  <MenuItem key={index} value={index}>
                    {portion.id === 9999
                      ? dataSource === "survey_fndds_food"
                        ? portion.portion_description
                        : portion.modifier
                      : portion.measureUnit}{" "}
                    ({(portion.gramWeight / (portion.amount | 1)).toFixed(2)}
                    g)
                  </MenuItem>
                ))}
              </Select>
            </DialogContent>
            <DialogContent dividers>
              <div>
                {ingredient.foodnutrients &&
                  ingredient.foodnutrients.slice(0, 30).map((nutrient) => (
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

      <Divider />

      <div>
        {meals &&
          mealTypes.map((mealType) => (
            <div key={mealType}>
              <Typography variant="h6">
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Typography>
              {meals
                .filter((meal) => meal.meal_type === mealType)
                .map((meal) => (
                  <div key={meal.id}>
                    <div>
                      {meal.name} ({meal.amount}) (RM {meal.price})
                    </div>
                    <img
                      src={meal.image}
                      alt={meal.name}
                      style={{
                        width: "100px",
                      }}
                    />
                  </div>
                ))}
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
    </>
  );
};

export default DayPlan;
