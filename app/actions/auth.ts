"use server";

import { currentUser } from "@clerk/nextjs/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function getUserRole() {
  const user = await currentUser();

  if (!user) {
    return { isAuthenticated: false, role: null };
  }

  await connectDB();

  // Check if user is hardcoded admin via env
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.emailAddresses[0]?.emailAddress;

  if (adminEmail && userEmail === adminEmail) {
    return { isAuthenticated: true, role: "admin" };
  }

  const dbUser = await User.findOne({ clerkId: user.id });

  if (dbUser) {
    return { isAuthenticated: true, role: dbUser.role };
  }

  return { isAuthenticated: true, role: "student" }; // Default to student if not found but authenticated
}
