import Link from "next/link";
import { Stethoscope } from "lucide-react";

import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type EmptyConsultationsStateProps = {
  patientId?: string;
};

export function EmptyConsultationsState({ patientId }: EmptyConsultationsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Stethoscope className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">No consultations yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Start a consultation to document chief complaints and move into sessions,
        transcripts, and clinical notes.
      </p>
      {patientId ? (
        <Button asChild className="mt-6">
          <Link href={routes.app.patientConsultationNew(patientId)}>
            Start new consultation
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
