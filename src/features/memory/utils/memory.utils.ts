import type { MemoryDocument, MemoryProfile } from "@/features/memory/types/memory.types";

export function formatSourceType(sourceType: MemoryDocument["source_type"]): string {
  const labels: Record<MemoryDocument["source_type"], string> = {
    transcript: "Visit transcript",
    soap_note: "SOAP note",
    consultation_document: "Consultation document",
    clinical_summary: "Clinical summary",
    doctor_note: "Doctor note",
  };
  return labels[sourceType] ?? sourceType;
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}% match`;
}

export function buildMemoryTimeline(documents: MemoryDocument[]) {
  return [...documents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      sourceType: doc.source_type,
      createdAt: doc.created_at,
      consultationId: doc.consultation_id,
    }));
}

export function hasPatientMemory(
  profile: MemoryProfile | undefined,
  documents: MemoryDocument[] | undefined,
): boolean {
  const hasSummary = Boolean(profile?.summary?.trim());
  const hasDocuments = (documents?.length ?? 0) > 0;
  return hasSummary || hasDocuments;
}
