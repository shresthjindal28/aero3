import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type DashboardPanelProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {actionLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="flex-1 p-2 sm:p-3">{children}</div>
    </section>
  );
}
