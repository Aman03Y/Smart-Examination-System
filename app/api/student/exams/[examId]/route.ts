import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import Result from "@/models/Result";
import User from "@/models/User";
import Attempt from "@/models/Attempt";

export async function GET(
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

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // specific exam
    const exam = await Exam.findById(params.examId);
    if (!exam) {
      return new NextResponse("Exam not found", { status: 404 });
    }

    // Check if already attempted (completed)
    const existingResult = await Result.findOne({
      userId: dbUser._id,
      examId: params.examId,
    });
    if (existingResult) {
      return new NextResponse("Exam already attempted", { status: 403 });
    }

    const questions = await Question.find({ examId: params.examId }).select(
      "-options.isCorrect"
    );

    // Check for an ongoing attempt
    const attempt = await Attempt.findOne({
      userId: dbUser._id,
      examId: params.examId,
    });

    return NextResponse.json({ exam, questions, attempt });
  } catch (error) {
    console.error("[STUDENT_EXAM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
