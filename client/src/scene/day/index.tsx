import { Divider, Typography } from "@mui/material";
import dayjs from "dayjs";

const date = dayjs("2023-07-27").format("dddd, DD/MM/YYYY ");
console.log(date);

const meals = [
  {
    name: "Curry",
    meal_type: "lunch",
    amount: 1,
    image:
      "https://static.onecms.io/wp-content/uploads/sites/43/2022/03/20/212721-Indian-Chicken-Curry-Murgh-Kari-mfs_005.jpg",
  },
  {
    name: "Oats",
    meal_type: "breakfast",
    amount: 1,
    image:
      "https://post.healthline.com/wp-content/uploads/2020/09/oats-oatmeal-732x549-thumbnail-732x549.jpg",
  },
  {
    name: "Cereal",
    meal_type: "breakfast",
    amount: 1,
    image:
      "https://www.verywellhealth.com/thmb/HEl_K0SAzH5F81RHXCvSvGhroq0=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/30D7A016-ABA5-48DD-BE39-3E7A223A03BF-96f2ba9e6c724dc9b2ba638b0c0f44a2.jpeg",
  },
];

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

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

const DayPlan = () => {
  return (
    <>
      <Divider />
      <Typography variant="h4">DayPlan</Typography>
      <Typography variant="h5">{date}</Typography>
      <div>
        {mealTypes.map((mealType) => (
          <div>
            <Typography variant="h6">
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Typography>
            {meals
              .filter((meal) => meal.meal_type === mealType)
              .map((meal) => (
                <div>
                  <div>{meal.name}</div>
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
    </>
  );
};

export default DayPlan;
