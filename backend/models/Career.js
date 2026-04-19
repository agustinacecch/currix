import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  id: { type: Number, required: true },   // 👈 ahora number
  name: { type: String, required: true },
  year: Number,
  cuatri: mongoose.Schema.Types.Mixed,    // 👈 puede ser 1, 2 o "anual"
  hours: Number,
  correlatives: [Number]                  // 👈 ahora number[]
});

const careerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  university: String,
  faculty: String,
  durationYears: Number,
  subjects: [subjectSchema]
});

export default mongoose.model("Career", careerSchema);