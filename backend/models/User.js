import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  id: Number,
  name: String,
  status: {
    type: String,
    default: "no_cursada"
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, default: "Estudiante" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subjects: [subjectSchema]
});

export default mongoose.model("User", userSchema);