import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// TEST
router.get("/", (req, res) => {
  res.send("Auth funcionando");
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      subjects: []
    });

    await newUser.save();

    res.json({ message: "Usuario creado correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secreto123",
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ========================
// 🔥 SAVE SUBJECTS (PROGRESO)
// ========================
router.post("/subjects", async (req, res) => {
  try {
    const { subjects } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, "secreto123");

    const userId = decoded.id;

    // SOLO guardamos progreso (status)
    const cleanSubjects = subjects.map(s => ({
      id: s.id,
      status: s.status
    }));

    const user = await User.findByIdAndUpdate(
      userId,
      { subjects: cleanSubjects },
      { new: true }
    );

    res.json({
      message: "Subjects actualizados",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;