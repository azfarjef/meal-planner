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

export default router;
