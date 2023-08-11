import { Grid, Paper, Typography } from "@mui/material";

const Calendar = () => {
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div>
      <h1>Calendar</h1>
      <Grid container>
        <Grid item xs={12}>
          <Paper>
            <Typography variant="h6" align="center">
              June 2023
            </Typography>
          </Paper>
        </Grid>

        <Grid
          item
          container
          xs={12}
          justifyContent="space-evenly"
          columns={{ xs: 7 }}
        >
          {daysOfWeek.map((day) => (
            <Grid
              item
              xs={1}
              key={day}
              style={{
                minHeight: "30px",
                borderRight: "#dadce0 1px solid",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" align="center">
                <b>{day}</b>
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Grid
          item
          container
          xs={12}
          justifyContent="space-evenly"
          columns={{ xs: 7 }}
        >
          {Array.from({ length: 30 }).map((_, index) => (
            <Grid
              item
              xs={1}
              key={index}
              style={{
                minHeight: "100px",
                borderRight: "#dadce0 1px solid",
                borderBottom: "#dadce0 1px solid",
              }}
            >
              <Typography variant="body1" align="center">
                {index + 1}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default Calendar;
