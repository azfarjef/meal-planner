import express from "express";
import pool from "../db.js";
import { userdata, nutrientOrder } from "./recipe.js";
import e from "express";

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
    // const dateQuery = `
    //   SELECT meal_plan.id,
    //     meal_plan.recipe_id,
    //     meal_plan.fdc_id,
    //     COALESCE(recipe.name, food.description) AS name,
    //     meal_plan.meal_type,
    //     meal_plan.amount,
    //     recipe.image,
    //     recipe.servings
    //   FROM meal_plan
    //   LEFT JOIN recipe ON meal_plan.recipe_id = recipe.id
    //   LEFT JOIN food ON meal_plan.fdc_id = food.fdc_id
    //   WHERE meal_plan.date = $1
    // `;

    const dateQuery = `
      SELECT mp.id,
        mp.recipe_id,
        mp.fdc_id,
        COALESCE(r.name, f.description) AS name,
        mp.meal_type,
        mp.amount,
        COALESCE(r.image, f.image) AS image,
        r.servings,
        CASE
          WHEN mp.recipe_id IS NOT NULL THEN rp.price / r.servings * mp.amount
          ELSE p."230825" * mp.amount / 100
        END AS price
      FROM meal_plan mp
      LEFT JOIN (
        SELECT ri.recipe_id, 
          SUM(p."230825" * ri.amount / 100) AS price
        FROM recipe_ingredient ri
        JOIN price p ON ri.fdc_id = p.fdc_id
        GROUP BY ri.recipe_id
      ) rp ON mp.recipe_id = rp.recipe_id
      LEFT JOIN price p ON mp.fdc_id = p.fdc_id
      LEFT JOIN recipe r ON mp.recipe_id = r.id
      LEFT JOIN food f ON mp.fdc_id = f.fdc_id
      WHERE mp.date = $1;
    `;
    const mealsResult = await pool.query(dateQuery, [date]);
    const meals = mealsResult.rows;

    // Convert meal.price data type from string to float
    meals.forEach((meal) => {
      if (!meal.price) meal.price = 0;
      else meal.price = Number(parseFloat(meal.price).toFixed(2));
    });

    // Print price data type
    console.log(typeof meals[0].price);

    const total_price = Number(
      parseFloat(
        meals.reduce((acc, meal) => {
          console.log(acc);
          return acc + meal.price;
        }, 0)
      ).toFixed(2)
    );

    // const totalNutrients = {};

    // for (const meal of meals) {
    //   console.log(meal.fdc_id);

    //   let foodNutrients = [];
    //   let weight = 0;
    //   if (meal.recipe_id) {
    //     const recipeNutrientQuery = `
    //       SELECT nutrient_id AS id,
    //         name,
    //         unit_name,
    //         amount
    //       FROM recipe_nutrient WHERE recipe_id = $1;
    //     `;
    //     const recipeNutrientResult = await pool.query(recipeNutrientQuery, [
    //       meal.recipe_id,
    //     ]);
    //     foodNutrients = recipeNutrientResult.rows;
    //     weight = meal.amount / meal.servings;
    //   } else {
    //     const foodQuery = `
    //       SELECT json_agg(json_build_object(
    //         'id', n.id,
    //         'name', n.name,
    //         'unit_name', n.unit_name,
    //         'amount', fn.amount
    //       ))
    //       FROM nutrient n
    //       JOIN food_nutrient fn ON n.id = fn.nutrient_id
    //       WHERE fn.fdc_id = $1
    //     `;

    //     const foodResult = await pool.query(foodQuery, [meal.fdc_id]);
    //     foodNutrients = foodResult.rows[0].json_agg;
    //     weight = meal.amount / 100;
    //   }

    //   // Calculate total nutrients of each meal and add to meals.nutrients
    //   for (const nutrient of foodNutrients) {
    //     if (!totalNutrients[nutrient.id]) {
    //       totalNutrients[nutrient.id] = {
    //         id: nutrient.id,
    //         name: nutrient.name,
    //         unit_name: nutrient.unit_name,
    //         amount: 0,
    //       };
    //     }
    //     totalNutrients[nutrient.id].amount += nutrient.amount * weight;

    //     if (nutrient.id === 1008) {
    //       console.log(`Energy KCAL : ${nutrient.amount * weight}`);
    //     }
    //   }
    // }

    // console.log(`Total Energy KCAL : ${totalNutrients[1008].amount}`);

    // const totalNutrientsArray = Object.values(totalNutrients);

    const nutrientsQuery = `
      SELECT
        n.id,
        n.name,
        n.unit_name,
        SUM(amount) AS amount
      FROM (
        SELECT
          mp.id,
          mp.recipe_id,
          mp.fdc_id,
          mp.date,
          CASE
            WHEN mp.recipe_id IS NOT NULL THEN rn.nutrient_id
            ELSE fn.nutrient_id
          END AS nutrient_id,
          CASE
            WHEN mp.recipe_id IS NOT NULL THEN rn.amount / r.servings * mp.amount
            ELSE fn.amount * mp.amount / 100
          END AS amount
        FROM meal_plan mp
        LEFT JOIN recipe_nutrient rn ON mp.recipe_id = rn.recipe_id
        LEFT JOIN food_nutrient fn ON mp.fdc_id = fn.fdc_id
        LEFT JOIN recipe r ON mp.recipe_id = r.id
        WHERE date = $1
      ) AS subquery
      JOIN nutrient n ON subquery.nutrient_id = n.id
      GROUP BY n.id, n.name, n.unit_name;
      `;

    const nutrientsResult = await pool.query(nutrientsQuery, [date]);
    const totalNutrientsArray = nutrientsResult.rows;

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

    const mealsWithNutrients = {
      meals,
      nutrients: sortedNutrients,
      total_price,
    };

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
