import mongoose, { Schema, model, models } from "mongoose";

const ResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  answers: [
    {
      questionId: { type: Schema.Types.ObjectId, ref: "Question" },
      selectedOptionId: { type: Schema.Types.ObjectId }, // Assuming we want to track which option was selected
      isCorrect: { type: Boolean },
    },
  ],
  completedAt: { type: Date, default: Date.now },
});

const Result = models.Result || model("Result", ResultSchema);

export default Result;
