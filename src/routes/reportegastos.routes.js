import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// 📊 Endpoint: gastos agrupados por categoría con filtro opcional de fecha
router.get("/categorias", async (req, res) => {
  try {
    const { fecha, tipo} = req.query; // recibe ?fecha=2025-06-01

    let query = `
      SELECT c.Nombre AS categoria, SUM(rg.Monto) AS total
      FROM Registro_Gastos rg
      JOIN Categoria_Gastos c ON rg.Id_Categoria = c.Id_Categoria
      WHERE 1=1
    `;
    let params = [];

    if (fecha) {
      query += " AND rg.Fecha = ?";
      params.push(fecha);
    }

    if (tipo) {
      query += " AND LOWER(c.Nombre) = LOWER(?)";
      params.push(tipo);
    }

    query += " GROUP BY c.Nombre";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error en GET /reportegastos/categorias:", error);
    res.status(500).json({ error: error.message });
  }

});

export default router;
