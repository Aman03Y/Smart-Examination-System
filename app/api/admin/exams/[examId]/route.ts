import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Exam from "@/models/Exam";
import User from "@/models/User";

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
    const exam = await Exam.findById(params.examId);

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[EXAM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
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

    // Admin Auth Check
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const isAdmin =
      (dbUser && dbUser.role === "admin") ||
      (adminEmail && userEmail === adminEmail);

    if (!isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      duration,
      totalMarks,
      negativeMarking,
      status,
    } = body;

    const exam = await Exam.findByIdAndUpdate(
      params.examId,
      {
        title,
        description,
        duration,
        totalMarks,
        negativeMarking,
        status,
      },
      { new: true }
    );

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[EXAM_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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

    // Admin Auth Check
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const isAdmin =
      (dbUser && dbUser.role === "admin") ||
      (adminEmail && userEmail === adminEmail);

    if (!isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const exam = await Exam.findByIdAndDelete(params.examId);

    if (!exam) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json({ message: "Exam deleted" });
  } catch (error) {
    console.error("[EXAM_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
