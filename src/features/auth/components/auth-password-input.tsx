"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const AuthPasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          "flex h-11 w-full rounded-lg border border-stone-200 bg-stone-50/50 py-2 pl-3 pr-11 text-[0.9375rem] text-stone-900",
          "placeholder:text-stone-400",
          "transition-colors duration-150",
          "focus-visible:border-teal-700 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-700/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-500",
          "dark:focus-visible:border-teal-600 dark:focus-visible:bg-stone-800 dark:focus-visible:ring-teal-600/25",
          className,
        )}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className={cn(
          "absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md",
          "text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30",
          "dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-100",
        )}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
AuthPasswordInput.displayName = "AuthPasswordInput";
