"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserRole } from "../actions/auth";

interface AdminLinkProps {
  className?: string;
  children: React.ReactNode;
}

export default function AdminLink({ className, children }: AdminLinkProps) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const { isAuthenticated, role } = await getUserRole();

      if (!isAuthenticated) {
        // If not authenticated, let them go to admin page which will redirect to login
        router.push("/admin");
        return;
      }

      if (role === "student") {
        toast.error("Please sign in with an administrator account.");
        return;
      }

      // If admin, proceed
      router.push("/admin");
    } catch (error) {
      console.error("Failed to check role:", error);
      // Fallback: try to navigate anyway
      router.push("/admin");
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
