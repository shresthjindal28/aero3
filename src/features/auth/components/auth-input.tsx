import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-[0.9375rem] text-stone-900",
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
  );
});
AuthInput.displayName = "AuthInput";
