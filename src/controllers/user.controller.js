// src/controllers/user.controller.js

import {
  getAllUsers, getUserById,
  createUser,updateUser, deleteUser as deleteUserModel,
} from "../models/user.model.js";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";



//TOKEN 


dotenv.config();

export const loginUser = async (req, res) => {
  try {
    // 1️⃣ Verificar que llegan datos
    console.log("📩 req.body recibido:", req.body);
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ message: "Faltan campos: email y/o contraseña" });
    }

    // 2️⃣ Buscar usuario en la BD
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    console.log("🔍 Resultado de la consulta:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // 3️⃣ Comparar contraseñas
   const isValid = await bcrypt.compare(contrasena, user.Contrasena);

    console.log("🔑 Contraseña válida?", isValid);

    if (!isValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 4️⃣ Generar token
    const userId = user.Id_Usuarios;
    if (!userId) {
      console.error("⚠️ No se encontró campo ID en el usuario:", user);
      return res.status(500).json({ message: "Error interno: no se encontró el ID del usuario" });
    }

    const token = jwt.sign(
      { id: user.Id_Usuarios, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    console.log("✅ Token generado:", token);

    // 5️⃣ Respuesta final
    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: user.Id_Usuarios,
        nombre: user.Nombre,
        email: user.Email
      }
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
};



export const registerUser = async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  try {
    // 1) comprobar si ya existe
    const [exists] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ message: "Usuario ya existe" });

    // 2) generar hash
    const salt = await bcrypt.genSalt(10);        // coste 10 (suficiente)
    const hash = await bcrypt.hash(contrasena, salt);

    // 3) guardar en la BD el hash, no la contraseña en texto plano
    const [result] = await pool.query(
      "INSERT INTO users (nombre, email, Contrasena) VALUES (?, ?, ?)",
      [nombre, email, hash]
    );

    // 4) opcional: generar token al registrarse
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

    res.status(201).json({
      message: "Usuario creado",
      usuario: { id: userId, nombre, email },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};






// PARA HACER PRUEBAS DEL CRUD 


// dotenv.config();
// GET /users / SALEN TODOS LOS USUARIOS
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error getUsers:", error);
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

// GET /users/:id / BUSCAR POR ID
export const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    console.error("Error getUser:", error);
    res.status(500).json({ message: "Error al obtener usuario", error: error.message });
  }
};

// POST /users / CREAR
export const addUser = async (req, res) => {
  try {
    console.log("📩 Body recibido:", req.body);
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: "Faltan campos: nombre, email y contrasena" });
    }

    const newUser = await createUser({ nombre, email, contrasena });
    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Error en addUser:", err);
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    res.status(500).json({ error: "Error al crear usuario", detalle: err.message });
  }
};

// PUT /users/:id / ACTUALIZAR 
export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: "Faltan campos: nombre y email" });
    }

    const existing = await getUserById(id);
    if (!existing) return res.status(404).json({ error: "Usuario no encontrado" });

    const updated = await updateUser(id, { nombre, email, contrasena });
    res.json({ message: "Usuario actualizado", updated });
  } catch (err) {
    console.error("Error editUser:", err);
    res.status(500).json({ error: "Error al actualizar usuario", detalle: err.message });
  }
};

// DELETE /users/:id /ELIMINAR
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await deleteUserModel(id);
    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error deleteUser:", err);
    res.status(500).json({ error: "Error al eliminar usuario", detalle: err.message });
  }
};
