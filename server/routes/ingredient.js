import express from "express";
import pool from "../db.js";

const router = express.Router();

// router.get("/search/:keyword", async (req, res) => {
//   const { keyword } = req.params;

//   try {
//     const query = `
// 			SELECT f.fdc_id, f.description
// 			FROM food f
// 			WHERE f.description ILIKE $1 AND (f.data_type = 'foundation_food' OR f.data_type = 'sr_legacy_food');
// 		`;

//     const result = await pool.query(query, [`%${keyword}%`]);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/search/:source", async (req, res) => {
  console.log("/search/ called");
  const { source } = req.params;
  try {
    const query = `
			SELECT f.fdc_id, f.description
			FROM food f
			WHERE f.data_type = $1
      ORDER BY f.description;
		`;

    const result = await pool.query(query, [source]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:fdc_id", async (req, res) => {
  const { fdc_id } = req.params;

  try {
    const query = `
      SELECT
        f.fdc_id,
        f.description,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', mu.id,
            'measureUnit', mu.name,
            'gramWeight', fp.gram_weight,
            'amount', fp.amount,
            'portion_description', fp.portion_description,
            'modifier', fp.modifier
          )), '[]')
          FROM food_portion fp
          JOIN measure_unit mu ON fp.measure_unit_id = mu.id
          WHERE fp.fdc_id = f.fdc_id
        ) AS foodPortions,
        (
          SELECT json_agg(json_build_object(
            'id', n.id,
            'name', n.name,
            'unitName', n.unit_name,
            'amount', fn.amount
          ))
          FROM nutrient n
          JOIN food_nutrient fn ON n.id = fn.nutrient_id
          WHERE fn.fdc_id = f.fdc_id
        ) AS foodNutrients
      FROM food f
      WHERE f.fdc_id = $1;
    `;

    const result = await pool.query(query, [fdc_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Food not found" });
    }

    const gramsPortion = {
      id: 12345,
      measureUnit: "grams",
      gramWeight: 1,
      amount: 1,
      modifier: null,
    };

    result.rows[0].foodportions.unshift(gramsPortion);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// req.body = {
//   description: string;
//   nutrients: Array<{
//     id: number;
//     name: string;
//     amount: number;
//     unit: string;
//   }>;
//   portions: Array<{
//     id: number;
//     name: string;
//     gram_weight: number;
//   }>;
// }

router.post("/add", async (req, res) => {
  console.log(req.body);
  const { description, barcode, nutrients, portions } = req.body;

  try {
    const idFoodQuery = `
      SELECT MAX(fdc_id) AS max_fdc_id FROM food;
    `;
    const idResult = await pool.query(idFoodQuery);
    const fdc_id = idResult.rows[0].max_fdc_id + 1;

    const foodQuery = `
      INSERT INTO food (fdc_id, description, barcode, data_type)
      VALUES ($1, $2, $3, 'user_food')
    `;
    await pool.query(foodQuery, [fdc_id, description, barcode]);

    const idNutrientQuery = `
      SELECT MAX(id) AS max_id FROM food_nutrient;
    `;
    const idNutrientResult = await pool.query(idNutrientQuery);
    let nutrient_id = idNutrientResult.rows[0].max_id + 1;
    const foodNutrientQuery = `
      INSERT INTO food_nutrient (id, fdc_id, nutrient_id, amount)
      VALUES ($1, $2, $3, $4);
    `;

    for (const nutrient of nutrients) {
      await pool.query(foodNutrientQuery, [
        nutrient_id,
        fdc_id,
        nutrient.id,
        nutrient.amount,
      ]);
      nutrient_id++;
    }

    const idPortionQuery = `
      SELECT MAX(id) AS max_id FROM food_portion;
    `;
    const idPortionResult = await pool.query(idPortionQuery);
    let portion_id = idPortionResult.rows[0].max_id + 1;
    const foodPortionQuery = `
      INSERT INTO food_portion (id, fdc_id, measure_unit_id, gram_weight, amount)
      VALUES ($1, $2, $3, $4, $5);
    `;

    for (const portion of portions) {
      await pool.query(foodPortionQuery, [
        portion_id,
        fdc_id,
        portion.id,
        portion.gram_weight,
        1,
      ]);
      portion_id++;
    }

    res.status(200).json({ message: "Food added successfully" });
    console.log("Food added successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
