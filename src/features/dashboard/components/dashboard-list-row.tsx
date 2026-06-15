import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { getInitials } from "@/features/dashboard/utils/dashboard.utils";

type DashboardListRowProps = {
  href: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function DashboardListRow({
  href,
  title,
  subtitle,
  trailing,
}: DashboardListRowProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-muted/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted/30 text-xs font-medium text-muted-foreground">
        {getInitials(title)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
      </div>
    </Link>
  );
}
