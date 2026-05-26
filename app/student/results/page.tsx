import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import User from "@/models/User";

export default async function StudentResultsPage() {
  const user = await currentUser();
  if (!user) return null;

  await connectDB();
  const dbUser = await User.findOne({ clerkId: user.id });
  if (!dbUser) return null;

  const results = await Result.find({ userId: dbUser._id })
    .populate("examId")
    .sort({ completedAt: -1 });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Results
        </h1>
        <Link
          href="/student"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <tr className="border-b transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Exam Title
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Date Taken
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Score
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 p-2">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-24 text-center text-slate-500">
                    No results found.
                  </td>
                </tr>
              ) : (
                results.map((result) => {
                  const percentage = Math.round(
                    (result.score / result.totalMarks) * 100
                  );
                  return (
                    <tr
                      key={result._id}
                      className="border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-4 align-middle font-medium">
                        {result.examId?.title || "Unknown Exam"}
                      </td>
                      <td className="p-4 align-middle">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle font-medium">
                        {result.score} / {result.totalMarks}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            percentage >= 70
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : percentage >= 40
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
