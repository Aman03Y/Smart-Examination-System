import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Exam from "@/models/Exam";
import Result from "@/models/Result"; // Check for attempted exams
import User from "@/models/User";

export default async function StudentDashboard() {
  const user = await currentUser();
  if (!user) return null; // Should be handled by middleware/layout

  await connectDB();

  // Ensure user exists in DB
  const dbUser = await User.findOne({ clerkId: user.id });
  if (!dbUser) {
    await User.create({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: "student",
    });
  }

  // Fetch all published exams
  const exams = await Exam.find({ status: "published" }).sort({ createdAt: -1 });

  // Get results for this user to check attempts
  // Ideally, we'd do a better query or aggregation, but for < 100 exams this is fine
  const results = await Result.find({ userId: dbUser?._id });
  const attemptedExamIds = new Set(results.map((r) => r.examId.toString()));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Student Dashboard
      </h1>
      <p className="text-slate-500 dark:text-slate-400">Available Exams</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => {
          const isAttempted = attemptedExamIds.has(exam._id.toString());
          return (
            <div
              key={exam._id}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
            >
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                  {exam.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {exam.description || "No description provided."}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{exam.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📝</span>
                    <span>{exam.totalMarks} marks</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {isAttempted ? (
                  <Link
                    href="/student/results"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  >
                    View Result
                  </Link>
                ) : (
                  <Link
                    href={`/exam/${exam._id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Start Exam
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {exams.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No exams available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
