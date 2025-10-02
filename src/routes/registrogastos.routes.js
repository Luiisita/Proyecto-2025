import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// GET todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM registro_gastos');
    res.json(rows);
  } catch (error) {
    console.error(" Error en GET /api/registrogastos:", error);
    res.status(500).json({ error: error.message }); 
  }
});

// ✅ POST registrar gasto
router.post("/", async (req, res) => {
  try {
    const { valor, tipo_gasto } = req.body;

    if (!valor || !tipo_gasto) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Mapear categorías según el valor recibido del frontend
    let nombreCategoria;
    if (tipo_gasto === "produccion") nombreCategoria = "Producción";
    if (tipo_gasto === "logisticos") nombreCategoria = "Logística";

    if (!nombreCategoria) {
      return res.status(400).json({ error: "Categoría inválida" });
    }

    // Buscar el Id_Categoria en la tabla
    const [categoria] = await pool.query(
      "SELECT Id_Categoria FROM Categoria_Gastos WHERE Nombre = ?",
      [nombreCategoria]
    );

    if (categoria.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const Id_Categoria = categoria[0].Id_Categoria;

    // Insertar en la tabla Registro_Gastos
    const [result] = await pool.query(
      "INSERT INTO Registro_Gastos (Id_Categoria, Monto, Fecha) VALUES (?, ?, CURDATE())",
      [Id_Categoria, valor]
    );

    res.json({ message: "✅ Gasto registrado", gastoId: result.insertId });
  } catch (error) {
    console.error("❌ Error en POST /api/registrogastos:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;