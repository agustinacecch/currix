import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  id: Number,
  status: {
    type: String,
    default: "no_cursada"
  }
});

const careerProgressSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  subjects: [subjectSchema]
});

const userSchema = new mongoose.Schema({
  username: { type: String, default: "Estudiante" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  careers: [careerProgressSchema]   // multi-career progress, one entry per career
});

export default mongoose.model("User", userSchema);