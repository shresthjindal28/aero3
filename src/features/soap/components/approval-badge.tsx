import { CheckCircle2, FileEdit } from "lucide-react";

import type { SoapNote } from "@/features/soap/types/soap.types";
import { cn } from "@/lib/utils/cn";

type ApprovalBadgeProps = {
  soap: SoapNote | null | undefined;
};

export function ApprovalBadge({ soap }: ApprovalBadgeProps) {
  const isApproved = Boolean(soap?.approved_by_doctor);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        isApproved
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      {isApproved ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <FileEdit className="h-3 w-3" />
      )}
      {isApproved ? "Approved" : "Draft"}
    </span>
  );
}
