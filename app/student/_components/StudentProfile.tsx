"use client";

import { UserButton } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

interface StudentProfileProps {
  name: string;
  email: string;
}

export default function StudentProfile({ name, email }: StudentProfileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent) => {
    // Prevent infinite loop if clicking the trigger itself
    if ((e.target as HTMLElement).closest("button")) return;

    // Find and click the hidden trigger
    const userButtonContainer = containerRef.current?.querySelector(
      ".pointer-events-none"
    );
    const trigger = userButtonContainer?.querySelector("button") as HTMLElement;
    trigger?.click();
  };

  return (
    <div
      ref={containerRef}
      className="flex w-fit items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors group select-none"
      onClick={handleContainerClick}
    >
      <div className="pointer-events-none">
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="flex flex-col flex-1 min-w-0 text-left">
        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {name}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
          Student
        </span>
      </div>

      <div className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300">
        <ChevronDown size={16} />
      </div>
    </div>
  );
}
