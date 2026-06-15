import type { ConsultationStatus } from "@/types/domain/enums";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLES: Record<ConsultationStatus, string> = {
  active: "border-border/60 bg-muted/40 text-foreground",
  scheduled: "border-border/60 bg-muted/40 text-muted-foreground",
  completed: "border-border/60 bg-muted/30 text-muted-foreground",
  cancelled: "border-destructive/20 bg-destructive/5 text-destructive",
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
        "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
