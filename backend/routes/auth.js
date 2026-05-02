import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const SECRET = "secreto123";

// TEST
router.get("/", (req, res) => {
  res.send("Auth funcionando");
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, guestCareers } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username || "Estudiante",
      email,
      password: hashedPassword,
      careers: guestCareers || []
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

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// 🔥 SAVE SUBJECTS (PROGRESO) — per career
// ========================
router.post("/subjects", async (req, res) => {
  try {
    const { subjects, careerSlug } = req.body;

    if (!careerSlug) {
      return res.status(400).json({ message: "careerSlug requerido" });
    }

    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.id;

    const cleanSubjects = subjects.map(s => ({
      id: s.id,
      status: s.status
    }));

    const user = await User.findById(userId);
    const careerIdx = user.careers.findIndex(c => c.slug === careerSlug);

    if (careerIdx >= 0) {
      user.careers[careerIdx].subjects = cleanSubjects;
    } else {
      user.careers.push({ slug: careerSlug, subjects: cleanSubjects });
    }

    await user.save();
    res.json({ message: "Subjects actualizados" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// 🔥 REGISTER A CAREER (sin borrar progreso)
// ========================
router.post("/career", async (req, res) => {
  try {
    const { careerSlug } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    const exists = user.careers.some(c => c.slug === careerSlug);

    if (!exists) {
      user.careers.push({ slug: careerSlug, subjects: [] });
      await user.save();
    }

    res.json({ message: "Carrera registrada" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;