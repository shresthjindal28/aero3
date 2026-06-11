import { cn } from "@/lib/utils/cn";
import { formatConsultationStatus } from "@/features/consultations/utils/consultation.utils";
import type { ConsultationStatus } from "@/types/domain/enums";

const statusStyles: Record<ConsultationStatus, string> = {
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

type ConsultationStatusBadgeProps = {
  status: ConsultationStatus;
  className?: string;
};

export function ConsultationStatusBadge({
  status,
  className,
}: ConsultationStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {formatConsultationStatus(status)}
    </span>
  );
}
