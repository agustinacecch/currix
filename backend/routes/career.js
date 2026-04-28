import express from "express";
import Career from "../models/Career.js";

const router = express.Router();

// 🔥 PRIMERO la ruta raíz
router.get("/", async (req, res) => {
  try {
    const careers = await Career.find({}, "slug name university faculty");
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔥 DESPUÉS la dinámica
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const career = await Career.findOne({ slug });

    if (!career) {
      return res.status(404).json({ message: "Career not found" });
    }

    res.json(career);
  } catch (error) {
    console.error("Error getting career:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;