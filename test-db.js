// test-db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  console.log("PID test-db:", process.pid);
  console.log("Env DB_USER:", process.env.DB_USER);
  try {
    const c = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: typeof process.env.DB_PASS === "undefined" ? "" : process.env.DB_PASS,
      database: process.env.DB_NAME || "Emprenddly_2",
      port: Number(process.env.DB_PORT) || 3306
    });
    const [rows] = await c.query("SELECT USER() AS user_now, CURRENT_USER() AS currentUser");
    console.log("Resultado SELECT:", rows);

    await c.end();
  } catch (err) {
    console.error("test-db ERROR:", err.message);
  }
})();
