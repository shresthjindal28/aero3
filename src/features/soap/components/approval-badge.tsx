import { CheckCircle2, FileEdit } from "lucide-react";

import type { SoapNote } from "@/features/soap/types/soap.types";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

type ApprovalBadgeProps = {
  soap: SoapNote | null | undefined;
};

export function ApprovalBadge({ soap }: ApprovalBadgeProps) {
  const isApproved = Boolean(soap?.approved_by_doctor);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        isApproved
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400",
      )}
    >
      {isApproved ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <FileEdit className="h-3.5 w-3.5" />
      )}
      <span>{isApproved ? "Approved" : "Draft"}</span>
      {isApproved && soap?.approved_at ? (
        <span className="text-muted-foreground">
          · {formatDateTime(soap.approved_at)}
        </span>
      ) : null}
    </div>
  );
}
