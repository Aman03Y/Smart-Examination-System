import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Attempt from "@/models/Attempt";
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

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if attempt already exists
    let attempt = await Attempt.findOne({
      userId: dbUser._id,
      examId: params.examId,
    });

    if (attempt) {
      return NextResponse.json(attempt);
    }

    // Create new attempt
    attempt = await Attempt.create({
      userId: dbUser._id,
      examId: params.examId,
      startTime: new Date(),
      status: "in-progress",
    });

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("[EXAM_START]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
