import type { MemoryDocument, MemorySourceType } from "@/features/memory/types/memory.types";

export const SOURCE_LABELS: Record<MemorySourceType, string> = {
  transcript: "Transcript",
  soap_note: "SOAP Note",
  consultation_document: "Document",
  clinical_summary: "Clinical Summary",
  doctor_note: "Doctor Note",
};

export function formatSourceType(type: MemorySourceType): string {
  return SOURCE_LABELS[type] ?? type;
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function buildMemoryTimeline(documents: MemoryDocument[]) {
  return [...documents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      sourceType: doc.source_type,
      createdAt: doc.created_at,
      consultationId: doc.consultation_id,
    }));
}
