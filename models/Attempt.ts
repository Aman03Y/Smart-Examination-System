import mongoose, { Schema, model, models } from "mongoose";

const AttemptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
  },
  startTime: { type: Date, default: Date.now },
  violationCount: { type: Number, default: 0 },
  // Optional: We could store temporary answers here too
});

// Composite unique index to ensure one active attempt per user per exam
AttemptSchema.index({ userId: 1, examId: 1 }, { unique: true });

const Attempt = models.Attempt || model("Attempt", AttemptSchema);

export default Attempt;
