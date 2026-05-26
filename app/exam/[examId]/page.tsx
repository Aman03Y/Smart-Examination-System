"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, ShieldAlert, Maximize2 } from "lucide-react";

interface Option {
  _id: string;
  text: string;
}

interface Question {
  _id: string;
  text: string;
  options: Option[];
  marks: number;
}

interface Exam {
  _id: string;
  title: string;
  duration: number;
  totalMarks: number;
}

interface Attempt {
  startTime: string;
  violationCount: number;
  status: string;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId;

  // Data State
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Answers State
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId

  // Security State
  const [hasStarted, setHasStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  // Refs for listeners to access latest state
  const violationCountRef = useRef(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    violationCountRef.current = violationCount;
  }, [violationCount]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const submitExam = useCallback(async () => {
    if (submittingRef.current) return;
    setSubmitting(true);
    submittingRef.current = true; // Immediate ref update

    // Exit fullscreen cleanly if possible
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }

    const formatAnswers = Object.entries(answers).map(([qId, optId]) => ({
      questionId: qId,
      selectedOptionId: optId,
    }));

    try {
      const res = await fetch(`/api/student/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formatAnswers }),
      });

      if (res.ok) {
        toast.success("Exam submitted successfully!");
        router.push("/student");
      } else {
        const msg = await res.text();
        toast.error(msg);
        router.push("/student");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit exam. Please contact support.");
    }
  }, [answers, examId, router]); // Removed submitting from dep to avoid stale closure issues if called from event listener

  const logViolation = async () => {
    try {
      await fetch(`/api/student/exams/${examId}/violation`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to log violation", err);
    }
  };

  // Fetch Exam Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/student/exams/${examId}`);
        if (!res.ok) {
          if (res.status === 403) {
            toast.error("Exam already attempted");
            router.push("/student");
            return;
          }
          throw new Error("Failed to load exam");
        }
        const data = await res.json();
        setExam(data.exam);
        setQuestions(data.questions);

        // Handle existing attempt
        if (data.attempt) {
          const now = new Date();
          const start = new Date(data.attempt.startTime);
          const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
          const totalDuration = data.exam.duration * 60;
          const remaining = totalDuration - elapsed;

          setViolationCount(data.attempt.violationCount || 0);

          if (remaining <= 0) {
            // If time expired while away, submit immediately
            toast.error("Time has expired!");
            submitExam();
            return;
          }

          setTimeLeft(remaining);
          setHasStarted(true); // Auto-start if attempt exists
          toast.info("Resuming your exam attempt...");
        } else {
          // New exam
          setTimeLeft(data.exam.duration * 60);
        }
      } catch (err) {
        setError("Could not load exam. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, router, submitExam]);

  // Timer
  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !submitting) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hasStarted, submitting, submitExam]); // removed timeLeft dependency to avoid lag, but needed for logic? simplified

  // Security Enforcers
  useEffect(() => {
    if (!hasStarted || submitting) return;

    // Only check invalid state if we actually think we are supposed to be in fullscreen
    // But initially on resume we might not be.
    // So we need to handle "resuming" state where fullscreen might not be active yet.
    // For now, let's just trigger the listener logic.

    // 1. Fullscreen Change Listener
    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);

      if (!isFull && !submittingRef.current) {
        setViolationCount((v) => {
          const newVal = v + 1;
          logViolation(); // Log to server
          return newVal;
        });
        toast.warning(
          "WARNING: Fullscreen exited! logic will auto-submit if this continues."
        );
      }
    };

    // 2. Visibility Change (Tab Switching)
    const handleVisibilityChange = () => {
      if (document.hidden && !submittingRef.current) {
        setViolationCount((v) => {
          const newVal = v + 1;
          logViolation(); // Log to server
          return newVal;
        });
        toast.error(
          "WARNING: You left the exam tab. Your actions are being recorded."
        );
      }
    };

    // 3. Prevent Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 4. Before Unload (Refresh/Close)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submittingRef.current) {
        e.preventDefault();
        e.returnValue = ""; // Legacy requirement
      }
    };

    // 5. Block Back Button logic
    // We push states so back button just stays on page
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (!submittingRef.current) {
        window.history.pushState(null, "", window.location.href);
        toast.warning("Navigation is disabled during the exam.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasStarted, submitting, logViolation]);

  // Auto-submit on too many violations
  useEffect(() => {
    if (violationCount >= 3 && !submitting) {
      toast.error("Too many violations detected. Auto-submitting exam...");
      submitExam();
    }
  }, [violationCount, submitting, submitExam]);

  const startExam = async () => {
    try {
      await document.documentElement.requestFullscreen();

      // Call start API
      const res = await fetch(`/api/student/exams/${examId}/start`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to start exam session");
      }

      setIsFullScreen(true);
      setHasStarted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to start exam. Please ensure fullscreen is allowed.");
    }
  };

  const reEnterFullScreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Failed to enter fullscreen");
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Exam Environment...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-bold">{error}</div>
    );

  // ---------------- START SCREEN ----------------
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
          <ShieldAlert className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Secure Exam Environment
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            {exam?.title}
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-lg text-left text-sm space-y-2 mb-8 border border-amber-100 dark:border-amber-800">
            <p className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Strict Rules:
            </p>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              <li>Fullscreen mode is required.</li>
              <li>Do not switch tabs or windows.</li>
              <li>Do not reload the page.</li>
              <li>Do not use the back button.</li>
              <li>Right-click is disabled.</li>
            </ul>
            <p className="mt-2 font-bold">
              Any violation will be recorded. 3 violations will result in
              automatic submission.
            </p>
          </div>

          <button
            onClick={startExam}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-transform active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            I Agree & Start Exam
          </button>
        </div>
      </div>
    );
  }

  // ---------------- EXAM INTERFACE ----------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 select-none">
      {/* Violation Overlay if not in fullscreen */}
      {/* We add a check for hasStarted to ensure we don't show this prematurely if revalidating */}
      {hasStarted && !isFullScreen && !submitting && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full p-8 rounded-2xl text-center shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in duration-300">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Security Violation!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You have exited fullscreen mode. Your test is paused and this
              incident has been recorded.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Violation {violationCount}/3
            </p>
            <button
              onClick={reEnterFullScreen}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold w-full flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-5 h-5" />
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Header with Timer */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md shadow-sm dark:bg-slate-900/80 border-b border-indigo-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold truncate max-w-md dark:text-white">
          {exam?.title}
        </h1>
        <div className="flex items-center gap-4">
          {violationCount > 0 && (
            <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full border border-red-100 dark:border-red-800">
              Violations: {violationCount}
            </span>
          )}
          <div
            className={`text-xl font-mono font-bold tabular-nums px-3 py-1 rounded-md ${
              timeLeft < 300
                ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8 mt-16">
        {questions.map((q, index) => (
          <div
            key={q._id}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white select-text">
                <span className="mr-2 text-slate-500 font-bold">
                  Q{index + 1}
                </span>
                {q.text}
              </h3>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                {q.marks} Marks
              </span>
            </div>

            <div className="space-y-3">
              {q.options.map((opt) => (
                <label
                  key={opt._id}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    answers[q._id] === opt._id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-500/50"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                      answers[q._id] === opt._id
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {answers[q._id] === opt._id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Hidden Input for A11y */}
                  <input
                    type="radio"
                    name={`question-${q._id}`}
                    value={opt._id}
                    checked={answers[q._id] === opt._id}
                    onChange={() => handleOptionSelect(q._id, opt._id)}
                    className="sr-only"
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    {opt.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center max-w-3xl mx-auto w-full">
          <div className="text-sm text-slate-500 hidden sm:block">
            {Object.keys(answers).length} of {questions.length} Answered
          </div>

          <button
            onClick={submitExam}
            disabled={submitting}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {submitting ? "Submitting Exam..." : "Submit Answers"}
          </button>
        </div>
      </main>
    </div>
  );
}
