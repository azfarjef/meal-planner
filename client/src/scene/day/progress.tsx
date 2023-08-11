import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import InsertChartIcon from "@mui/icons-material/InsertChartOutlined";
// import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';

interface LinearProgressWithLabelProps {
  value: number;
  variant: "determinate" | "indeterminate" | "buffer" | "query";
}

function LinearProgressWithLabel(props: LinearProgressWithLabelProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export const BDayPlan = () => {
  const macros = [
    {
      title: "Carbohydrate",
      value: 76,
    },
    {
      title: "Protein",
      value: 50,
    },
    {
      title: "Fat",
      value: 87,
    },
  ];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: "space-between" }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              PROGRESS
            </Typography>
          </Grid>
          <Grid item>
            <Avatar
              sx={{
                backgroundColor: "warning.main",
                height: 56,
                width: 56,
              }}
            >
              <InsertChartIcon />
            </Avatar>
          </Grid>
        </Grid>
        {macros.map(({ title, value }) => (
          <Box key={title} sx={{ pt: 3 }}>
            <Box sx={{ pt: 3 }}>
              <Typography color="textPrimary" variant="h4">
                {title}
              </Typography>
            </Box>
            <Box sx={{ pt: 3 }}>
              <LinearProgressWithLabel value={value} variant="determinate" />
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};
