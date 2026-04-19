import express from "express";
import Career from "../models/Career.js";

const router = express.Router();

// GET /career/:slug
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