import connectDB from "@/lib/db";
import Result from "@/models/Result";
import User from "@/models/User"; // Ensure models are registered
import Exam from "@/models/Exam";
import { format } from "date-fns";

export default async function AdminResultsPage() {
  await connectDB();

  // Populate user and exam details
  const results = await Result.find({})
    .populate("userId", "name email")
    .populate("examId", "title totalMarks")
    .sort({ completedAt: -1 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          All Results
        </h2>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-700">
              <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800">
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Student
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Exam
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Score
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Percentage
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    No results found.
                  </td>
                </tr>
              ) : (
                results.map((result) => {
                  const studentName = result.userId?.name || "Unknown Student";
                  const studentEmail = result.userId?.email || "";
                  const examTitle = result.examId?.title || "Deleted Exam";
                  const totalMarks =
                    result.examId?.totalMarks || result.totalMarks; // Fallback to stored total marks
                  const percentage = Math.round(
                    (result.score / totalMarks) * 100
                  );

                  return (
                    <tr
                      key={result._id}
                      className="border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-4 align-middle">
                        <div className="font-medium">{studentName}</div>
                        <div className="text-xs text-slate-500">
                          {studentEmail}
                        </div>
                      </td>
                      <td className="p-4 align-middle">{examTitle}</td>
                      <td className="p-4 align-middle font-semibold">
                        {result.score} / {totalMarks}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            percentage >= 50
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        {result.completedAt
                          ? format(new Date(result.completedAt), "PPP p")
                          : "N/A"}
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
