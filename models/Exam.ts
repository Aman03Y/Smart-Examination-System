import mongoose, { Schema, model, models } from "mongoose";

const ExamSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, required: true },
  negativeMarking: { type: Number, default: 0 }, // per wrong answer
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Exam = models.Exam || model("Exam", ExamSchema);

export default Exam;
