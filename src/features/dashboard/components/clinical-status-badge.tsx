import type { ConsultationStatus } from "@/types/domain/enums";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLES: Record<ConsultationStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  scheduled: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  active: "In progress",
  scheduled: "Waiting",
  completed: "Completed",
  cancelled: "Cancelled",
};

type ClinicalStatusBadgeProps = {
  status: ConsultationStatus;
  className?: string;
};

export function ClinicalStatusBadge({ status, className }: ClinicalStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
