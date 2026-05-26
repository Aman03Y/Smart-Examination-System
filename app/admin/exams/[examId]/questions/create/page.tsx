"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

export default function CreateQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId;

  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    const newOptions = [...options];
    if (field === "isCorrect") {
      // If single choice, reset others. For now assuming single correct answer mostly, but structure allows multiple.
      // Let's implement single choice behavior for radio buttons look, but keep structure generic.
      // If we want multiple correct answers, we use checkboxes. Let's assume single correct for now as per typical exam.
      newOptions.forEach((opt, i) => {
        // @ts-ignore
        opt.isCorrect = i === index ? value : false;
      });
    } else {
      // @ts-ignore
      newOptions[index][field] = value;
    }
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!questionText.trim()) {
      setError("Question text is required");
      setLoading(false);
      return;
    }
    if (options.some((opt) => !opt.text.trim())) {
      setError("All options must have text");
      setLoading(false);
      return;
    }
    if (!options.some((opt) => opt.isCorrect)) {
      setError("Select at least one correct answer");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/exams/${examId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: questionText,
          marks,
          options,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create question");
      }

      router.push(`/admin/exams/${examId}/questions`);
      router.refresh();
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Add Question
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Marks
          </label>
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            required
            min="1"
            className="mt-1 block w-full sm:w-1/4 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="radio"
                name="correctOption"
                checked={option.isCorrect}
                onChange={(e) =>
                  handleOptionChange(index, "isCorrect", e.target.checked)
                }
                className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) =>
                  handleOptionChange(index, "text", e.target.value)
                }
                placeholder={`Option ${index + 1}`}
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Option
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
        >
          {loading ? "Saving..." : "Save Question"}
        </button>
      </form>
    </div>
  );
}
