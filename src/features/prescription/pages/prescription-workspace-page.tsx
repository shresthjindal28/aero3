"use client";

import { PrescriptionWorkspace } from "@/features/prescription/components/prescription-workspace";

type PrescriptionWorkspacePageProps = {
  consultationId: string;
};

export function PrescriptionWorkspacePage({
  consultationId,
}: PrescriptionWorkspacePageProps) {
  return (
    <div className="h-full w-full min-w-0">
      <PrescriptionWorkspace consultationId={consultationId} />
    </div>
  );
}
