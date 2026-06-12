"use client";

import { PrescriptionWorkspace } from "@/features/prescription/components/prescription-workspace";

type PrescriptionWorkspacePageProps = {
  consultationId: string;
};

export function PrescriptionWorkspacePage({
  consultationId,
}: PrescriptionWorkspacePageProps) {
  return <PrescriptionWorkspace consultationId={consultationId} />;
}
