import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Exam from "@/models/Exam";
import User from "@/models/User";

export async function POST(req: NextRequest) {
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

    // Ensure dbUser exists if they are authenticated via Env Var
    let finalDbUser = dbUser;
    if (!finalDbUser && adminEmail && userEmail === adminEmail) {
      finalDbUser = await User.create({
        clerkId: user.id,
        email: userEmail,
        name: `${user.firstName} ${user.lastName}`,
        role: "admin",
      });
    }

    const body = await req.json();
    const { title, description, duration, totalMarks, negativeMarking } = body;

    const exam = await Exam.create({
      title,
      description,
      duration,
      totalMarks,
      negativeMarking,
      createdBy: finalDbUser._id,
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[EXAMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    // Admins see all exams, Students might see only published ones (logic handled in student module usually)
    // For this specific admin route, we return all
    const exams = await Exam.find({}).sort({ createdAt: -1 });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("[EXAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
