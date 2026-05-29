import { currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import User from "@/models/User";
import connectDB from "@/lib/db";
import Link from "next/link";
import AdminProfile from "@/app/admin/_components/AdminProfile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await connectDB();

  // Check if user is admin via DB role OR Environment Variable (Hardcoded Admin)
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.emailAddresses[0]?.emailAddress;

  const dbUser = await User.findOne({ clerkId: user.id });

  const isAdmin =
    (dbUser && dbUser.role === "admin") ||
    (adminEmail && userEmail === adminEmail);

  if (!isAdmin) {
    // Redirect to student dashboard or home if not admin
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between h-screen sticky top-0">
        <div>
          <div className="p-6">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Admin Portal
            </h1>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/exams"
              className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Exams
            </Link>
            {/* Question Bank Link Removed - Managed via Exams */}
            <Link
              href="/admin/results"
              className="block px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Results
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <AdminProfile
            name={user.firstName || user.emailAddresses[0].emailAddress}
            email={user.emailAddresses[0].emailAddress}
          />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
