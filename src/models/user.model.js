import pool from "../config/db.js"; //  conexión a MySQL

// Obtener todos los usuarios
export const getAllUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
};

// Obtener usuario por ID
export const getUserById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  const { name, email, password } = userData;
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password]
  );
  return { id: result.insertId, ...userData };
};