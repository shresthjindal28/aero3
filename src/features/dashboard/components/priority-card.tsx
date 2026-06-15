import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type PriorityCardProps = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  href?: string;
};

export function PriorityCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: PriorityCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-2.5 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {href ? (
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View queue
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "group block rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:border-border hover:shadow-md",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
