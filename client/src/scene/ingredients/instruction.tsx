import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";

const Instruction = () => {
  const [instructions, setInstructions] = useState<string[]>([""]);

  console.log("instructions", instructions);

  const handleInstructionChange = (index: number, value: string) => {
    setInstructions((prevInstructions) => {
      const newInstructions = [...prevInstructions];
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

  const handleCreateRecipe = () => {
    console.log("instructions:", instructions);
  };

  return (
    <>
      <FormControl fullWidth>
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        {instructions.map((instruction, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <TextField
              label={`Step ${index + 1}`}
              value={instruction}
              onChange={(e) => handleInstructionChange(index, e.target.value)}
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
          variant="contained"
          color="primary"
          onClick={handleAddStep}
          startIcon={<AddCircleOutlineIcon />}
        >
          Add Step
        </Button>
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleCreateRecipe}>
        Create Recipe
      </Button>
    </>
  );
};

export default Instruction;
