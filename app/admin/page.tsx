import connectDB from "@/lib/db";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import User from "@/models/User";

export default async function AdminDashboard() {
  await connectDB();

  const examCount = await Exam.countDocuments();
  // This might be slow if there are many questions, but for now it's fine
  const questionCount = await Question.countDocuments();
  const studentCount = await User.countDocuments({ role: "student" });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Dashboard
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow dark:bg-slate-800 dark:border-slate-700 dark:text-white p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Exams
          </div>
          <div className="text-2xl font-bold">{examCount}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow dark:bg-slate-800 dark:border-slate-700 dark:text-white p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Questions
          </div>
          <div className="text-2xl font-bold">{questionCount}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow dark:bg-slate-800 dark:border-slate-700 dark:text-white p-6">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Students
          </div>
          <div className="text-2xl font-bold">{studentCount}</div>
        </div>
      </div>
    </div>
  );
}
