import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import careerRoutes from "./routes/career.js"; // 👈 IMPORTANTE
import User from "./models/User.js";
import authMiddleware from "./middleware/auth.js";

// 🔥 cargar variables de entorno PRIMERO
dotenv.config();

const app = express();
const PORT = 3000;

// 🔹 middleware global
app.use(cors());
app.use(express.json());

// 🔹 rutas
app.use("/auth", authRoutes);
app.use("/career", careerRoutes); // 👈 ESTA LÍNEA TE FALTABA

// 🔹 perfil usuario logueado
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 debug env
console.log("MONGO_URL:", process.env.MONGO_URL);

// 🔥 conexión a Mongo
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("🟢 MongoDB conectado");
  })
  .catch((err) => {
    console.log("🔴 Mongo error:", err.message);
  });

// 🔹 servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});