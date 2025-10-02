import pool from "../config/db.js"; //  conexión a MySQL

// Obtener todos los usuarios
export const getAllUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
};

// Obtener usuario por ID
export const getUserById = async (id) => {
  const [rows] = await pool.query("SELECT Id_Usuarios, Nombre, Email FROM users WHERE Id_Usuarios = ?", [id]);
  return rows[0];
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  const { nombre, email, contrasena } = userData;

  const [result] = await pool.query(
    "INSERT INTO users (nombre, email, contrasena) VALUES (?, ?, ?)",
    [nombre, email, contrasena]
  );

  return { id: result.insertId, nombre, email};
};

export const updateUser = async (id, { nombre, email }) => {
  await pool.query(
    "UPDATE users SET nombre = ?, email = ? WHERE Id_Usuarios = ?",
    [nombre, email, id]
  );
  return { id: Number(id), nombre, email };
};

export const deleteUser = async (id) => {
  await pool.query("DELETE FROM users WHERE Id_Usuarios = ?", [id]);
  return;
};





