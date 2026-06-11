"use client";

import { SoapWorkspace } from "@/features/soap/components/soap-workspace";

type SoapWorkspacePageProps = {
  consultationId: string;
};

export function SoapWorkspacePage({ consultationId }: SoapWorkspacePageProps) {
  return <SoapWorkspace consultationId={consultationId} />;
}
