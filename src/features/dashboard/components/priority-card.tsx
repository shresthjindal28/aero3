import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type PriorityCardProps = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "urgent" | "calm";
};

export function PriorityCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
}: PriorityCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      {href ? (
        <p className="mt-3 text-xs font-medium text-primary">View queue →</p>
      ) : null}
    </>
  );

  const className = cn(
    "block rounded-xl border bg-card/50 p-5 transition-colors",
    tone === "urgent" && "border-emerald-500/40 bg-emerald-500/5",
    tone === "calm" && "border-border/60",
    tone === "default" && "border-border/60",
    href && "hover:border-primary/30 hover:bg-card/80",
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
