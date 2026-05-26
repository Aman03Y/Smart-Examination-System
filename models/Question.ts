import mongoose, { Schema, model, models } from "mongoose";

const QuestionSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  text: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  marks: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Question = models.Question || model("Question", QuestionSchema);

export default Question;
