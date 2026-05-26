import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import AdminLink from "./_components/AdminLink";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            ExamSys
          </span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Smart{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Online Examination
            </span>{" "}
            System
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A secure, scalable, and automated platform for conducting online
            exams and evaluations. Seamless experiences for both students and
            administrators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/student"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              For Students
            </Link>
            <AdminLink className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">
              For Administrators
            </AdminLink>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="h-10 w-10 text-indigo-600 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Secure & Reliable
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Role-based access control and timed examinations ensure
                integrity.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <span className="text-4xl mb-4 block">⚡</span>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Instant Results
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Automated evaluation provides immediate feedback and scoring.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <span className="text-4xl mb-4 block">📊</span>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Comprehensive Stats
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Detailed analytics for administrators to track performance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-600 border-t border-slate-100 dark:border-slate-900">
        &copy; {new Date().getFullYear()} Smart Examination System. All rights
        reserved.
      </footer>
    </div>
  );
}
