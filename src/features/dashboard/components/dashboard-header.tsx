import { CalendarDays } from "lucide-react";

import {
  formatDashboardDate,
  getTimeOfDayGreeting,
} from "@/features/dashboard/utils/dashboard.utils";

type DashboardHeaderProps = {
  doctorName?: string;
};

export function DashboardHeader({ doctorName }: DashboardHeaderProps) {
  const greeting = getTimeOfDayGreeting();
  const today = formatDashboardDate();
  const firstName = doctorName?.split(/\s+/)[0];

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          {greeting}
          {firstName ? `, Dr. ${firstName}` : ""}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Today&apos;s practice
        </h1>
        <p className="text-sm text-muted-foreground">
          A focused view of visits, notes, and patients that need your attention.
        </p>
      </div>

      <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span>{today}</span>
      </div>
    </header>
  );
}
