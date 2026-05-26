import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import StudentProfile from "./_components/StudentProfile";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/student" className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  ExamSys Student
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              {user && (
                <StudentProfile
                  name={user.firstName || user.emailAddresses[0].emailAddress}
                  email={user.emailAddresses[0].emailAddress}
                />
              )}
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
