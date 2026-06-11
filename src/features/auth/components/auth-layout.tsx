import Link from "next/link";

import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils/cn";

type AuthLayoutProps = {
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

export function AuthLayout({
  title,
  description,
  children,
  footer,
  alternateLink,
  className,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-zinc-950">
              A
            </div>
            <span className="text-lg font-semibold tracking-tight">{appConfig.name}</span>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">
            Clinical intelligence, designed for focus.
          </h2>
          <p className="max-w-md text-sm text-zinc-400">
            Document consultations, generate structured notes, and retrieve patient
            context — all in one modern workspace.
          </p>
        </div>
        <p className="text-xs text-zinc-500">© {new Date().getFullYear()} {appConfig.name}</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className={cn("w-full max-w-md space-y-6", className)}>
          <div className="space-y-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              A
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
          {alternateLink ? (
            <p className="text-center text-sm text-muted-foreground">
              {alternateLink.label}{" "}
              <Link href={alternateLink.href} className="font-medium text-primary underline-offset-4 hover:underline">
                {alternateLink.linkText}
              </Link>
            </p>
          ) : null}
          {footer}
        </div>
      </div>
    </div>
  );
}
