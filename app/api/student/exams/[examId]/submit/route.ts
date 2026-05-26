import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import Result from "@/models/Result";
import User from "@/models/User";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ examId: string }> }
) {
  const params = await props.params;
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    const body = await req.json();
    const { answers } = body; // Array of { questionId, selectedOptionId }

    // Double check if already attempted to prevent duplicate submissions
    const existingResult = await Result.findOne({
      userId: dbUser._id,
      examId: params.examId,
    });
    if (existingResult) {
      return new NextResponse("Exam already attempted", { status: 403 });
    }

    const exam = await Exam.findById(params.examId);
    if (!exam) return new NextResponse("Exam not found", { status: 404 });

    const questions = await Question.find({ examId: params.examId });

    let score = 0;
    const processedAnswers = [];

    for (const q of questions) {
      const submittedAnswer = answers.find(
        (a: any) => a.questionId === q._id.toString()
      );
      let isCorrect = false;

      if (submittedAnswer) {
        // Find the correct option in DB
        const correctOption = q.options.find((opt: any) => opt.isCorrect);
        // Check if user selected matches correct option ID or text?
        // Since we didn't send IDs per option explicitly to client (mongoose subdocs have IDs), we can use IDs.
        // Client receives options with _id.

        if (submittedAnswer.selectedOptionId === correctOption._id.toString()) {
          score += q.marks;
          isCorrect = true;
        } else {
          score -= exam.negativeMarking || 0;
        }
      }

      processedAnswers.push({
        questionId: q._id,
        selectedOptionId: submittedAnswer?.selectedOptionId,
        isCorrect,
      });
    }

    const result = await Result.create({
      userId: dbUser._id,
      examId: exam._id,
      score,
      totalMarks: exam.totalMarks,
      answers: processedAnswers,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[STUDENT_EXAM_SUBMIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
