import express from "express";
import pool from "../config/db.js";

console.log("🛠 Debug pool config (inventario):", pool.config);

const router = express.Router();

// Listar inventario
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ri.ID_INVENTARIO, ri.NOMBRE, ri.CANTIDAD, ri.VALOR_UNITARIO, p.Nombre AS Producto
      FROM Registro_Inventario ri
      JOIN Productos p ON ri.Id_Productos = p.Id_Productos
    `);
    res.json(rows);
  } catch (err) {
    console.error("/inventario ERROR:", err);
    res.status(500).json({ message: "Error en /inventario", error: err.message, stack: err.stack });
  }
});

// Agregar producto al inventario
router.post("/", async (req, res) => {
  const { NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO Registro_Inventario (NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos) VALUES (?, ?, ?, ?)",
      [NOMBRE, CANTIDAD, VALOR_UNITARIO, Id_Productos]
    );
   // Traer el producto recién insertado junto con nombre de producto
    const [rows] = await pool.query(`
      SELECT ri.ID_INVENTARIO, ri.NOMBRE, ri.CANTIDAD, ri.VALOR_UNITARIO, p.Nombre AS Producto
      FROM Registro_Inventario ri
      JOIN Productos p ON ri.Id_Productos = p.Id_Productos
      WHERE ri.ID_INVENTARIO = ?
    `, [result.insertId]);

    res.json(rows[0]); // devolver objeto completo
  } catch (err) {
    console.error("POST /inventario ERROR:", err);
    res.status(500).json({ message: "Error al agregar producto", error: err.message });
  }
});



// Actualizar producto
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { NOMBRE, CANTIDAD, VALOR_UNITARIO } = req.body;
  try {
    // Actualizar el registro
    await pool.query(
      "UPDATE Registro_Inventario SET NOMBRE=?, CANTIDAD=?, VALOR_UNITARIO=? WHERE ID_INVENTARIO=?",
      [NOMBRE, CANTIDAD, VALOR_UNITARIO, id]
    );

    // Traer el registro actualizado junto con el nombre del producto (join)
    const [rows] = await pool.query(`
      SELECT ri.ID_INVENTARIO, ri.NOMBRE, ri.CANTIDAD, ri.VALOR_UNITARIO, p.Nombre AS Producto
      FROM Registro_Inventario ri
      JOIN Productos p ON ri.Id_Productos = p.Id_Productos
      WHERE ri.ID_INVENTARIO = ?
    `, [id]);

    res.json(rows[0]); // devolver objeto completo actualizado
  } catch (err) {
    console.error("PUT /inventario ERROR:", err);
    res.status(500).json({ message: "Error al actualizar producto", error: err.message });
  }
});


// Eliminar producto
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Registro_Inventario WHERE ID_INVENTARIO=?", [id]);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error("DELETE /inventario ERROR:", err);
    res.status(500).json({ message: "Error al eliminar producto", error: err.message });
  }
});

export default router;