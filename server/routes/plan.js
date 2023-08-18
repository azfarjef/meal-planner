import express from "express";
import pool from "../db.js";
import { userdata, nutrientOrder } from "./recipe.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  const { user_id, recipe_id, fdc_id, date, meal_type, amount } = req.body;

  console.log(req.body);

  try {
    const planQuery = `
			INSERT INTO meal_plan (user_id, recipe_id, fdc_id, date, meal_type, amount)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id;
		`;

    const planValues = [user_id, recipe_id, fdc_id, date, meal_type, amount];
    const planResult = await pool.query(planQuery, planValues);
    const planId = planResult.rows[0].id;

    res.status(201).json(planResult.rows);

    console.log(`Meal plan created with ID: ${planId}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.get("/:date", async (req, res) => {
  const date = req.params.date;

  console.log(date);

  try {
    const dateQuery = `
      SELECT meal_plan.id,
        meal_plan.recipe_id,
        meal_plan.fdc_id,
        COALESCE(recipe.name, food.description) AS name,
        meal_plan.meal_type,
        meal_plan.amount,
        recipe.image,
        recipe.servings
      FROM meal_plan
      LEFT JOIN recipe ON meal_plan.recipe_id = recipe.id
      LEFT JOIN food ON meal_plan.fdc_id = food.fdc_id
      WHERE meal_plan.date = $1
    `;
    const mealsResult = await pool.query(dateQuery, [date]);
    const meals = mealsResult.rows;

    const totalNutrients = {};

    for (const meal of meals) {
      console.log(meal.fdc_id);

      let foodNutrients = [];
      let weight = 0;
      if (meal.recipe_id) {
        const recipeNutrientQuery = `
          SELECT nutrient_id AS id,
            name,
            unit_name,
            amount
          FROM recipe_nutrient WHERE recipe_id = $1;
        `;
        const recipeNutrientResult = await pool.query(recipeNutrientQuery, [
          meal.recipe_id,
        ]);
        foodNutrients = recipeNutrientResult.rows;
        weight = meal.amount / meal.servings;
      } else {
        const foodQuery = `
          SELECT json_agg(json_build_object(
            'id', n.id,
            'name', n.name,
            'unit_name', n.unit_name,
            'amount', fn.amount
          ))
          FROM nutrient n
          JOIN food_nutrient fn ON n.id = fn.nutrient_id
          WHERE fn.fdc_id = $1
        `;

        const foodResult = await pool.query(foodQuery, [meal.fdc_id]);
        foodNutrients = foodResult.rows[0].json_agg;
        weight = meal.amount / 100;
      }

      // Calculate total nutrients of each meal and add to meals.nutrients
      for (const nutrient of foodNutrients) {
        if (!totalNutrients[nutrient.id]) {
          totalNutrients[nutrient.id] = {
            id: nutrient.id,
            name: nutrient.name,
            unit_name: nutrient.unit_name,
            amount: 0,
          };
        }
        totalNutrients[nutrient.id].amount += nutrient.amount * weight;

        if (nutrient.id === 1008) {
          console.log(`Energy KCAL : ${nutrient.amount * weight}`);
        }
      }
    }

    console.log(`Total Energy KCAL : ${totalNutrients[1008].amount}`);

    const totalNutrientsArray = Object.values(totalNutrients);

    // Combine carbohydrate and vitamin-K and add DV
    const combinedNutrients = {};

    totalNutrientsArray.forEach((nutrient) => {
      const { id, name, amount } = nutrient;

      if (name.includes("Carbohydrate")) {
        if (!combinedNutrients[2039]) {
          combinedNutrients[2039] = {
            ...nutrient,
            id: 2039,
            amount: 0,
            dv: userdata.nutritions[2039],
          };
        }
        combinedNutrients[2039].amount += Number(amount);
      } else if (name.includes("Vitamin K")) {
        if (!combinedNutrients[1183]) {
          combinedNutrients[1183] = {
            ...nutrient,
            id: 1183,
            amount: 0,
            dv: userdata.nutritions[1183],
          };
        }
        combinedNutrients[1183].amount += Number(amount);
      } else {
        combinedNutrients[id] = {
          ...nutrient,
          amount: Number(amount),
          dv: userdata.nutritions[id] || 0,
        };
      }
    });

    const nutrients = Object.values(combinedNutrients);

    // Sort by nutrient order
    const sortedNutrients = nutrients.sort((a, b) => {
      const aIndex = nutrientOrder.indexOf(a.id);
      const bIndex = nutrientOrder.indexOf(b.id);

      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });

    const mealsWithNutrients = { meals, nutrients: sortedNutrients };

    res.status(200).json(mealsWithNutrients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// router.get("/:date", async (req, res) => {
//   const date = req.params.date;

//   console.log(date);

//   try {
//     const dateQuery = `
//       SELECT meal_plan.id,
//         COALESCE(recipe.name, food.description) AS name,
//         meal_plan.meal_type,
//         meal_plan.amount,
//         recipe.image
//       FROM meal_plan
//       LEFT JOIN recipe ON meal_plan.recipe_id = recipe.id
//       LEFT JOIN food ON meal_plan.fdc_id = food.fdc_id
//       WHERE meal_plan.date = $1
//     `;
//     const meals = await pool.query(dateQuery, [date]);

//     res.status(200).json(meals.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error });
//   }
// });

export default router;
