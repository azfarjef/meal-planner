import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;

  console.log(dateFrom);
  console.log(dateTo);

  try {
    const groceryQuery = `
			SELECT
				CASE
					WHEN mp.recipe_id IS NOT NULL THEN ri.fdc_id
					ELSE mp.fdc_id
				END AS fdc_id,
				f.description AS name,
				SUM(
					CASE
						WHEN mp.recipe_id IS NOT NULL THEN ri.amount / r.servings * mp.amount
						ELSE mp.amount
					END
				) AS amount,
				p."230825" / 100 * SUM(
					CASE
						WHEN mp.recipe_id IS NOT NULL THEN ri.amount / r.servings * mp.amount
						ELSE mp.amount
					END
				) AS price,
				f.image,
				false AS bought
			FROM meal_plan mp
			LEFT JOIN recipe_ingredient ri ON mp.recipe_id = ri.recipe_id
			LEFT JOIN recipe r ON mp.recipe_id = r.id
			LEFT JOIN food f ON CASE
					WHEN mp.recipe_id IS NOT NULL THEN ri.fdc_id
					ELSE mp.fdc_id
				END = f.fdc_id
			LEFT JOIN price p ON CASE
					WHEN mp.recipe_id IS NOT NULL THEN ri.fdc_id
					ELSE mp.fdc_id
				END = p.fdc_id
			WHERE mp.date BETWEEN $1 AND $2
			GROUP BY
				CASE
					WHEN mp.recipe_id IS NOT NULL THEN ri.fdc_id
					ELSE mp.fdc_id
				END, f.description, f.image, p."230825";
		`;

    const groceryResult = await pool.query(groceryQuery, [dateFrom, dateTo]);
    const grocery = groceryResult.rows;

    // convert price data type from string to float
    grocery.forEach((item) => {
      item.amount = Number(parseFloat(item.amount).toFixed(2));
      item.price
        ? (item.price = Number(parseFloat(item.price).toFixed(2)))
        : (item.price = 0);
    });

    const total_price = grocery.reduce((total, item) => {
      return total + item.price;
    }, 0);

    res.status(200).json({ groceries: grocery, total_price });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

export default router;
