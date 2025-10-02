import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { getUsers, getUser, addUser, editUser, deleteUser } from "../controllers/user.controller.js";
const router = express.Router();


router.post("/register", registerUser);


// Ruta login
router.post("/login", loginUser);


// Ejemplo de ruta protegida
router.get("/perfil", verificarToken, (req, res) => {
  res.json({ message: "Perfil del usuario", user: req.user });
});

router.get("/", getUsers);          // GET all
router.get("/:id", getUser);       // GET one
router.post("/", addUser);         // CREATE
router.put("/:id", editUser);      // UPDATE
router.delete("/:id", deleteUser); // DELETE

export default router;
