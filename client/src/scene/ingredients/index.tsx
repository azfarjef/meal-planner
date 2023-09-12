import {
  useCreateRecipeMutation,
  useGetIngredientNameQuery,
  useGetIngredientQuery,
} from "@/state/api";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Card,
  Grid,
  CardContent,
} from "@mui/material";
import { useState } from "react";
import { GetIngredientNameResponse } from "@/state/types";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

const Ingredients = () => {
  // const [query, setQuery] = useState("");
  const [dataSource, setDataSource] = useState("foundation_food");
  const [ingredientId, setIngredientId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [portion, setPortion] = useState(100);
  const [recipe, setRecipe] = useState<
    {
      fdc_id: number | null;
      name: string;
      amount: number;
      amount_alt: number;
      unit_alt: string | null;
    }[]
  >([]);
  const [recipeName, setRecipeName] = useState("");
  const [recipeSource, setRecipeSource] = useState("");
  const [instructions, setInstructions] = useState<Array<string>>([""]);
  const [servings, setServings] = useState(1);
  const [image, setImage] = useState("");
  const [time, setTime] = useState(0);
  const [unit, setUnit] = useState(0);
  const [header, setHeader] = useState("");

  // console.log("query:", query);
  console.log("ingredientId:", ingredientId);
  console.log("portion:", portion);
  console.log("recipe:", recipe);
  console.log("unit:", unit);

  const { data: ingredientName } = useGetIngredientNameQuery(dataSource);
  const { data: ingredient, isFetching: isIngredientFetching } =
    useGetIngredientQuery(ingredientId || 0);
  const [createRecipe] = useCreateRecipeMutation();

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
    setPortion(100);
    setUnit(0);
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

      setRecipe((prevRecipe) => [...prevRecipe, newRecipeItem]);

      // const existingIndex = recipe.findIndex(
      //   (item) => item.fdc_id === ingredientId
      // );

      // if (existingIndex !== -1) {
      //   setRecipe((prevRecipe) => {
      //     const updatedRecipe = [...prevRecipe];
      //     updatedRecipe[existingIndex] = newRecipeItem;
      //     return updatedRecipe;
      //   });
      // } else {
      //   setRecipe((prevRecipe) => [...prevRecipe, newRecipeItem]);
      // }
    }

    setOpen(false);
    setPortion(100);
    setUnit(0);
  };

  const handleDelete = (ingredientId: number | null, name: string) => () => {
    if (ingredientId === 77777) {
      setRecipe((prevRecipe) =>
        prevRecipe.filter((item) => item.name !== name)
      );
    } else {
      setRecipe((prevRecipe) =>
        prevRecipe.filter((item) => item.fdc_id !== ingredientId)
      );
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(recipe);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRecipe(items);
  };

  const handleAddHeader = () => {
    const newRecipeItem = {
      fdc_id: 77777,
      name: header,
      amount: 0,
      amount_alt: 0,
      unit_alt: "",
    };

    setRecipe((prevRecipe) => [...prevRecipe, newRecipeItem]);
    setHeader("");
  };

  const handleInstructionChange = (index: number, value: string) => {
    setInstructions((prevInstructions) => {
      const newInstructions: Array<string> = [...prevInstructions];
      newInstructions[index] = value;
      return newInstructions;
    });
  };

  const handleAddStep = () => {
    setInstructions((prevInstructions) => [...prevInstructions, ""]);
  };

  const handleRemoveStep = (index: number) => {
    setInstructions((prevInstructions) => {
      const newInstructions = [...prevInstructions];
      newInstructions.splice(index, 1);
      return newInstructions;
    });
  };

  const handleCreateRecipe = async () => {
    const updatedRecipe = [];
    let header = "";
    for (let i = 0; i < recipe.length; i++) {
      if (recipe[i].fdc_id === 77777) {
        header = recipe[i].name;
      } else {
        updatedRecipe.push({
          fdc_id: recipe[i].fdc_id,
          name: recipe[i].name,
          amount: recipe[i].amount,
          amount_alt: recipe[i].amount_alt,
          unit_alt: recipe[i].unit_alt,
          header: header,
        });
      }
    }

    const newRecipe = {
      name: recipeName,
      source: recipeSource,
      preparation_time: time,
      servings: servings,
      instructions: instructions,
      image: image,
      author_id: 1,
      author: "admin",
      ingredients: updatedRecipe,
    };

    console.log(newRecipe);
    try {
      await createRecipe(newRecipe).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          width: "100%",
          "@media (min-width: 600px)": {
            width: "70%",
          },
        }}
      >
        <Typography sx={{ mb: 3 }} variant="h4">
          Build Recipe
        </Typography>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography gutterBottom variant="h6">
                  Recipe Name
                </Typography>
                <TextField
                  label="Give your recipe a name"
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom variant="h6">
                  Recipe Source
                </Typography>
                <TextField
                  label="Recipe Source (optional) (ie. https://www.allrecipes.com/cucumber-lime-tonic)"
                  type="text"
                  value={recipeSource}
                  onChange={(e) => setRecipeSource(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom variant="h6">
                  Ingredients
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={7}>
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

                  <Grid item xs={5}>
                    <Select
                      value={dataSource}
                      onChange={(e) => setDataSource(e.target.value as string)}
                      sx={{ height: "40px", width: "100%" }}
                    >
                      <MenuItem value={"foundation_food"}>
                        Foundation Food
                      </MenuItem>
                      <MenuItem value={"sr_legacy_food"}>
                        SR Legacy Food
                      </MenuItem>
                      <MenuItem value={"survey_fndds_food"}>
                        Survey FNDDS Food
                      </MenuItem>
                      <MenuItem value={"user_food"}>User Food</MenuItem>
                      {/* <MenuItem value={"branded_food"}>Branded Food</MenuItem> */}
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
                      <Button autoFocus onClick={addToRecipe}>
                        Add to Recipe
                      </Button>
                    </DialogActions>
                  </>
                )}
              </BootstrapDialog>

              {/* 
      {recipe.length > 0 && (
        <div>
          <Typography variant="h6">Ingredients</Typography>
          <ul>
            {recipe.map((item) => (
              <div
                key={item.fdc_id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Typography>
                  - {item.amount} g {item.name}
                </Typography>
                <IconButton
                  onClick={handleDelete(item.fdc_id)}
                  sx={{
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </div>
            ))}
          </ul>
        </div>
      )} */}

              <Grid item xs={12}>
                {recipe.length > 0 && (
                  <div>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="ingredientList">
                        {(provided) => (
                          <ul
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {recipe.map((item, index) => (
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
                                        item.name
                                      )}
                                      sx={{
                                        color: (theme) =>
                                          theme.palette.grey[500],
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

              <Grid item xs={8}>
                <TextField
                  label="Add header (ie. dough, filling, etc.)"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                />
              </Grid>

              <Grid item xs={4}>
                <Button
                  variant="text"
                  onClick={handleAddHeader}
                  startIcon={<AddCircleOutlineIcon />}
                  fullWidth
                >
                  Add Header
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom variant="h6">
                  Instructions
                </Typography>
                {instructions.map((instruction, index) => (
                  <Box key={index} display="flex" alignItems="center" mb={2}>
                    <TextField
                      label={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) =>
                        handleInstructionChange(index, e.target.value)
                      }
                      fullWidth
                    />
                    <IconButton
                      color="secondary"
                      onClick={() => handleRemoveStep(index)}
                      aria-label="Remove Step"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  variant="text"
                  color="primary"
                  onClick={handleAddStep}
                  startIcon={<AddCircleOutlineIcon />}
                >
                  Add Step
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom variant="h6">
                  Servings
                </Typography>
                <TextField
                  label="Servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(+e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom variant="h6">
                  Image
                </Typography>
                <TextField
                  label="Image address of your recipe (ie. https://www.image.com/fried-chicken.jpg)"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom variant="h6">
                  Preparation Time
                </Typography>
                <TextField
                  label="Time in minutes"
                  type="number"
                  value={time}
                  onChange={(e) => setTime(+e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateRecipe}
                >
                  Create Recipe
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default Ingredients;
