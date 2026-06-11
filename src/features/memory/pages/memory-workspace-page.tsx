"use client";

import { MemoryWorkspace } from "@/features/memory/components/memory-workspace";

type MemoryWorkspacePageProps = {
  patientId: string;
};

export function MemoryWorkspacePage({ patientId }: MemoryWorkspacePageProps) {
  return <MemoryWorkspace patientId={patientId} />;
}
