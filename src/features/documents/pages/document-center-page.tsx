"use client";

import { DocumentCenter } from "@/features/documents/components/document-center";

type DocumentCenterPageProps = {
  patientId: string;
};

export function DocumentCenterPage({ patientId }: DocumentCenterPageProps) {
  return <DocumentCenter patientId={patientId} />;
}
