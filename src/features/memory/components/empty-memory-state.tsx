import Link from "next/link";
import { Brain } from "lucide-react";

import { routes } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/primitives/button";

type EmptyMemoryStateProps = {
  patientId: string;
  patientName?: string;
};

export function EmptyMemoryState({ patientId, patientName }: EmptyMemoryStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Brain className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">No clinical memory yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {patientName
          ? `AIRO has not recorded any memory for ${patientName} yet.`
          : "AIRO has not recorded any memory for this patient yet."}{" "}
        Memory builds automatically as you complete consultations, add notes, and
        generate clinical summaries.
      </p>
      <Button asChild className="mt-6">
        <Link href={routes.app.patientConsultationNew(patientId)}>
          Start a consultation
        </Link>
      </Button>
    </div>
  );
}
