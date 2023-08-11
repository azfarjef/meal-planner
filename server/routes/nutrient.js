import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/name", async (req, res) => {
  try {
    const query = `
			SELECT id, name, unit_name FROM nutrient
		`;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
