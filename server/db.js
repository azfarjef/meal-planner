import pg from "pg";
import dotenv from "dotenv";

const Pool = pg.Pool;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: "meal-planner",
});

export default pool;
