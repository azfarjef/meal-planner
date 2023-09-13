import {
  useCreateIngredientMutation,
  useGetMeasureUnitNameQuery,
  useGetNutrientNameQuery,
} from "@/state/api";
import {
  GetMeasureUnitNameResponse,
  GetNutrientNameResponse,
} from "@/state/types";
import {
  Autocomplete,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CreateIngredientRequest } from "@/state/types";
import CloseIcon from "@mui/icons-material/Close";

const AddIngredient = () => {
  const { data: nutrientName, isLoading: nutrientNameLoading } =
    useGetNutrientNameQuery();
  const { data: measureUnit, isLoading: measureUnitLoading } =
    useGetMeasureUnitNameQuery();
  const [createIngredient] = useCreateIngredientMutation();

  const [ingredient, setIngredient] = useState<CreateIngredientRequest>({
    description: "",
    barcode: "",
    nutrients: [],
    portions: [],
  });
  const [nutrient, setNutrient] = useState<GetNutrientNameResponse>();
  const [nutrientAmount, setNutrientAmount] = useState<number>(0);
  const [portion, setPortion] = useState<GetMeasureUnitNameResponse>();
  const [gramWeight, setGramWeight] = useState<number>(0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIngredient((prevIngredient) => ({
      ...prevIngredient,
      [event.target.name]: event.target.value,
    }));
    console.log(ingredient);
  };

  const handleNutrientSelect = (
    _event: React.SyntheticEvent<Element, Event>,
    value: GetNutrientNameResponse | null
  ) => {
    console.log(value);
    if (value) setNutrient(value);
  };

  const handleAddNutrient = () => {
    if (nutrient) {
      const index = ingredient.nutrients.findIndex(
        (nut) => nut.id === nutrient.id
      );
      if (index === -1) {
        setIngredient((prevIngredient) => ({
          ...prevIngredient,
          nutrients: [
            ...prevIngredient.nutrients,
            {
              id: nutrient.id,
              name: nutrient.name,
              amount: nutrientAmount,
              unit: nutrient.unit_name,
            },
          ],
        }));
      } else {
        setIngredient((prevIngredient) => {
          const updatedNutrients = [...prevIngredient.nutrients];
          updatedNutrients[index].amount = nutrientAmount;
          return {
            ...prevIngredient,
            nutrients: updatedNutrients,
          };
        });
      }
    }
    console.log(ingredient);
  };

  const handlePortionSelect = (
    _event: React.SyntheticEvent<Element, Event>,
    value: GetMeasureUnitNameResponse | null
  ) => {
    console.log(value);
    if (value) setPortion(value);
  };

  const handleAddPortion = () => {
    if (portion) {
      const index = ingredient.portions.findIndex(
        (por) => por.id === portion.id
      );
      if (index === -1) {
        setIngredient((prevIngredient) => ({
          ...prevIngredient,
          portions: [
            ...prevIngredient.portions,
            {
              id: portion.id,
              name: portion.name,
              gram_weight: gramWeight,
            },
          ],
        }));
      } else {
        setIngredient((prevIngredient) => {
          const updatedPortions = [...prevIngredient.portions];
          updatedPortions[index].gram_weight = gramWeight;
          return {
            ...prevIngredient,
            portions: updatedPortions,
          };
        });
      }
    }
    console.log(ingredient);
  };

  const handleDeleteNutrient = (id: number | null) => () => {
    setIngredient((prev) => ({
      ...prev,
      nutrients: prev.nutrients.filter((item) => item.id !== id),
    }));
  };

  const handleDeletePortion = (id: number | null) => () => {
    setIngredient((prev) => ({
      ...prev,
      portions: prev.portions.filter((item) => item.id !== id),
    }));
  };

  const handleAddIngredient = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      await createIngredient(ingredient).unwrap();
    } catch (error) {
      console.log(error);
    }
    console.log(ingredient);
  };

  if (nutrientNameLoading || measureUnitLoading || !nutrientName) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Add Ingredient</h1>
      <form onSubmit={handleAddIngredient}>
        <TextField
          name="description"
          label="Name"
          value={ingredient.description}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="barcode"
          label="Barcode (optional)"
          value={ingredient.barcode}
          onChange={handleChange}
          fullWidth
        />

        <div style={{ margin: "20px 0" }}>
          <Typography variant="h6" gutterBottom>
            Nutrients (per 100g)
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Add nutritional info of this ingredient
          </Typography>
          {ingredient.nutrients.map((nutrient) => (
            <div
              style={{ display: "flex", alignItems: "center" }}
              key={nutrient.id}
            >
              <Typography>
                {nutrient.name} {nutrient.amount} {nutrient.unit}
              </Typography>
              <IconButton onClick={handleDeleteNutrient(nutrient.id)}>
                <CloseIcon />
              </IconButton>
            </div>
          ))}
          <Autocomplete
            sx={{ margin: "20px 0" }}
            options={nutrientName || []}
            getOptionLabel={(option) => option.name}
            onChange={handleNutrientSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for nutrient"
                variant="outlined"
                fullWidth
              />
            )}
            renderOption={(props, option: GetNutrientNameResponse) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
          />
          <TextField
            name="nutrients"
            label="Amount"
            type="number"
            value={nutrientAmount}
            onChange={(event) => {
              setNutrientAmount(+event.target.value);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {nutrient?.unit_name}
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddNutrient}
          >
            Add Nutrient
          </Button>
        </div>

        <div style={{ margin: "20px 0" }}>
          <Typography variant="h6" gutterBottom>
            Measure unit
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Additional measure units other than gram
          </Typography>
          {ingredient.portions.map((portion) => (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography key={portion.id}>
                1 {portion.name} = {portion.gram_weight} g
              </Typography>
              <IconButton onClick={handleDeletePortion(portion.id)}>
                <CloseIcon />
              </IconButton>
            </div>
          ))}
          <Autocomplete
            sx={{ margin: "20px 0" }}
            options={measureUnit || []}
            getOptionLabel={(option) => option.name}
            onChange={handlePortionSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for measure unit"
                variant="outlined"
                fullWidth
              />
            )}
            renderOption={(props, option: GetMeasureUnitNameResponse) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
          />
          <TextField
            label="Gram weight"
            value={gramWeight}
            type="number"
            onChange={(event) => {
              setGramWeight(+event.target.value);
            }}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddPortion}
          >
            Add Portion
          </Button>
        </div>
        <Button type="submit" variant="contained" color="primary">
          Add Ingredient
        </Button>
      </form>
    </div>
  );
};

export default AddIngredient;
