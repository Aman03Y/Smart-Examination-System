import Link from "next/link";
import { Plus } from "lucide-react";
import connectDB from "@/lib/db";
import Exam from "@/models/Exam";

export default async function ExamListPage() {
  await connectDB();
  const exams = await Exam.find({}).sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Exams
        </h2>
        <Link
          href="/admin/exams/create"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 dark:focus-visible:ring-slate-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Exam
        </Link>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-700">
              <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800">
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Title
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Duration (mins)
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Total Marks
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    No exams found.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr
                    key={exam._id}
                    className="border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      {exam.title}
                    </td>
                    <td className="p-4 align-middle">{exam.duration}</td>
                    <td className="p-4 align-middle">{exam.totalMarks}</td>
                    <td className="p-4 align-middle capitalize">
                      {exam.status}
                    </td>
                    <td className="p-4 align-middle">
                      <Link
                        href={`/admin/exams/${exam._id}`}
                        className="text-blue-600 hover:underline mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/exams/${exam._id}/questions`}
                        className="text-blue-600 hover:underline"
                      >
                        Questions
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
