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

    const attempt = await Attempt.findOne({
      userId: dbUser._id,
      examId: params.examId,
      status: "in-progress",
    });

    if (!attempt) {
      return new NextResponse("Attempt not found", { status: 404 });
    }

    // Increment violation count
    attempt.violationCount += 1;
    await attempt.save();

    return NextResponse.json({ violationCount: attempt.violationCount });
  } catch (error) {
    console.error("[EXAM_VIOLATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
