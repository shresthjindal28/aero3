import { ApprovalBadge } from "@/features/soap/components/approval-badge";
import type { Consultation } from "@/features/consultations/types/consultation.types";
import type { SoapNote } from "@/features/soap/types/soap.types";
import { formatDateTime } from "@/lib/utils/date";

type SoapHeaderProps = {
  patientName: string;
  consultation: Consultation;
  soap: SoapNote | null | undefined;
  isDirty: boolean;
  isSaving: boolean;
};

export function SoapHeader({
  patientName,
  consultation,
  soap,
  isDirty,
  isSaving,
}: SoapHeaderProps) {
  const consultationLabel = consultation.chief_complaint ?? "Consultation";

  return (
    <header className="border-b border-border/60 bg-card/40 px-6 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{patientName}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {consultationLabel}
          </h1>
          <p className="text-sm text-muted-foreground">SOAP workspace</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ApprovalBadge soap={soap} />
          <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">
            {isSaving ? "Saving…" : isDirty ? "Unsaved changes" : "All changes saved"}
          </span>
          {soap?.updated_at ? (
            <span className="text-xs text-muted-foreground">
              Updated {formatDateTime(soap.updated_at)}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
