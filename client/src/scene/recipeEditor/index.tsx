import {
  useGetIngredientNameQuery,
  useGetIngredientQuery,
  useGetRecipeQuery,
} from "@/state/api";
import { GetRecipeResponse, GetIngredientNameResponse } from "@/state/types";
import {
  Autocomplete,
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BootstrapDialog, BootstrapDialogTitle } from "../ingredients";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import CloseIcon from "@mui/icons-material/Close";

const RecipeEditor = () => {
  const { recipeId } = useParams();
  const [meal, setMeal] = useState<GetRecipeResponse>({} as GetRecipeResponse);
  const [dataSource, setDataSource] = useState("foundation_food");
  const [ingredientId, setIngredientId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [portion, setPortion] = useState(100);
  const [unit, setUnit] = useState(0);
  const [recipeIngredients, setRecipeIngredients] = useState<
    {
      fdc_id: number | null;
      name: string;
      amount: number;
      amount_alt: number;
      unit_alt: string | null;
    }[]
  >([]);

  const {
    data: recipe,
    isLoading,
    error,
  } = useGetRecipeQuery(Number(recipeId));
  const { data: ingredientName } = useGetIngredientNameQuery(dataSource);
  const { data: ingredient, isFetching: isIngredientFetching } =
    useGetIngredientQuery(ingredientId || 0);

  useEffect(() => {
    if (recipe) {
      setMeal(recipe);
      setRecipeIngredients(recipe.ingredients);
    }
  }, [recipe]);

  if (isLoading || !recipe) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMeal((prevMeal) => ({
      ...prevMeal,
      [event.target.name]: event.target.value,
    }));
    console.log(meal);
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
    setPortion(100);
    setUnit(0);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(recipeIngredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRecipeIngredients(items);
  };

  const handleDelete =
    (ingredientId: number | null, name: string, amount: number) => () => {
      if (ingredientId === 77777) {
        setRecipeIngredients((prevRecipe) =>
          prevRecipe.filter((item) => item.name !== name)
        );
      } else {
        setRecipeIngredients((prevRecipe) =>
          prevRecipe.filter(
            (item) => item.fdc_id !== ingredientId || item.amount !== amount
          )
        );
      }
    };

  const addToRecipe = () => {
    if (ingredient) {
      const newRecipeItem = {
        fdc_id: ingredientId,
        name: ingredient.description,
        amount: weight,
        amount_alt: portion,
        unit_alt: ingredient.foodportions[unit].modifier,
      };

      setRecipeIngredients((prevRecipe) => [...prevRecipe, newRecipeItem]);
    }

    setOpen(false);
    setPortion(100);
    setUnit(0);
  };

  return (
    <>
      <Box>
        <Typography variant="h4">Recipe Editor</Typography>
        <form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography gutterBottom variant="h6">
                Recipe Name
              </Typography>
              <TextField
                name="name"
                label="Give your recipe a name"
                type="text"
                value={meal.name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom variant="h6">
                Recipe Source
              </Typography>
              <TextField
                name="source"
                label="Recipe Source (optional) (ie. https://www.allrecipes.com/cucumber-lime-tonic)"
                type="text"
                value={meal.source}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* RESUME HERE */}

            <Grid item xs={12}>
              <Typography gutterBottom variant="h6">
                Ingredients
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={7}>
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
                    renderOption={(
                      props,
                      option: GetIngredientNameResponse
                    ) => (
                      <li {...props} key={option.fdc_id}>
                        {option.description}
                      </li>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <Select
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value as string)}
                    sx={{ height: "40px", width: "100%" }}
                  >
                    <MenuItem value={"foundation_food"}>
                      Foundation Food
                    </MenuItem>
                    <MenuItem value={"sr_legacy_food"}>SR Legacy Food</MenuItem>
                    <MenuItem value={"survey_fndds_food"}>
                      Survey FNDDS Food
                    </MenuItem>
                    <MenuItem value={"user_food"}>User Food</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>

            <BootstrapDialog
              onClose={handleClose}
              aria-labelledby="customized-dialog-title"
              open={open}
            >
              {isIngredientFetching && (
                <div style={{ padding: "1rem" }}>Loading...</div>
              )}
              {!isIngredientFetching && ingredient && (
                <>
                  <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleClose}
                  >
                    {ingredient.description}
                  </BootstrapDialogTitle>
                  <DialogContent dividers>
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
                          {portion.amount && portion.amount !== 0
                            ? (portion.gramWeight / portion.amount).toFixed(2)
                            : portion.gramWeight.toFixed(2)}
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
                    <Button autoFocus onClick={addToRecipe}>
                      Add to Recipe
                    </Button>
                  </DialogActions>
                </>
              )}
            </BootstrapDialog>

            <Grid item xs={12}>
              {recipeIngredients.length > 0 && (
                <div>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="ingredientList">
                      {(provided) => (
                        <ul
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {recipeIngredients.map((item, index) => (
                            <Draggable
                              key={index}
                              draggableId={index.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <li
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <Typography>
                                    {item.fdc_id !== 77777 &&
                                      item.amount + " g"}{" "}
                                    {item.name}
                                  </Typography>
                                  <IconButton
                                    onClick={handleDelete(
                                      item.fdc_id,
                                      item.name,
                                      item.amount
                                    )}
                                    sx={{
                                      color: (theme) => theme.palette.grey[500],
                                    }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </li>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  );
};

export default RecipeEditor;
