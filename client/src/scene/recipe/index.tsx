import { useGetRecipesQuery } from "@/state/api";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Recipe = () => {
  const navigate = useNavigate();
  const { data: recipes, isLoading } = useGetRecipesQuery();

  if (isLoading || !recipes) {
    return <div>Loading...</div>; // Add a loading state or spinner while data is being fetched
  }

  return (
    <div style={{ flexGrow: 1 }}>
      <Typography variant="h4">Recipes</Typography>
      <Container style={{ marginTop: "2rem" }}>
        {recipes.map((recipe) => (
          <Card
            key={recipe.id}
            style={{ maxWidth: 345, marginBottom: "2rem" }}
            onClick={() => navigate(`/recipe/${recipe.id}`)}
          >
            <CardActionArea>
              <CardMedia
                image={recipe.image}
                title={recipe.name}
                style={{ height: 140 }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {recipe.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {recipe.preparation_time} minutes
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Container>
    </div>
  );
};

export default Recipe;
