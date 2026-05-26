import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Question from "@/models/Question";
import User from "@/models/User";
import Exam from "@/models/Exam";

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

    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    const isAdmin =
      (dbUser && dbUser.role === "admin") ||
      (adminEmail && userEmail === adminEmail);

    if (!isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { text, options, marks } = body;

    if (!text || !options || options.length < 2 || !marks) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const question = await Question.create({
      examId: params.examId,
      text,
      options,
      marks,
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUESTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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

    // Check if exam exists? Optional but good practice.

    const questions = await Question.find({ examId: params.examId }).sort({
      createdAt: 1,
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("[QUESTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
