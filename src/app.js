import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/users", userRoutes); // 👈 montar el router de usuarios

// Ruta básica para que no salga "Cannot GET /"
app.get("/", (req, res) => {
  res.send("✅ Bienvenido a la API de Emprendly");
});

export default app;