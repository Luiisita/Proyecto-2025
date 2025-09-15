import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";


const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes); 


// Ruta básica 
app.get("/", (req, res) => {
  res.send("✅ Bienvenido a la API de Emprendly");
});


export default app;