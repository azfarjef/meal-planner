import express from "express";
import pool from "../db.js";

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
      SELECT meal_plan.id, recipe.name AS name, meal_plan.meal_type, meal_plan.amount, recipe.image AS image
      FROM meal_plan
      INNER JOIN recipe ON meal_plan.recipe_id = recipe.id
      WHERE meal_plan.date = $1
    `;
    const meals = await pool.query(dateQuery, [date]);

    res.status(200).json(meals.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

export default router;
