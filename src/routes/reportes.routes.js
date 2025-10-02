// src/routes/reportes.routes.js
import { Router } from "express";
import { getVentasMensuales, getSemanaEspecifica, getVentasAnuales, getGananciasDiarias } from "../controllers/reportes.controller.js";


const router = Router();

router.get("/ventas_mensuales", getVentasMensuales);

router.get("/semana_especifica", getSemanaEspecifica);

router.get("/ventas_anuales", getVentasAnuales);

router.get("/ganancias/diario/:fecha", getGananciasDiarias);

export default router;
