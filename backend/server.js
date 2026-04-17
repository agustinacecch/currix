import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import User from "./models/User.js";
import authMiddleware from "./middleware/auth.js";

// 🔥 cargar variables de entorno PRIMERO
dotenv.config();

const app = express();
const PORT = 3000;

// middleware global
app.use(cors());
app.use(express.json());

// rutas auth
app.use("/auth", authRoutes);

// perfil usuario logueado
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 debug (para ver si .env está bien)
console.log("MONGO_URL:", process.env.MONGO_URL);

// 🔥 conexión a Mongo (UNA SOLA VEZ)
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("🟢 MongoDB conectado");
  })
  .catch((err) => {
    console.log("🔴 Mongo error:", err.message);
  });

// servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});