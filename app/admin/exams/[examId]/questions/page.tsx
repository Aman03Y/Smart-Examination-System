import Link from "next/link";
import { Plus } from "lucide-react";
import connectDB from "@/lib/db";
import Question from "@/models/Question";
import Exam from "@/models/Exam";

export default async function ExamQuestionsPage(props: {
  params: Promise<{ examId: string }>;
}) {
  const params = await props.params;
  await connectDB();
  const exam = await Exam.findById(params.examId);
  const questions = await Question.find({ examId: params.examId }).sort({
    createdAt: 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Questions for: {exam?.title}
        </h2>
        <Link
          href={`/admin/exams/${params.examId}/questions/create`}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Link>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-700">
              <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800">
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Question Text
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Marks
                </th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 dark:text-slate-400">
                  Options
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="h-24 text-center">
                    No questions found.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr
                    key={q._id}
                    className="border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  >
                    <td className="p-4 align-middle">{q.text}</td>
                    <td className="p-4 align-middle">{q.marks}</td>
                    <td className="p-4 align-middle">{q.options.length}</td>
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
