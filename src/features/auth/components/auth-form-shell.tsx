import Link from "next/link";

import { AuthThemeToggle } from "@/features/auth/components/auth-theme-toggle";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils/cn";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  alternateLink?: {
    label: string;
    href: string;
    linkText: string;
  };
  className?: string;
};

export function AuthFormShell({
  title,
  description,
  children,
  footer,
  alternateLink,
  className,
}: AuthFormShellProps) {
  return (
    <div className="relative flex min-h-[min(100vh,900px)] flex-col bg-[#f7f5f2] lg:min-h-screen dark:bg-[#1a1f1e]">
      <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
        <p className="font-serif text-lg text-stone-800 lg:hidden dark:text-stone-200">
          {appConfig.name}
        </p>
        <AuthThemeToggle className="ml-auto" />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-10 pt-6 sm:px-10 sm:pb-14">
        <div className={cn("w-full max-w-[400px]", className)}>
          <div className="rounded-2xl border border-stone-200/80 bg-white/90 p-8 shadow-[0_1px_3px_rgba(28,43,42,0.06)] backdrop-blur-sm dark:border-stone-700/60 dark:bg-stone-900/80 dark:shadow-none sm:p-9">
            <div className="mb-8 space-y-2">
              <h1 className="font-serif text-[1.65rem] leading-tight text-stone-900 dark:text-stone-50">
                {title}
              </h1>
              <p className="text-[0.9375rem] leading-relaxed text-stone-600 dark:text-stone-400">
                {description}
              </p>
            </div>

            <div className="space-y-6">{children}</div>

            {alternateLink ? (
              <p className="mt-8 text-center text-sm text-stone-600 dark:text-stone-400">
                {alternateLink.label}{" "}
                <Link
                  href={alternateLink.href}
                  className="font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-4 transition-colors hover:text-teal-900 hover:decoration-teal-800 dark:text-teal-400 dark:decoration-teal-400/30 dark:hover:text-teal-300"
                >
                  {alternateLink.linkText}
                </Link>
              </p>
            ) : null}

            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
