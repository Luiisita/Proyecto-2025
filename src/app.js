import express from "express";
import cors from "cors";
import inventarioRoutes from "./routes/inventario.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import reportegastosRoutes from "./routes/reportegastos.routes.js";
import registrogastosRoutes from "./routes/registrogastos.routes.js";
import userRoutes from "./routes/user.routes.js";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/inventario", inventarioRoutes);
app.use("/api", reportesRoutes);
app.use("/reportegastos", reportegastosRoutes);
app.use("/registrogastos", registrogastosRoutes);
app.use("/api/users", userRoutes); 

// Ruta básica
app.get("/", (req, res) => {
  res.send("✅ Bienvenido a la API de Emprendly");
});

export default app;