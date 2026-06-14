import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type AuthSubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

export function AuthSubmitButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[0.9375rem] font-medium text-white",
        "bg-teal-800 transition-colors duration-150",
        "hover:bg-teal-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:pointer-events-none disabled:opacity-60",
        "dark:bg-teal-700 dark:hover:bg-teal-600",
        "dark:focus-visible:ring-offset-stone-900",
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
