import { useGetRecipesQuery } from "@/state/api";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { ClockIcon } from "@mui/x-date-pickers";
import { useNavigate } from "react-router-dom";

const Recipe = () => {
  const navigate = useNavigate();
  const { data: recipes, isLoading } = useGetRecipesQuery();

  if (isLoading || !recipes) {
    return <div>Loading...</div>; // Add a loading state or spinner while data is being fetched
  }

  return (
    <div style={{ flexGrow: 1 }}>
      <Container style={{ marginTop: "2rem" }}>
        <Typography variant="h4">Recipes</Typography>
        <Box sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {recipes.map((recipe) => (
              <Grid item key={recipe.id} lg={4} md={6} xs={12}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        pb: 3,
                      }}
                    >
                      <Avatar
                        alt={recipe.name}
                        src={recipe.image}
                        variant="square"
                        sx={{ width: 300, height: 300 }}
                      />
                    </Box>
                    <Typography
                      align="center"
                      color="textPrimary"
                      gutterBottom
                      variant="h5"
                    >
                      {recipe.name}
                    </Typography>
                  </CardContent>
                  <Box sx={{ flexGrow: 1 }} />
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Grid
                      container
                      spacing={2}
                      sx={{ justifyContent: "space-between" }}
                    >
                      <Grid item sx={{ alignItems: "center", display: "flex" }}>
                        <ClockIcon color="action" />
                        <Typography
                          color="textSecondary"
                          display="inline"
                          sx={{ pl: 1 }}
                          variant="body2"
                        >
                          {recipe.preparation_time} minutes
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>
              // <Card
              //   key={recipe.id}
              //   style={{ maxWidth: 345, marginBottom: "2rem" }}
              //   onClick={() => navigate(`/recipe/${recipe.id}`)}
              // >
              //   <CardActionArea>
              //     <CardMedia
              //       image={recipe.image}
              //       title={recipe.name}
              //       style={{ height: 140 }}
              //     />
              //     <CardContent>
              //       <Typography gutterBottom variant="h5" component="h2">
              //         {recipe.name}
              //       </Typography>
              //       <Typography variant="body2" color="textSecondary" component="p">
              //         {recipe.preparation_time} minutes
              //       </Typography>
              //     </CardContent>
              //   </CardActionArea>
              // </Card>
            ))}
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default Recipe;
